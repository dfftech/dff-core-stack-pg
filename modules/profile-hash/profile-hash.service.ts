import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { and, count, eq, ilike, sql, type SQL } from "drizzle-orm";
import { DecodeBase64, toEntityMapper, toViewMapper } from "dff-util";
import type { ResponseType, SearchType } from "../../utils/app-types";
import { env, logger, session_db, session_user } from "../../utils/app-util";
import type { ProfileHashDto } from "./profile-hash.dto";
import { profileHashEntity, type ProfileHashEntity } from "./profile-hash.entity";

const DEFAULT_KEY =
  "7e0a0ef142de22eb787b5001b36f188f3e7378abf250fc87bf38a4bda197236e";

function encryptKey(): string {
  return env("ENCRYPT_KEY") || DEFAULT_KEY;
}

/** AES-256-CBC → hash_salt = IV, hash_data = ciphertext. */
function encryptPassword(plain: string): { hash_data: string; hash_salt: string } {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", Buffer.from(encryptKey(), "hex"), iv);
  let encrypted = cipher.update(plain, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { hash_salt: iv.toString("hex"), hash_data: encrypted };
}

function decryptPassword(hashSalt: string, hashData: string): string {
  const decipher = createDecipheriv(
    "aes-256-cbc",
    Buffer.from(encryptKey(), "hex"),
    Buffer.from(hashSalt, "hex")
  );
  let decrypted = decipher.update(hashData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export default class ProfileHashService {
  static Db() {
    return session_db();
  }

  static EntityService() {
    return profileHashEntity;
  }

  static AuditUpdate(entity: ProfileHashEntity, isNew: boolean): ProfileHashEntity {
    const user = session_user();
    const now = new Date();
    const by = user?.id ?? "System";
    return {
      ...entity,
      updated_at: now,
      updated_by: by,
      ...(isNew ? { created_at: now, created_by: by } : {}),
    } as ProfileHashEntity;
  }

  static async EntityByIdService(id: string): Promise<ResponseType> {
    const db = this.Db();
    const table = this.EntityService();
    const rows = await db.select().from(table).where(eq(table.id, id)).limit(1);
    const entity = rows[0];
    if (!entity) return { data: null };
    const view = toViewMapper(entity) as Record<string, unknown>;
    delete view.hashData;
    delete view.hashSalt;
    return { data: view };
  }

  static async SaveValidation(
    dto: ProfileHashDto,
    entity: ProfileHashEntity
  ): Promise<ProfileHashEntity> {
    if (!entity.id) throw new Error("INVALID_PROFILE_HASH_ID");
    if (!entity.provider) entity.provider = "password";
    if (dto.updatedAt) {
      const existing = (
        await this.Db()
          .select()
          .from(profileHashEntity)
          .where(eq(profileHashEntity.id, entity.id))
          .limit(1)
      )[0];
      if (
        existing?.updated_at &&
        new Date(dto.updatedAt).toISOString() !==
          new Date(existing.updated_at).toISOString()
      ) {
        throw new Error("updated already exists");
      }
    }
    return entity;
  }

  static async ApplyPassword(
    dto: ProfileHashDto,
    entity: ProfileHashEntity
  ): Promise<ProfileHashEntity> {
    if (!dto.password) return entity;
    const plain = DecodeBase64(dto.password);
    const hashed = encryptPassword(plain);
    return { ...entity, ...hashed };
  }

  static async SaveService(dto: ProfileHashDto): Promise<ResponseType> {
    const log = logger();
    try {
      const { password: _pw, ...rest } = dto;
      let entity = toEntityMapper(rest) as ProfileHashEntity;
      const existing = (
        await this.Db()
          .select()
          .from(profileHashEntity)
          .where(eq(profileHashEntity.id, entity.id))
          .limit(1)
      )[0] ?? null;
      entity = { ...(existing ?? {}), ...entity } as ProfileHashEntity;
      entity = await this.ApplyPassword(dto, entity);
      entity = this.AuditUpdate(entity, !existing);
      entity = await this.SaveValidation(dto, entity);
      entity = await this.UpsertHash(entity, !!existing);
      log.info(`Saved profile hash: ${entity.id}`);
      const view = toViewMapper(entity) as Record<string, unknown>;
      delete view.hashData;
      delete view.hashSalt;
      return { data: view };
    } catch (error) {
      log.error(`Failed to save profile hash: ${error}`);
      throw error;
    }
  }

  static async UpsertHash(entity: ProfileHashEntity, isUpdate: boolean): Promise<ProfileHashEntity> {
    const db = this.Db();
    const table = this.EntityService();
    if (isUpdate) {
      await db.update(table).set(entity).where(eq(table.id, entity.id));
      return entity;
    }
    const [inserted] = await db.insert(table).values(entity).returning();
    return inserted ?? entity;
  }

  static buildSearchWhere(input: SearchType): SQL | undefined {
    const table = this.EntityService();
    const parts: SQL[] = [];
    if (input.searchTerm) {
      parts.push(ilike(table.provider, `%${input.searchTerm}%`));
    }
    if (input.filters) {
      try {
        const f = JSON.parse(input.filters) as Record<string, string>;
        if (f.provider) parts.push(eq(table.provider, f.provider));
        if (f.id) parts.push(eq(table.id, f.id));
      } catch {
        /* ignore */
      }
    }
    return parts.length ? and(...parts) : undefined;
  }

  static async SearchService(input: SearchType): Promise<ResponseType> {
    const log = logger();
    const db = this.Db();
    const table = this.EntityService();
    const where = this.buildSearchWhere(input);
    const limit = input.limit ?? 10;
    const skip = input.skip ?? 0;

    const [rows, totalRow] = await Promise.all([
      db
        .select({
          id: table.id,
          created_at: table.created_at,
          created_by: table.created_by,
          updated_at: table.updated_at,
          updated_by: table.updated_by,
          provider: table.provider,
        })
        .from(table)
        .where(where)
        .orderBy(sql`${table.updated_at} DESC`)
        .limit(limit)
        .offset(skip),
      db.select({ value: count() }).from(table).where(where),
    ]);

    log.info("Searched profile hashes", { total: totalRow[0]?.value ?? 0 });
    return {
      data: rows.map((r: Record<string, unknown>) => toViewMapper(r)),
      total: Number(totalRow[0]?.value ?? 0),
      skip,
      limit,
    };
  }

  /** Verify base64 password against stored hash_data / hash_salt. */
  static async VerifyPasswordService(
    id: string,
    passwordBase64: string
  ): Promise<boolean> {
    const db = this.Db();
    const table = this.EntityService();
    const rows = await db.select().from(table).where(eq(table.id, id)).limit(1);
    const row = rows[0];
    if (!row?.hash_data || !row?.hash_salt) return false;

    const plain = DecodeBase64(passwordBase64);
    try {
      return decryptPassword(row.hash_salt, row.hash_data) === plain;
    } catch {
      const md5 = createHash("md5").update(plain + row.hash_salt).digest("hex");
      return md5 === row.hash_data;
    }
  }
}
