import { and, count, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { toEntityMapper, toViewMapper, type SearchType } from "dff-util";
import { logger, session_db, session_user } from "../../utils/app-util";
import type { AppConstantDto } from "./app-constant.dto";
import { appConstantEntity, type AppConstantEntity } from "./app-constant.entity";
import { AppError } from "../../utils/app-error";

export default class AppConstantService {
  static Db() {
    return session_db();
  }

  static EntityService() {
    return appConstantEntity;
  }

  static AuditUpdate(entity: AppConstantEntity, isNew: boolean): AppConstantEntity {
    const now = new Date();
    const by = session_user()?.id ?? "System";
    return {
      ...entity,
      updated_at: now,
      updated_by: by,
      ...(isNew ? { created_at: now, created_by: by } : {}),
    } as AppConstantEntity;
  }

  static ToView(entity: AppConstantEntity) {
    return { ...toViewMapper(entity), data: entity.data };
  }

  static async EntityByIdService(id: string) {
    const rows = await this.Db()
      .select()
      .from(appConstantEntity)
      .where(eq(appConstantEntity.id, id))
      .limit(1);
    const entity = rows[0];
    if (!entity) return null;
    return this.ToView(entity);
  }

  static async DataByIdService(id: string): Promise<Record<string, unknown>> {
    const rows = await this.Db()
      .select({ data: appConstantEntity.data, active: appConstantEntity.active })
      .from(appConstantEntity)
      .where(eq(appConstantEntity.id, id))
      .limit(1);
    const row = rows[0];
    if (!row?.active) return {};
    const data = row.data;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return data as Record<string, unknown>;
    }
    return {};
  }

  /** All active rows of one type, ordered by code. */
  static async TypeService(type: string) {
    const table = this.EntityService();
    const value = String(type ?? "").trim();
    if (!value) throw new AppError("INVALID_CONSTANT_TYPE");
    const rows = await this.Db()
      .select()
      .from(table)
      .where(and(eq(table.type, value), eq(table.active, true)))
      .orderBy(sql`${table.code} ASC`);
    return rows.map((r: AppConstantEntity) => this.ToView(r));
  }

  static SaveValidation(dto: AppConstantDto): string | null {
    if (!dto.type) return "INVALID_CONSTANT_TYPE";
    if (!dto.code) return "INVALID_CONSTANT_CODE";
    if (dto.id && dto.id !== `${dto.type}_${dto.code}`) return "INVALID_CONSTANT_ID";
    return null;
  }

  static async SaveService(dto: AppConstantDto) {
    const log = logger();
    try {
      const invalid = this.SaveValidation(dto);
      if (invalid) throw new AppError(invalid);

      const id = `${dto.type}_${dto.code}`;
      const { data: constantData, ...rest } = dto;
      let entity = {
        ...(toEntityMapper({
          ...rest,
          id,
          active: dto.active ?? true,
        }) as AppConstantEntity),
        data: (constantData ?? {}) as Record<string, unknown>,
      } as AppConstantEntity;

      const existing = (
        await this.Db().select().from(appConstantEntity).where(eq(appConstantEntity.id, id)).limit(1)
      )[0] ?? null;
      entity = this.AuditUpdate({ ...(existing ?? {}), ...entity } as AppConstantEntity, !existing);

      if (existing) {
        await this.Db().update(appConstantEntity).set(entity).where(eq(appConstantEntity.id, id));
      } else {
        const [inserted] = await this.Db().insert(appConstantEntity).values(entity).returning();
        entity = inserted ?? entity;
      }
      log.info(`Saved app constant: ${entity.id}`);
      return this.ToView(entity);
    } catch (error) {
      log.error(`Failed to save app constant: ${error}`);
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
      } catch {
        /* ignore */
      }
    }
    return parts.length ? and(...parts) : undefined;
  }

  static async SearchService(input: SearchType) {
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
      data: rows.map((r: AppConstantEntity) => this.ToView(r)),
      total: Number(totalRow[0]?.value ?? 0),
      skip,
      limit,
    };
  }
}
