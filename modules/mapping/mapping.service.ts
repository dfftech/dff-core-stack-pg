import { AppCodeByType, toViewMapper } from "dff-util";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { AppError } from "../../utils/app-error";
import { logger, session_db, session_user } from "../../utils/app-util";
import type {
  MappingBatchSaveRequest,
  MappingDto,
  MappingSearchRequest,
} from "./mapping.dto";
import { mappingEntity, type MappingEntity } from "./mapping.entity";

export default class MappingService {
  static Db() {
    return session_db();
  }

  static EntityService() {
    return mappingEntity;
  }

  static AuditUpdate(entity: MappingEntity, isNew: boolean): MappingEntity {
    const now = new Date();
    const by = session_user()?.id ?? "System";
    return {
      ...entity,
      updated_at: now,
      updated_by: by,
      ...(isNew ? { created_at: now, created_by: by } : {}),
    } as MappingEntity;
  }

  static ToView(entity: MappingEntity) {
    return toViewMapper(entity);
  }

  static async EntityByIdService(id: string) {
    const table = this.EntityService();
    const rows = await this.Db().select().from(table).where(eq(table.id, id)).limit(1);
    const entity = rows[0];
    if (!entity) return null;
    return this.ToView(entity);
  }

  static BuildId(dto: MappingDto): string {
    const inputPart = dto.inputField?.trim() || "NA";
    return AppCodeByType(`${dto.entityField}_${inputPart}`, dto.type);
  }

  static NormalizeCompute(compute: unknown): string[] | null {
    if (!Array.isArray(compute)) return null;
    const values = compute.map((v) => String(v ?? "").trim()).filter(Boolean);
    return values.length ? values : null;
  }

  /** `isRequired` is a per-row flag on `entityField` (the mapped output), not on `inputField`. */
  static SaveValidation(dto: MappingDto): string | null {
    if (!dto.type || !dto.type.trim()) return "INVALID_MAPPING_TYPE";
    if (!dto.entityField || !dto.entityField.trim()) return "INVALID_MAPPING_ENTITY_FIELD";
    return null;
  }

  static async SaveService(dto: MappingDto) {
    const log = logger();
    try {
      const invalid = this.SaveValidation(dto);
      if (invalid) throw new AppError(invalid);
      const db = this.Db();
      const table = this.EntityService();
      const id = dto.id?.trim() || this.BuildId(dto);
      const existing = (await db.select().from(table).where(eq(table.id, id)).limit(1))[0] ?? null;
      let entity = this.AuditUpdate(
        {
          ...(existing ?? {}),
          id,
          type: dto.type.trim(),
          entity_field: dto.entityField.trim(),
          input_field: dto.inputField !== undefined ? dto.inputField.trim() || null : existing?.input_field ?? null,
          is_required: dto.isRequired ?? existing?.is_required ?? false,
          compute: dto.compute !== undefined ? this.NormalizeCompute(dto.compute) : existing?.compute ?? null,
          ai_summary: dto.aiSummary ?? existing?.ai_summary ?? null,
          active: dto.active ?? existing?.active ?? true,
        } as MappingEntity,
        !existing
      );
      if (existing) {
        await db.update(table).set(entity).where(eq(table.id, id));
      } else {
        const [inserted] = await db.insert(table).values(entity).returning();
        entity = inserted ?? entity;
      }
      log.info(`Saved mapping: ${entity.id}`);
      return this.ToView(entity);
    } catch (error) {
      log.error(`Failed to save mapping: ${error}`);
      throw error;
    }
  }

  static async BatchSaveService(input: MappingBatchSaveRequest) {
    const log = logger();
    const items = Array.isArray(input?.items) ? input.items : [];
    if (!items.length) throw new AppError("INVALID_MAPPING_BATCH");
    const results = [];
    for (const item of items) {
      results.push(await this.SaveService(item));
    }
    log.info(`Batch saved mappings: ${results.length}`);
    return results;
  }

  static buildSearchWhere(input: MappingSearchRequest): SQL | undefined {
    const table = this.EntityService();
    const parts: SQL[] = [];
    if (input.active !== undefined) parts.push(eq(table.active, input.active));
    if (input.type) parts.push(eq(table.type, input.type.trim()));
    if (input.searchTerm) {
      const term = `%${input.searchTerm}%`;
      const match = or(
        ilike(table.type, term),
        ilike(table.entity_field, term),
        ilike(table.input_field, term)
      );
      if (match) parts.push(match);
    }
    return parts.length ? and(...parts) : undefined;
  }

  static async SearchService(input: MappingSearchRequest) {
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
        .orderBy(desc(table.updated_at))
        .limit(limit)
        .offset(skip),
      db.select({ value: count() }).from(table).where(where),
    ]);
    return {
      data: rows.map((r: MappingEntity) => this.ToView(r)),
      total: Number(totalRow[0]?.value ?? 0),
      skip,
      limit,
    };
  }

  /** All active rows for one type, ordered by entity_field then input_field. */
  static async TypeService(type: string) {
    const table = this.EntityService();
    const value = String(type ?? "").trim();
    if (!value) throw new AppError("INVALID_MAPPING_TYPE");
    const rows = await this.Db()
      .select()
      .from(table)
      .where(and(eq(table.type, value), eq(table.active, true)))
      .orderBy(table.entity_field, table.input_field);
    return rows.map((r: MappingEntity) => this.ToView(r));
  }
}
