import { CallHbs, toEntityMapper, toViewMapper } from "dff-util";
import { and, asc, count, desc, eq, ilike, inArray, or, type SQL } from "drizzle-orm";
import type { RequestBodyType, ResponseType } from "../../utils/app-types";
import { logger, session_db, session_user } from "../../utils/app-util";
import { QueryCond, getColumnForTable, toWhereCond } from "../../utils/app-cond";
import type {
  TemplateFileDto,
  TemplateFileRenderDto,
  TemplateFileSearchRequest,
} from "./template-file.dto";
import {
  templateFileEntity,
  type TemplateFileEntity,
} from "./template-file.entity";

const DEFAULT_LANG = "en-US";

export default class TemplateFileService {
  static Db() {
    return session_db();
  }

  static EntityService() {
    return templateFileEntity;
  }

  static AuditUpdate(
    entity: TemplateFileEntity,
    isNew: boolean
  ): TemplateFileEntity {
    const now = new Date();
    const by = session_user()?.id ?? "System";
    return {
      ...entity,
      updatedOn: now,
      updatedBy: by,
      ...(isNew ? { createdOn: now, createdBy: by } : {}),
    };
  }

  static async EntityByIdService(id: string): Promise<ResponseType> {
    const db = this.Db();
    const table = this.EntityService();
    const rows = await db.select().from(table).where(eq(table.id, id)).limit(1);
    const entity = rows[0];
    if (!entity) return { data: null };
    return { data: toViewMapper(entity) };
  }

  /** Resolve by id, then `{name}_{lang}`, then name + lang, then name + en-US. */
  static async FindByNameLangService(
    templateId: string,
    lang?: string
  ): Promise<TemplateFileEntity | null> {
    const db = this.Db();
    const table = this.EntityService();
    const locale = (lang || DEFAULT_LANG).trim() || DEFAULT_LANG;
    const ids = [templateId, `${templateId}_${locale}`, `${templateId}_${DEFAULT_LANG}`];
    const uniqueIds = [...new Set(ids.filter(Boolean))];

    if (uniqueIds.length) {
      const byId = await db.select().from(table).where(inArray(table.id, uniqueIds)).limit(10);
      const exact = byId.find((r: TemplateFileEntity) => r.id === templateId);
      if (exact) return exact;
      const loc = byId.find((r: TemplateFileEntity) => r.id === `${templateId}_${locale}`);
      if (loc) return loc;
      const fallback = byId.find((r: TemplateFileEntity) => r.id === `${templateId}_${DEFAULT_LANG}`);
      if (fallback) return fallback;
    }

    const byName = await db
      .select()
      .from(table)
      .where(and(eq(table.name, templateId), eq(table.lang, locale), eq(table.active, true)))
      .limit(1);
    if (byName[0]) return byName[0];

    if (locale !== DEFAULT_LANG) {
      const en = await db
        .select()
        .from(table)
        .where(and(eq(table.name, templateId), eq(table.lang, DEFAULT_LANG), eq(table.active, true)))
        .limit(1);
      if (en[0]) return en[0];
    }
    return null;
  }

  static SaveValidation(dto: TemplateFileDto): string | null {
    if (!dto.name || dto.name === "") return "INVALID_TEMPLATE_NAME";
    if (dto.template == null || dto.template === "") return "INVALID_TEMPLATE";
    return null;
  }

  static async SaveService(dto: TemplateFileDto): Promise<ResponseType> {
    const log = logger();
    try {
      const invalid = this.SaveValidation(dto);
      if (invalid) return { data: null, error: invalid };

      const mapped = toEntityMapper(dto) as Record<string, unknown>;
      const db = this.Db();
      const table = this.EntityService();
      const lang = String(dto.lang || mapped.lang || DEFAULT_LANG);
      const name = String(mapped.name ?? dto.name);
      const id = String(dto.id || mapped.id || `${name}_${lang}`);
      const existing = await db.select({ id: table.id }).from(table).where(eq(table.id, id)).limit(1);
      const isNew = !existing[0];
      const template = String(mapped.template ?? dto.template);
      const active = Boolean(dto.active ?? true);
      const channel = String(dto.channel || mapped.channel || "email");
      const subject = dto.subject != null ? String(dto.subject) : mapped.subject != null ? String(mapped.subject) : null;

      let entity: TemplateFileEntity;
      if (isNew) {
        entity = this.AuditUpdate(
          {
            id,
            name,
            lang,
            channel,
            subject,
            template,
            active,
            createdBy: "System",
            createdOn: new Date(),
            updatedBy: "System",
            updatedOn: new Date(),
          },
          true
        );
        await db.insert(table).values(entity);
      } else {
        entity = this.AuditUpdate(
          {
            id,
            name,
            lang,
            channel,
            subject,
            template,
            active,
            createdBy: "System",
            createdOn: new Date(),
            updatedBy: "System",
            updatedOn: new Date(),
          },
          false
        );
        await db
          .update(table)
          .set({
            name: entity.name,
            lang: entity.lang,
            channel: entity.channel,
            subject: entity.subject,
            template: entity.template,
            active: entity.active,
            updatedOn: entity.updatedOn,
            updatedBy: entity.updatedBy,
          })
          .where(eq(table.id, id));
      }

      log.info(`Saved template file: ${entity.id}`);
      return { data: toViewMapper(entity), status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      log.error(`Failed to save template file: ${error}`);
      throw error;
    }
  }

  static async SearchService(input: TemplateFileSearchRequest): Promise<ResponseType> {
    const db = this.Db();
    const table = this.EntityService();
    const limit = input.limit ?? 10;
    const skip = input.skip ?? 0;
    const conds: SQL[] = [];

    if (input.active !== undefined) conds.push(eq(table.active, input.active));
    if (input.lang) conds.push(eq(table.lang, String(input.lang)));
    if (input.searchTerm) {
      const term = `%${input.searchTerm}%`;
      const nameOrId = or(ilike(table.name, term), ilike(table.id, term));
      if (nameOrId) conds.push(nameOrId);
    }
    if (input.filters) {
      const fromFilters = toWhereCond(QueryCond(input.filters), getColumnForTable(table as unknown as Record<string, unknown>));
      if (fromFilters) conds.push(fromFilters);
    }

    const whereClause = conds.length === 0 ? undefined : conds.length === 1 ? conds[0] : and(...conds);
    const orderCol = input.orderBy === "name" ? table.name : table.updatedOn;
    const orderFn = String(input.order || "DESC").toUpperCase() === "ASC" ? asc : desc;

    const rows = await db.select().from(table).where(whereClause).orderBy(orderFn(orderCol)).limit(limit).offset(skip);
    const [totalRow] = await db.select({ n: count() }).from(table).where(whereClause);
    return {
      data: rows.map((r: TemplateFileEntity) => toViewMapper(r)),
      total: Number(totalRow?.n ?? 0),
      limit,
      skip,
      status: "LISTED_SUCCESSFULLY",
    };
  }

  static async RenderService(input: TemplateFileRenderDto): Promise<ResponseType> {
    const log = logger();
    try {
      if (!input.templateId) return { data: null, error: "INVALID_DATA" };
      const row = await this.FindByNameLangService(input.templateId, input.lang);
      if (!row?.template) return { data: null, error: "INVALID_DATA" };

      const html = await CallHbs(row.template, { data: input.data ?? {} } as RequestBodyType);
      const rendered = Array.isArray(html) ? html.join("") : html;
      return { data: rendered, status: "RETRIEVED_SUCCESSFULLY" };
    } catch (error) {
      log.error(`Failed to render template: ${error}`);
      throw error;
    }
  }
}
