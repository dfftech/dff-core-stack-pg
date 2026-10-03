import { AppCodeByType, toViewMapper } from "dff-util";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import type { ResponseType } from "../../utils/app-types";
import { logger, session_db, session_user } from "../../utils/app-util";
import {
  type SiteContentDto,
  type SiteContentGetRequest,
  type SiteContentSearchRequest,
} from "./site-content.dto";
import { siteContentEntity, type SiteContentEntity } from "./site-content.entity";

const DEFAULT_LANG = "en-US";
const MAX_TYPE_LENGTH = 64;
const HTML_TAG = /<\/?[a-z][^>]*>/i;

export default class SiteContentService {
  static Db() {
    return session_db();
  }

  static EntityService() {
    return siteContentEntity;
  }

  static AuditUpdate(entity: SiteContentEntity, isNew: boolean): SiteContentEntity {
    const now = new Date();
    const by = session_user()?.id ?? "System";
    return {
      ...entity,
      updated_at: now,
      updated_by: by,
      ...(isNew ? { created_at: now, created_by: by } : {}),
    } as SiteContentEntity;
  }

  static ToView(entity: SiteContentEntity) {
    return toViewMapper(entity);
  }

  static async EntityByIdService(id: string): Promise<ResponseType> {
    const table = this.EntityService();
    const rows = await this.Db().select().from(table).where(eq(table.id, id)).limit(1);
    const entity = rows[0];
    if (!entity) return { data: null };
    return { data: this.ToView(entity) };
  }

  static NormalizeType(type: unknown): string {
    return String(type ?? "").trim().toUpperCase();
  }

  static SaveValidation(dto: SiteContentDto): string | null {
    const type = this.NormalizeType(dto.type);
    if (!type || type.length > MAX_TYPE_LENGTH) return "INVALID_SITE_CONTENT_TYPE";
    if (!dto.version) return "INVALID_SITE_CONTENT_VERSION";
    if (typeof dto.content !== "string" || !dto.content.trim()) return "INVALID_SITE_CONTENT_CONTENT";
    if (HTML_TAG.test(dto.content)) return "INVALID_SITE_CONTENT_MARKDOWN";
    return null;
  }

  static async SaveService(dto: SiteContentDto): Promise<ResponseType> {
    const log = logger();
    try {
      const invalid = this.SaveValidation(dto);
      if (invalid) return { data: null, error: invalid };
      const db = this.Db();
      const table = this.EntityService();
      const type = this.NormalizeType(dto.type);
      const lang = String(dto.lang ?? "").trim() || DEFAULT_LANG;
      const id = dto.id || AppCodeByType(`${dto.version}_${lang}`, type);
      const existing = (await db.select().from(table).where(eq(table.id, id)).limit(1))[0] ?? null;
      let entity = this.AuditUpdate(
        {
          ...(existing ?? {}),
          id,
          type,
          version: dto.version,
          lang,
          content: dto.content,
          priority: dto.priority ?? existing?.priority ?? 0,
          active: dto.active ?? existing?.active ?? false,
        } as SiteContentEntity,
        !existing
      );
      if (existing) {
        await db.update(table).set(entity).where(eq(table.id, id));
      } else {
        const [inserted] = await db.insert(table).values(entity).returning();
        entity = inserted ?? entity;
      }
      log.info(`Saved site content: ${entity.id}`);
      return { data: this.ToView(entity), status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      log.error(`Failed to save site content: ${error}`);
      throw error;
    }
  }

  /** Always active only. */
  static buildSearchWhere(input: SiteContentSearchRequest): SQL | undefined {
    const table = this.EntityService();
    const parts: SQL[] = [eq(table.active, true)];
    const lang = String(input.lang ?? "").trim();
    if (lang) parts.push(eq(table.lang, lang));
    if (input.searchTerm) {
      const term = `%${input.searchTerm}%`;
      const match = or(ilike(table.type, term), ilike(table.version, term), ilike(table.lang, term));
      if (match) parts.push(match);
    }
    return and(...parts);
  }

  static async SearchService(input: SiteContentSearchRequest): Promise<ResponseType> {
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
        .orderBy(desc(table.priority), desc(table.updated_at))
        .limit(limit)
        .offset(skip),
      db.select({ value: count() }).from(table).where(where),
    ]);
    return {
      data: rows.map((r: SiteContentEntity) => this.ToView(r)),
      total: Number(totalRow[0]?.value ?? 0),
      skip,
      limit,
      status: "LISTED_SUCCESSFULLY",
    };
  }

  /** Latest active version of `type` for `lang` (default en-US, falls back to en-US). */
  static async GetService(input: SiteContentGetRequest): Promise<ResponseType> {
    const table = this.EntityService();
    const type = this.NormalizeType(input.type);
    if (!type || type.length > MAX_TYPE_LENGTH) return { data: null, error: "INVALID_SITE_CONTENT_TYPE" };
    const lang = String(input.lang ?? "").trim() || DEFAULT_LANG;
    const db = this.Db();

    const latest = async (locale: string): Promise<SiteContentEntity | undefined> => {
      const rows: SiteContentEntity[] = await db
        .select()
        .from(table)
        .where(and(eq(table.active, true), eq(table.type, type), eq(table.lang, locale)));
      return rows.sort(
        (a, b) =>
          b.version.localeCompare(a.version, undefined, { numeric: true }) ||
          b.updated_at.getTime() - a.updated_at.getTime()
      )[0];
    };
    const entity = (await latest(lang)) ?? (lang !== DEFAULT_LANG ? await latest(DEFAULT_LANG) : undefined);
    if (!entity) return { data: null };
    return { data: this.ToView(entity), status: "RETRIEVED_SUCCESSFULLY" };
  }
}
