import { CallLangText, toEntityMapper, toViewMapper } from "dff-util";
import { and, count, eq, ilike, inArray, ne, or, sql, type SQL } from "drizzle-orm";
import type { ResponseType } from "../../utils/app-types";
import { logger, session_db, session_user } from "../../utils/app-util";
import type {
  TranslationDataDto,
  TranslationDto,
  TranslationFillDto,
  TranslationLangDto,
  TranslationSearchDto,
  TranslationTextDto,
} from "./translation.dto";
import { translationEntity, type TranslationEntity } from "./translation.entity";

const DEFAULT_LANG = "en-US";

export default class TranslationService {
  static Db() {
    return session_db();
  }

  static EntityService() {
    return translationEntity;
  }

  static AuditUpdate(entity: TranslationEntity, isNew: boolean): TranslationEntity {
    const now = new Date();
    const by = session_user()?.id ?? "System";
    return {
      ...entity,
      updatedOn: now,
      updatedBy: by,
      ...(isNew ? { createdOn: now, createdBy: by } : {}),
    } as TranslationEntity;
  }

  static LangMap(value: unknown): Record<string, string> {
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (typeof v === "string") out[k] = v;
    }
    return out;
  }

  static async EntityByIdService(id: string): Promise<ResponseType> {
    const rows = await this.Db()
      .select()
      .from(translationEntity)
      .where(eq(translationEntity.id, id))
      .limit(1);
    const entity = rows[0];
    if (!entity) return { data: null };
    return { data: toViewMapper(entity) };
  }

  static SaveValidation(dto: TranslationDto): string | null {
    if (!dto.type || dto.type.includes(".")) return "INVALID_TRANSLATION_TYPE";
    if (!dto.key || dto.key.includes(".")) return "INVALID_TRANSLATION_KEY";
    return null;
  }

  static async SaveService(dto: TranslationDto): Promise<ResponseType> {
    const log = logger();
    try {
      const invalid = this.SaveValidation(dto);
      if (invalid) return { data: null, error: invalid };
      const id = `${dto.type}_${dto.key}`;
      const existing =
        (await this.Db().select().from(translationEntity).where(eq(translationEntity.id, id)).limit(1))[0] ??
        null;
      const data = { ...this.LangMap(existing?.data), ...this.LangMap(dto.data) };
      let entity = toEntityMapper({
        ...dto,
        id,
        type: dto.type,
        key: dto.key,
        data,
        active: dto.active ?? existing?.active ?? true,
      }) as TranslationEntity;
      entity = this.AuditUpdate({ ...(existing ?? {}), ...entity, data } as TranslationEntity, !existing);
      if (existing) {
        await this.Db().update(translationEntity).set(entity).where(eq(translationEntity.id, id));
      } else {
        const [inserted] = await this.Db().insert(translationEntity).values(entity).returning();
        entity = inserted ?? entity;
      }
      log.info(`Saved translation: ${entity.id}`);
      return { data: toViewMapper(entity), status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      log.error(`Failed to save translation: ${error}`);
      throw error;
    }
  }

  static ParseTypes(type?: string): string[] {
    if (!type) return [];
    return type.split(",").map((item) => item.trim()).filter(Boolean);
  }

  static TypeLangWhere(type?: string, lang?: string): SQL[] | { error: string } {
    const table = this.EntityService();
    const types = this.ParseTypes(type);
    if (lang && !/^[a-zA-Z]{2}-[a-zA-Z]{2}$/.test(lang)) return { error: "INVALID_LANG" };
    const parts: SQL[] = [];
    if (types.length === 1) parts.push(eq(table.type, types[0]));
    if (types.length > 1) parts.push(inArray(table.type, types));
    if (lang) parts.push(sql`${table.data} ? ${lang}`);
    return parts;
  }

  static buildSearchWhere(input: TranslationSearchDto): SQL | { error: string } | undefined {
    const table = this.EntityService();
    const typed = this.TypeLangWhere(input.type, input.lang);
    if (!Array.isArray(typed)) return typed;
    const parts: SQL[] = [...typed];
    if (input.active !== undefined) parts.push(eq(table.active, input.active));
    if (input.searchTerm) {
      const term = `%${input.searchTerm}%`;
      const match = or(
        ilike(table.key, term),
        ilike(table.type, term),
        ilike(table.id, term),
        sql`${table.data}::text ILIKE ${term}`
      );
      if (match) parts.push(match);
    }
    if (input.filters) {
      try {
        const f = JSON.parse(input.filters) as Record<string, string>;
        if (f.type) parts.push(eq(table.type, String(f.type)));
        if (f.key) parts.push(eq(table.key, String(f.key)));
        if (f.lang) parts.push(sql`${table.data} ? ${String(f.lang)}`);
      } catch {
        /* ignore */
      }
    }
    return parts.length ? and(...parts) : undefined;
  }

  static async SearchService(input: TranslationSearchDto): Promise<ResponseType> {
    const db = this.Db();
    const table = this.EntityService();
    const where = this.buildSearchWhere(input);
    if (where && "error" in where) return { data: null, error: where.error };
    const limit = input.limit ?? 10;
    const skip = input.skip ?? 0;
    const [rows, totalRow] = await Promise.all([
      db.select().from(table).where(where as SQL | undefined).orderBy(sql`${table.updatedOn} DESC`).limit(limit).offset(skip),
      db.select({ value: count() }).from(table).where(where as SQL | undefined),
    ]);
    return {
      data: rows.map((r: TranslationEntity) => toViewMapper(r)),
      total: Number(totalRow[0]?.value ?? 0),
      skip,
      limit,
      status: "LISTED_SUCCESSFULLY",
    };
  }

  static async FetchActiveByTypeService(common: boolean): Promise<TranslationEntity[]> {
    const table = this.EntityService();
    const typeCond = common ? eq(table.type, "common") : ne(table.type, "common");
    return this.Db().select().from(table).where(and(eq(table.active, true), typeCond));
  }

  static OverlayKeys(
    common: TranslationEntity[],
    others: TranslationEntity[]
  ): Record<string, Record<string, string>> {
    const byKey: Record<string, Record<string, string>> = {};
    for (const row of common) byKey[row.key] = this.LangMap(row.data);
    for (const row of others) byKey[row.key] = this.LangMap(row.data);
    return byKey;
  }

  static ToLangResponse(
    byKey: Record<string, Record<string, string>>,
    lang?: string
  ): Record<string, Record<string, string>> {
    const found = Object.values(byKey).flatMap((map) => Object.keys(map));
    const locales = lang ? [lang] : [...new Set([DEFAULT_LANG, ...found])];
    const data: Record<string, Record<string, string>> = {};
    for (const loc of locales) {
      data[loc] = {};
      for (const [key, map] of Object.entries(byKey)) {
        const value = map[loc] || map[DEFAULT_LANG];
        if (value) data[loc][key] = value;
      }
    }
    return data;
  }

  static async DataService(dto: TranslationDataDto): Promise<ResponseType> {
    const typed = this.TypeLangWhere(dto.type, dto.lang);
    if (!Array.isArray(typed)) return { data: null, error: typed.error };
    const parts: SQL[] = [...typed, eq(translationEntity.active, true)];
    const rows = await this.Db()
      .select()
      .from(translationEntity)
      .where(and(...parts))
      .orderBy(sql`${translationEntity.type} ASC, ${translationEntity.key} ASC`);
    return { data: rows.map((r: TranslationEntity) => toViewMapper(r)), status: "LISTED_SUCCESSFULLY" };
  }

  static async LangService(dto: TranslationLangDto): Promise<ResponseType> {
    if (dto.lang && !/^[a-zA-Z]{2}-[a-zA-Z]{2}$/.test(dto.lang)) {
      return { data: null, error: "INVALID_LANG" };
    }
    const common = await this.FetchActiveByTypeService(true);
    const others = await this.FetchActiveByTypeService(false);
    const byKey = this.OverlayKeys(common, others);
    return { data: this.ToLangResponse(byKey, dto.lang), status: "LISTED_SUCCESSFULLY" };
  }

  static async TextService(dto: TranslationTextDto): Promise<ResponseType> {
    const log = logger();
    try {
      if (!dto.text || !dto.target) return { data: null, error: "INVALID_DATA" };
      const source = dto.source || DEFAULT_LANG;
      if (source === dto.target) return { data: { text: dto.text, source, target: dto.target } };
      const text = await CallLangText(dto.text, source, dto.target);
      return { data: { text, source, target: dto.target }, status: "TRANSLATED_SUCCESSFULLY" };
    } catch (error) {
      log.error(`Failed to translate text: ${error}`);
      throw error;
    }
  }

  static async MapService(lang: string): Promise<ResponseType> {
    return this.LangService({ lang: lang || DEFAULT_LANG });
  }

  static async FillService(dto: TranslationFillDto): Promise<ResponseType> {
    const log = logger();
    try {
      if (!dto.lang || !/^[a-zA-Z]{2}-[a-zA-Z]{2}$/.test(dto.lang)) {
        return { data: null, error: "INVALID_LANG" };
      }
      const source = dto.source || DEFAULT_LANG;
      if (source === dto.lang) return { data: { saved: 0 }, status: "SAVED_SUCCESSFULLY" };
      const rows = await this.Db()
        .select()
        .from(translationEntity)
        .where(eq(translationEntity.active, true));
      const saved = await this.FillRowsService(rows, source, dto.lang);
      log.info(`Filled translation data for ${dto.lang}`, { saved });
      return { data: { saved, lang: dto.lang, source }, status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      log.error(`Failed to fill translations: ${error}`);
      throw error;
    }
  }

  static async FillRowsService(
    rows: TranslationEntity[],
    source: string,
    lang: string
  ): Promise<number> {
    let saved = 0;
    for (const row of rows) {
      const data = this.LangMap(row.data);
      if (data[lang] || !data[source]) continue;
      data[lang] = await CallLangText(data[source], source, lang);
      const result = await this.SaveService({
        id: row.id,
        type: row.type,
        key: row.key,
        data,
        active: row.active,
      });
      if (result.data) saved += 1;
    }
    return saved;
  }
}
