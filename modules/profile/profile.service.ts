import { and, count, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { AppCodeByType, toEntityMapper, toViewMapper } from "dff-util";
import type { ResponseType, SearchType } from "../../utils/app-types";
import { logger, session_db, session_user } from "../../utils/app-util";
import type { ProfileDto } from "./profile.dto";
import { profileEntity, type ProfileEntity } from "./profile.entity";
import ProfileHashService from "../profile-hash/profile-hash.service";

export default class ProfileService {
  static Db() {
    return session_db();
  }

  static EntityService() {
    return profileEntity;
  }

  static AuditUpdate(entity: ProfileEntity, isNew: boolean): ProfileEntity {
    const user = session_user();
    const now = new Date();
    const by = user?.id ?? "System";
    return {
      ...entity,
      updated_at: now,
      updated_by: by,
      ...(isNew ? { created_at: now, created_by: by } : {}),
    } as ProfileEntity;
  }

  static async EntityByIdService(id: string): Promise<ResponseType> {
    const db = this.Db();
    const table = this.EntityService();
    const rows = await db.select().from(table).where(eq(table.id, id)).limit(1);
    const entity = rows[0];
    if (!entity) return { data: null };
    return { data: toViewMapper(entity) };
  }

  static async FindByEmailService(email: string) {
    const rows = await this.Db()
      .select()
      .from(profileEntity)
      .where(eq(profileEntity.email, email))
      .limit(1);
    return rows[0] ? (toViewMapper(rows[0]) as ProfileDto) : null;
  }

  static async FindByMobileService(mobile: string) {
    const rows = await this.Db()
      .select()
      .from(profileEntity)
      .where(eq(profileEntity.mobile, mobile))
      .limit(1);
    return rows[0] ? (toViewMapper(rows[0]) as ProfileDto) : null;
  }

  static async SaveValidation(dto: ProfileDto, entity: ProfileEntity, existing: ProfileEntity | null) {
    if (!entity.name) throw new Error("INVALID_PROFILE_NAME");
    if (!entity.persona) throw new Error("INVALID_PROFILE_PERSONA");
    if (dto.email) {
      const byEmail = await this.FindByEmailService(dto.email);
      if (byEmail && byEmail.id !== existing?.id) throw new Error("Email already exists");
    }
    if (dto.mobile) {
      const byMobile = await this.FindByMobileService(dto.mobile);
      if (byMobile && byMobile.id !== existing?.id) throw new Error("Mobile already exists");
    }
    if (dto.updatedAt && existing?.updated_at) {
      if (new Date(dto.updatedAt).toISOString() !== new Date(existing.updated_at).toISOString()) {
        throw new Error("updated already exists");
      }
    }
    return entity;
  }

  static applyDefaults(entity: ProfileEntity, dto: ProfileDto): ProfileEntity {
    return {
      ...entity,
      active: entity.active ?? true,
      name_lang: entity.name_lang ?? { "en-US": dto.name },
      pic: entity.pic ?? "",
      email: entity.email ?? "",
      mobile: entity.mobile ?? "",
      tel_code: entity.tel_code ?? "",
      is_email_verified: entity.is_email_verified ?? false,
      is_mobile_verified: entity.is_mobile_verified ?? false,
      roles: entity.roles ?? [],
      is_archived: entity.is_archived ?? false,
    } as ProfileEntity;
  }

  static async SaveService(dto: ProfileDto): Promise<ResponseType> {
    const log = logger();
    try {
      const { password, provider, ...profileDto } = dto;
      let entity = toEntityMapper(profileDto) as ProfileEntity;
      if (!entity.id) {
        entity.id = AppCodeByType(dto.email || dto.mobile || dto.nameLang?.["en-US"] || dto.name);
      }
      const existing = (
        await this.Db().select().from(profileEntity).where(eq(profileEntity.id, entity.id)).limit(1)
      )[0] ?? null;
      entity = this.applyDefaults({ ...(existing ?? {}), ...entity } as ProfileEntity, dto);
      entity = this.AuditUpdate(entity, !existing);
      entity = await this.SaveValidation(dto, entity, existing);
      entity = await this.UpsertProfile(entity, !!existing);
      if (password) {
        await ProfileHashService.SaveService({
          id: entity.id,
          provider: provider || "password",
          password,
        });
      }
      log.info(`Saved profile: ${entity.id}`);
      return { data: toViewMapper(entity) };
    } catch (error) {
      log.error(`Failed to save profile: ${error}`);
      throw error;
    }
  }

  static async UpsertProfile(entity: ProfileEntity, isUpdate: boolean): Promise<ProfileEntity> {
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
    const parts: SQL[] = [eq(table.is_archived, false)];
    if (input.active !== undefined) parts.push(eq(table.active, input.active));
    if (input.searchTerm) {
      const term = `%${input.searchTerm}%`;
      parts.push(
        or(
          ilike(table.name, term),
          ilike(table.email, term),
          ilike(table.mobile, term),
          sql`${table.name_lang}->>'en-US' ILIKE ${term}`
        )!
      );
    }
    if (input.filters) {
      try {
        const f = JSON.parse(input.filters) as Record<string, string>;
        if (f.email) parts.push(eq(table.email, f.email));
        if (f.mobile) parts.push(eq(table.mobile, f.mobile));
        if (f.persona) parts.push(eq(table.persona, f.persona));
      } catch {
        /* ignore invalid filters */
      }
    }
    return and(...parts);
  }

  static async SearchService(input: SearchType): Promise<ResponseType> {
    const log = logger();
    const db = this.Db();
    const table = this.EntityService();
    const where = this.buildSearchWhere(input);
    const limit = input.limit ?? 10;
    const skip = input.skip ?? 0;
    const order = input.order?.toUpperCase() === "ASC" ? sql`ASC` : sql`DESC`;
    const orderCol = input.orderBy === "name" ? table.name : table.updated_at;

    const [rows, totalRow] = await Promise.all([
      db.select().from(table).where(where).orderBy(sql`${orderCol} ${order}`).limit(limit).offset(skip),
      db.select({ value: count() }).from(table).where(where),
    ]);

    log.info("Searched profiles", { total: totalRow[0]?.value ?? 0 });
    return {
      data: rows.map((r) => toViewMapper(r)),
      total: Number(totalRow[0]?.value ?? 0),
      skip,
      limit,
    };
  }
}
