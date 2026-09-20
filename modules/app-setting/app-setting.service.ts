import { and, count, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { toEntityMapper, toViewMapper } from "dff-util";
import type { ResponseType, SearchType } from "../../utils/app-types";
import { logger, session_db, session_user } from "../../utils/app-util";
import type { AppSettingDto } from "./app-setting.dto";
import { appSettingEntity, type AppSettingEntity } from "./app-setting.entity";

export default class AppSettingService {
  static Db() {
    return session_db();
  }

  static EntityService() {
    return appSettingEntity;
  }

  static AuditUpdate(entity: AppSettingEntity, isNew: boolean): AppSettingEntity {
    const now = new Date();
    const by = session_user()?.id ?? "System";
    return {
      ...entity,
      updated_at: now,
      updated_by: by,
      ...(isNew ? { created_at: now, created_by: by } : {}),
    } as AppSettingEntity;
  }

  static async EntityByIdService(id: string): Promise<ResponseType> {
    const rows = await this.Db()
      .select()
      .from(appSettingEntity)
      .where(eq(appSettingEntity.id, id))
      .limit(1);
    const entity = rows[0];
    if (!entity) return { data: null };
    return { data: toViewMapper(entity) };
  }

  static async DataByIdService(id: string): Promise<Record<string, unknown>> {
    const rows = await this.Db()
      .select({ data: appSettingEntity.data, active: appSettingEntity.active })
      .from(appSettingEntity)
      .where(eq(appSettingEntity.id, id))
      .limit(1);
    const row = rows[0];
    if (!row?.active) return {};
    const data = row.data;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return data as Record<string, unknown>;
    }
    return {};
  }

  static SaveValidation(dto: AppSettingDto): string | null {
    if (!dto.type) return "INVALID_SETTING_TYPE";
    if (!dto.code) return "INVALID_SETTING_CODE";
    return null;
  }

  static async SaveService(dto: AppSettingDto): Promise<ResponseType> {
    const log = logger();
    try {
      const invalid = this.SaveValidation(dto);
      if (invalid) return { data: null, error: invalid };

      const id = dto.id || `${dto.type}_${dto.code}`;
      let entity = toEntityMapper({
        ...dto,
        id,
        active: dto.active ?? true,
        isPublic: dto.isPublic ?? false,
        data: dto.data ?? {},
      }) as AppSettingEntity;

      const existing = (
        await this.Db().select().from(appSettingEntity).where(eq(appSettingEntity.id, id)).limit(1)
      )[0] ?? null;
      entity = this.AuditUpdate({ ...(existing ?? {}), ...entity } as AppSettingEntity, !existing);

      if (existing) {
        await this.Db().update(appSettingEntity).set(entity).where(eq(appSettingEntity.id, id));
      } else {
        const [inserted] = await this.Db().insert(appSettingEntity).values(entity).returning();
        entity = inserted ?? entity;
      }
      log.info(`Saved app setting: ${entity.id}`);
      return { data: toViewMapper(entity), status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      log.error(`Failed to save app setting: ${error}`);
      throw error;
    }
  }

  static buildSearchWhere(input: SearchType): SQL | undefined {
    const table = this.EntityService();
    const parts: SQL[] = [];
    if (input.active !== undefined) parts.push(eq(table.active, input.active));
    if (input.searchTerm) {
      const term = `%${input.searchTerm}%`;
      const match = or(ilike(table.name, term), ilike(table.code, term), ilike(table.type, term));
      if (match) parts.push(match);
    }
    if (input.filters) {
      try {
        const f = JSON.parse(input.filters) as Record<string, string | boolean>;
        if (f.type) parts.push(eq(table.type, String(f.type)));
        if (f.code) parts.push(eq(table.code, String(f.code)));
        if (f.isPublic !== undefined) {
          parts.push(eq(table.is_public, f.isPublic === true || f.isPublic === "true"));
        }
      } catch {
        /* ignore */
      }
    }
    return parts.length ? and(...parts) : undefined;
  }

  static async SearchService(input: SearchType): Promise<ResponseType> {
    const db = this.Db();
    const table = this.EntityService();
    const where = this.buildSearchWhere(input);
    const limit = input.limit ?? 10;
    const skip = input.skip ?? 0;
    const [rows, totalRow] = await Promise.all([
      db
        .select()
        .from(table)
        .where(where)
        .orderBy(sql`${table.updated_at} DESC`)
        .limit(limit)
        .offset(skip),
      db.select({ value: count() }).from(table).where(where),
    ]);
    return {
      data: rows.map((r: Record<string, unknown>) => toViewMapper(r)),
      total: Number(totalRow[0]?.value ?? 0),
      skip,
      limit,
      status: "LISTED_SUCCESSFULLY",
    };
  }
}
