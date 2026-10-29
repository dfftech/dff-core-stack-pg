import { AppCodeByType, toViewMapper } from "dff-util";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { AppError } from "../../utils/app-error";
import { logger, session_db, session_user } from "../../utils/app-util";
import type {
  UploadValidationBatchSaveRequest,
  UploadValidationDto,
  UploadValidationSearchRequest,
} from "./upload-validation.dto";
import { uploadValidationEntity, type UploadValidationEntity } from "./upload-validation.entity";

export default class UploadValidationService {
  static Db() {
    return session_db();
  }

  static EntityService() {
    return uploadValidationEntity;
  }

  static AuditUpdate(entity: UploadValidationEntity, isNew: boolean): UploadValidationEntity {
    const now = new Date();
    const by = session_user()?.id ?? "System";
    return {
      ...entity,
      updated_at: now,
      updated_by: by,
      ...(isNew ? { created_at: now, created_by: by } : {}),
    } as UploadValidationEntity;
  }

  static ToView(entity: UploadValidationEntity) {
    return toViewMapper(entity);
  }

  static async EntityByIdService(id: string) {
    const table = this.EntityService();
    const rows = await this.Db().select().from(table).where(eq(table.id, id)).limit(1);
    const entity = rows[0];
    if (!entity) return null;
    return this.ToView(entity);
  }

  static BuildId(dto: UploadValidationDto): string {
    return AppCodeByType(`${dto.entityField}_${dto.fileField}`, dto.type);
  }

  static SaveValidation(dto: UploadValidationDto): string | null {
    if (!dto.type || !dto.type.trim()) return "INVALID_UPLOAD_VALIDATION_TYPE";
    if (!dto.entityField || !dto.entityField.trim()) return "INVALID_UPLOAD_VALIDATION_ENTITY_FIELD";
    if (!dto.fileField || !dto.fileField.trim()) return "INVALID_UPLOAD_VALIDATION_FILE_FIELD";
    return null;
  }

  static async SaveService(dto: UploadValidationDto) {
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
          file_field: dto.fileField.trim(),
          is_required: dto.isRequired ?? existing?.is_required ?? false,
          compute: dto.compute ?? existing?.compute ?? null,
          ai_summary: dto.aiSummary ?? existing?.ai_summary ?? null,
          active: dto.active ?? existing?.active ?? true,
        } as UploadValidationEntity,
        !existing
      );
      if (existing) {
        await db.update(table).set(entity).where(eq(table.id, id));
      } else {
        const [inserted] = await db.insert(table).values(entity).returning();
        entity = inserted ?? entity;
      }
      log.info(`Saved upload validation: ${entity.id}`);
      return this.ToView(entity);
    } catch (error) {
      log.error(`Failed to save upload validation: ${error}`);
      throw error;
    }
  }

  static async BatchSaveService(input: UploadValidationBatchSaveRequest) {
    const log = logger();
    const items = Array.isArray(input?.items) ? input.items : [];
    if (!items.length) throw new AppError("INVALID_UPLOAD_VALIDATION_BATCH");
    const results = [];
    for (const item of items) {
      results.push(await this.SaveService(item));
    }
    log.info(`Batch saved upload validations: ${results.length}`);
    return results;
  }

  static buildSearchWhere(input: UploadValidationSearchRequest): SQL | undefined {
    const table = this.EntityService();
    const parts: SQL[] = [];
    if (input.active !== undefined) parts.push(eq(table.active, input.active));
    if (input.type) parts.push(eq(table.type, input.type.trim()));
    if (input.searchTerm) {
      const term = `%${input.searchTerm}%`;
      const match = or(
        ilike(table.type, term),
        ilike(table.entity_field, term),
        ilike(table.file_field, term)
      );
      if (match) parts.push(match);
    }
    return parts.length ? and(...parts) : undefined;
  }

  static async SearchService(input: UploadValidationSearchRequest) {
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
      data: rows.map((r: UploadValidationEntity) => this.ToView(r)),
      total: Number(totalRow[0]?.value ?? 0),
      skip,
      limit,
    };
  }

  /** All active rows for one type, ordered by entity_field then file_field. */
  static async TypeService(type: string) {
    const table = this.EntityService();
    const value = String(type ?? "").trim();
    if (!value) throw new AppError("INVALID_UPLOAD_VALIDATION_TYPE");
    const rows = await this.Db()
      .select()
      .from(table)
      .where(and(eq(table.type, value), eq(table.active, true)))
      .orderBy(table.entity_field, table.file_field);
    return rows.map((r: UploadValidationEntity) => this.ToView(r));
  }
}
