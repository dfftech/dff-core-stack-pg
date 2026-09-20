import { and, count, eq, ilike, sql, type SQL } from "drizzle-orm";
import { AppUUID4, toEntityMapper, toViewMapper } from "dff-util";
import type { ResponseType, SearchType } from "../../utils/app-types";
import { logger, session_db, session_user } from "../../utils/app-util";
import type { OtpDto, VerifyOtpDto } from "./otp.dto";
import { otpEntity, type OtpEntity } from "./otp.entity";

const OTP_EXPIRY_MINUTES = 5;

export default class OtpService {
  static Db() {
    return session_db();
  }

  static EntityService() {
    return otpEntity;
  }

  static AuditUpdate(entity: OtpEntity, isNew: boolean): OtpEntity {
    const user = session_user();
    const now = new Date();
    const by = user?.id ?? "System";
    return {
      ...entity,
      updated_at: now,
      updated_by: by,
      ...(isNew ? { created_at: now, created_by: by } : {}),
    } as OtpEntity;
  }

  static generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static isExpired(createdAt: Date): boolean {
    const diffMinutes = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60);
    return diffMinutes > OTP_EXPIRY_MINUTES;
  }

  static async EntityByIdService(id: string): Promise<ResponseType> {
    const rows = await this.Db()
      .select()
      .from(otpEntity)
      .where(eq(otpEntity.id, id))
      .limit(1);
    const entity = rows[0];
    if (!entity) return { data: null };
    const view = toViewMapper(entity) as Record<string, unknown>;
    delete view.otp;
    return { data: view };
  }

  static async GetOtpService(id: string): Promise<OtpEntity | null> {
    const rows = await this.Db()
      .select()
      .from(otpEntity)
      .where(eq(otpEntity.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  static async SaveService(dto: OtpDto): Promise<ResponseType> {
    const log = logger();
    try {
      let entity = toEntityMapper({
        id: dto.id || AppUUID4(),
        uid: dto.uid,
        otp: dto.otp || this.generateOtp(),
        isVerified: dto.isVerified ?? false,
      }) as OtpEntity;
      const existing = (
        await this.Db().select().from(otpEntity).where(eq(otpEntity.id, entity.id)).limit(1)
      )[0] ?? null;
      entity = this.AuditUpdate({ ...(existing ?? {}), ...entity } as OtpEntity, !existing);
      if (existing) {
        await this.Db().update(otpEntity).set(entity).where(eq(otpEntity.id, entity.id));
      } else {
        const [inserted] = await this.Db().insert(otpEntity).values(entity).returning();
        entity = inserted ?? entity;
      }
      log.info(`Saved otp: ${entity.id}`);
      const view = toViewMapper(entity) as Record<string, unknown>;
      delete view.otp;
      return { data: view };
    } catch (error) {
      log.error(`Failed to save otp: ${error}`);
      throw error;
    }
  }

  static async CreateOtpService(dto: OtpDto) {
    const result = await this.SaveService({
      uid: dto.uid,
      otp: dto.otp,
      isVerified: false,
    });
    const row = await this.GetOtpService((result.data as { id: string }).id);
    return row ? (toViewMapper(row) as OtpDto & { id: string; otp: string }) : null;
  }

  static async VerifyOtpService(dto: VerifyOtpDto) {
    const log = logger();
    const record = await this.GetOtpService(dto.id);
    if (!record) return { verified: false, message: "OTP not found" };
    if (record.uid !== dto.uid) return { verified: false, message: "OTP uid mismatch" };
    if (record.is_verified) return { verified: false, message: "OTP already verified" };
    if (this.isExpired(record.created_at)) return { verified: false, message: "OTP expired" };
    if (record.otp !== dto.otp) return { verified: false, message: "Invalid OTP" };

    await this.Db()
      .update(otpEntity)
      .set(
        this.AuditUpdate({ ...record, is_verified: true } as OtpEntity, false)
      )
      .where(eq(otpEntity.id, record.id));

    log.info("OTP verified", { id: dto.id });
    return { verified: true, message: "OTP verified successfully" };
  }

  static buildSearchWhere(input: SearchType): SQL | undefined {
    const parts: SQL[] = [];
    if (input.searchTerm) parts.push(ilike(otpEntity.uid, `%${input.searchTerm}%`));
    if (input.filters) {
      try {
        const f = JSON.parse(input.filters) as Record<string, string | boolean>;
        if (f.uid) parts.push(eq(otpEntity.uid, String(f.uid)));
        if (f.isVerified !== undefined) {
          parts.push(eq(otpEntity.is_verified, f.isVerified === true || f.isVerified === "true"));
        }
      } catch {
        /* ignore */
      }
    }
    return parts.length ? and(...parts) : undefined;
  }

  static async SearchService(input: SearchType): Promise<ResponseType> {
    const where = this.buildSearchWhere(input);
    const limit = input.limit ?? 10;
    const skip = input.skip ?? 0;
    const [rows, totalRow] = await Promise.all([
      this.Db()
        .select({
          id: otpEntity.id,
          uid: otpEntity.uid,
          is_verified: otpEntity.is_verified,
          created_at: otpEntity.created_at,
          updated_at: otpEntity.updated_at,
        })
        .from(otpEntity)
        .where(where)
        .orderBy(sql`${otpEntity.created_at} DESC`)
        .limit(limit)
        .offset(skip),
      this.Db().select({ value: count() }).from(otpEntity).where(where),
    ]);
    return {
      data: rows.map((r: Record<string, unknown>) => toViewMapper(r)),
      total: Number(totalRow[0]?.value ?? 0),
      skip,
      limit,
    };
  }
}
