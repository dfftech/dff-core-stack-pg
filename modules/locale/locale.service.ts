import { LangCountryCode, toEntityMapper, toViewMapper } from "dff-util";
import { and, count, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import type { ResponseType, SearchType } from "../../utils/app-types";
import { logger, session_db, session_user } from "../../utils/app-util";
import type { LocaleDto } from "./locale.dto";
import { localeEntity, type LocaleEntity } from "./locale.entity";

export default class LocaleService {
  static Db() {
    return session_db();
  }

  static EntityService() {
    return localeEntity;
  }

  static AuditUpdate(entity: LocaleEntity, isNew: boolean): LocaleEntity {
    const now = new Date();
    const by = session_user()?.id ?? "System";
    return {
      ...entity,
      updated_at: now,
      updated_by: by,
      ...(isNew ? { created_at: now, created_by: by } : {}),
    } as LocaleEntity;
  }

  static async EntityByIdService(id: string): Promise<ResponseType> {
    const rows = await this.Db().select().from(localeEntity).where(eq(localeEntity.id, id)).limit(1);
    const entity = rows[0];
    if (!entity) return { data: null };
    return { data: toViewMapper(entity) };
  }

  static SaveValidation(dto: LocaleDto): string | null {
    const id = dto.id || dto.lang || "";
    if (!id || !/^[a-zA-Z]{2}-[a-zA-Z]{2}$/.test(id)) return "INVALID_LANG";
    if (!LangCountryCode(id).name) return "INVALID_LANG";
    if (dto.dir && dto.dir !== "ltr" && dto.dir !== "rtl") return "INVALID_LANG_DIR";
    return null;
  }

  static FromLocale(dto: LocaleDto): LocaleEntity {
    const id = String(dto.id || dto.lang);
    const meta = LangCountryCode(id);
    const mapped = toEntityMapper({ ...dto, id }) as Record<string, unknown>;
    return {
      id,
      lang: String(mapped.lang || meta.lang.split("-")[0] || id.split("-")[0]).toLowerCase(),
      country: String(mapped.country || meta.country || id.split("-")[1] || ""),
      name: String(mapped.name || dto.name || meta.name),
      dir: String(mapped.dir || dto.dir || meta.dir || "ltr"),
      locale: String(mapped.locale || dto.locale || meta.locale || meta.name),
      active: dto.active ?? true,
      created_by: "System",
      updated_by: "System",
      created_at: new Date(),
      updated_at: new Date(),
    } as LocaleEntity;
  }

  static async SaveService(dto: LocaleDto): Promise<ResponseType> {
    const log = logger();
    try {
      const invalid = this.SaveValidation(dto);
      if (invalid) return { data: null, error: invalid };
      let entity = this.FromLocale(dto);
      const existing =
        (await this.Db().select().from(localeEntity).where(eq(localeEntity.id, entity.id)).limit(1))[0] ??
        null;
      entity = this.AuditUpdate({ ...(existing ?? {}), ...entity } as LocaleEntity, !existing);
      if (existing) {
        await this.Db().update(localeEntity).set(entity).where(eq(localeEntity.id, entity.id));
      } else {
        const [inserted] = await this.Db().insert(localeEntity).values(entity).returning();
        entity = inserted ?? entity;
      }
      log.info(`Saved locale: ${entity.id}`);
      return { data: toViewMapper(entity), status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      log.error(`Failed to save locale: ${error}`);
      throw error;
    }
  }

  static buildSearchWhere(input: SearchType): SQL | undefined {
    const table = this.EntityService();
    const parts: SQL[] = [];
    if (input.active !== undefined) parts.push(eq(table.active, input.active));
    if (input.searchTerm) {
      const term = `%${input.searchTerm}%`;
      const match = or(ilike(table.name, term), ilike(table.id, term), ilike(table.locale, term));
      if (match) parts.push(match);
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
      db.select().from(table).where(where).orderBy(sql`${table.name} ASC`).limit(limit).offset(skip),
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
