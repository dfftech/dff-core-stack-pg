import { AppCodeByType, toViewMapper } from "dff-util";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import type { ResponseType, SearchType } from "../../utils/app-types";
import { logger, session_db, session_user } from "../../utils/app-util";
import type { LegalDocumentDto, LegalDocumentType } from "./legal-document.dto";
import { legalDocumentEntity, type LegalDocumentEntity } from "./legal-document.entity";

const LEGAL_DOCUMENT_TYPES: LegalDocumentType[] = ["PRIVACY_POLICY", "TERMS_AND_CONDITIONS", "REFUND_POLICY"];

export default class LegalDocumentService {
  static Db() {
    return session_db();
  }

  static EntityService() {
    return legalDocumentEntity;
  }

  static AuditUpdate(entity: LegalDocumentEntity, isNew: boolean): LegalDocumentEntity {
    const now = new Date();
    const by = session_user()?.id ?? "System";
    return {
      ...entity,
      updated_at: now,
      updated_by: by,
      ...(isNew ? { created_at: now, created_by: by } : {}),
    } as LegalDocumentEntity;
  }

  /** dff-util mappers recurse into nested objects — keep content keys exactly as stored. */
  static ToView(entity: LegalDocumentEntity) {
    return { ...toViewMapper(entity), content: entity.content };
  }

  static async EntityByIdService(id: string): Promise<ResponseType> {
    const table = this.EntityService();
    const rows = await this.Db().select().from(table).where(eq(table.id, id)).limit(1);
    const entity = rows[0];
    if (!entity) return { data: null };
    return { data: this.ToView(entity) };
  }

  static SaveValidation(dto: LegalDocumentDto): string | null {
    if (!LEGAL_DOCUMENT_TYPES.includes(dto.type)) return "INVALID_LEGAL_DOCUMENT_TYPE";
    if (!dto.version) return "INVALID_LEGAL_DOCUMENT_VERSION";
    if (dto.content == null || dto.content === "") return "INVALID_LEGAL_DOCUMENT_CONTENT";
    return null;
  }

  static async SaveService(dto: LegalDocumentDto): Promise<ResponseType> {
    const log = logger();
    try {
      const invalid = this.SaveValidation(dto);
      if (invalid) return { data: null, error: invalid };
      const db = this.Db();
      const table = this.EntityService();
      const id = dto.id || AppCodeByType(dto.version, dto.type);
      const existing = (await db.select().from(table).where(eq(table.id, id)).limit(1))[0] ?? null;
      let entity = this.AuditUpdate(
        {
          ...(existing ?? {}),
          id,
          type: dto.type,
          version: dto.version,
          content: dto.content,
          priority: dto.priority ?? existing?.priority ?? 0,
          active: dto.active ?? existing?.active ?? false,
        } as LegalDocumentEntity,
        !existing
      );
      if (existing) {
        await db.update(table).set(entity).where(eq(table.id, id));
      } else {
        const [inserted] = await db.insert(table).values(entity).returning();
        entity = inserted ?? entity;
      }
      log.info(`Saved legal document: ${entity.id}`);
      return { data: this.ToView(entity), status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      log.error(`Failed to save legal document: ${error}`);
      throw error;
    }
  }

  /** Always active only. */
  static buildSearchWhere(input: SearchType): SQL | undefined {
    const table = this.EntityService();
    const parts: SQL[] = [eq(table.active, true)];
    if (input.searchTerm) {
      const term = `%${input.searchTerm}%`;
      const match = or(ilike(table.type, term), ilike(table.version, term));
      if (match) parts.push(match);
    }
    return and(...parts);
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
        .orderBy(desc(table.priority), desc(table.updated_at))
        .limit(limit)
        .offset(skip),
      db.select({ value: count() }).from(table).where(where),
    ]);
    return {
      data: rows.map((r: LegalDocumentEntity) => this.ToView(r)),
      total: Number(totalRow[0]?.value ?? 0),
      skip,
      limit,
      status: "LISTED_SUCCESSFULLY",
    };
  }

  /** Highest priority active document. */
  static async GetService(): Promise<ResponseType> {
    const table = this.EntityService();
    const rows = await this.Db()
      .select()
      .from(table)
      .where(eq(table.active, true))
      .orderBy(desc(table.priority), desc(table.updated_at))
      .limit(1);
    const entity = rows[0];
    if (!entity) return { data: null };
    return { data: this.ToView(entity), status: "RETRIEVED_SUCCESSFULLY" };
  }
}
