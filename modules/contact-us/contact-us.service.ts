import { AppCodeByType, RegExp as AppRegExp, toEntityMapper, toViewMapper } from "dff-util";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import type { ResponseType, SearchType } from "../../utils/app-types";
import { logger, session_db, session_user } from "../../utils/app-util";
import type { ContactUsDto } from "./contact-us.dto";
import { contactUsEntity, type ContactUsEntity } from "./contact-us.entity";

export default class ContactUsService {
  static Db() {
    return session_db();
  }

  static EntityService() {
    return contactUsEntity;
  }

  static AuditUpdate(entity: ContactUsEntity, isNew: boolean): ContactUsEntity {
    const now = new Date();
    const by = session_user()?.id ?? "System";
    return {
      ...entity,
      updated_at: now,
      updated_by: by,
      ...(isNew ? { created_at: now, created_by: by } : {}),
    } as ContactUsEntity;
  }

  static async EntityByIdService(id: string): Promise<ResponseType> {
    const table = this.EntityService();
    const rows = await this.Db().select().from(table).where(eq(table.id, id)).limit(1);
    const entity = rows[0];
    if (!entity) return { data: null };
    return { data: toViewMapper(entity) };
  }

  static SaveValidation(dto: ContactUsDto): string | null {
    if (!dto.name) return "INVALID_CONTACT_NAME";
    if (!dto.email || !AppRegExp.EMAIL.test(dto.email)) return "INVALID_CONTACT_EMAIL";
    return null;
  }

  static async SaveService(dto: ContactUsDto): Promise<ResponseType> {
    const log = logger();
    try {
      const invalid = this.SaveValidation(dto);
      if (invalid) return { data: null, error: invalid };
      const db = this.Db();
      const table = this.EntityService();
      const id = dto.id || AppCodeByType(dto.name);
      const existing = (await db.select().from(table).where(eq(table.id, id)).limit(1))[0] ?? null;
      const mapped = toEntityMapper({ ...dto, id, active: dto.active ?? existing?.active ?? true });
      let entity = this.AuditUpdate({ ...(existing ?? {}), ...mapped } as ContactUsEntity, !existing);
      if (existing) {
        await db.update(table).set(entity).where(eq(table.id, id));
      } else {
        const [inserted] = await db.insert(table).values(entity).returning();
        entity = inserted ?? entity;
      }
      log.info(`Saved contact us: ${entity.id}`);
      return { data: toViewMapper(entity), status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      log.error(`Failed to save contact us: ${error}`);
      throw error;
    }
  }

  /** Always active only. */
  static buildSearchWhere(input: SearchType): SQL | undefined {
    const table = this.EntityService();
    const parts: SQL[] = [eq(table.active, true)];
    if (input.searchTerm) {
      const term = `%${input.searchTerm}%`;
      const match = or(ilike(table.name, term), ilike(table.email, term), ilike(table.phone, term));
      if (match) parts.push(match);
    }
    return and(...parts);
  }

  /** No priority column on contact_us — latest updated first. */
  static async SearchService(input: SearchType): Promise<ResponseType> {
    const db = this.Db();
    const table = this.EntityService();
    const where = this.buildSearchWhere(input);
    const limit = input.limit ?? 10;
    const skip = input.skip ?? 0;
    const [rows, totalRow] = await Promise.all([
      db.select().from(table).where(where).orderBy(desc(table.updated_at)).limit(limit).offset(skip),
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

  /** Top active record (latest updated). */
  static async GetService(): Promise<ResponseType> {
    const table = this.EntityService();
    const rows = await this.Db()
      .select()
      .from(table)
      .where(eq(table.active, true))
      .orderBy(desc(table.updated_at))
      .limit(1);
    const entity = rows[0];
    if (!entity) return { data: null };
    return { data: toViewMapper(entity), status: "RETRIEVED_SUCCESSFULLY" };
  }
}
