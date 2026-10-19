import { AppRandomString, toEntityMapper, toViewMapper } from 'dff-util';
import { and, desc, eq } from 'drizzle-orm';
import log from 'encore.dev/log';
import type { ResponseType } from '../../utils/app-types';
import { session_db, session_user } from '../../utils/app-util';
import type { UploadFileDto, UploadFileSearchRequest } from './upload-file.dto';
import { uploadFileEntity, type UploadFileEntity } from './upload-file.entity';

const ID_SAFE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const RANDOM_SUFFIX_LENGTH = 8;

const sanitizeIdPart = (value: string): string =>
  (value || '').trim().replace(/[^a-zA-Z0-9_-]/g, '_');

export default class UploadFileService {
  static Db() {
    return session_db();
  }

  static EntityService() {
    return uploadFileEntity;
  }

  static BuildId(provider: string, type: string, name: string): string {
    const randomPart = AppRandomString(RANDOM_SUFFIX_LENGTH, ID_SAFE_CHARS);
    return [sanitizeIdPart(provider), sanitizeIdPart(type), sanitizeIdPart(name), randomPart].join('-');
  }

  static AuditUpdate<T extends Record<string, any>>(data: T, isNew: boolean): T {
    const user = session_user();
    const now = new Date();
    const by = user?.id ?? 'System';
    return {
      ...data,
      updated_at: now,
      updated_by: by,
      ...(isNew ? { created_at: now, created_by: by } : {}),
    };
  }

  static SaveValidation(dto: UploadFileDto): void {
    if (!dto.name || dto.name.trim() === '') throw new Error('INVALID_NAME');
    if (!dto.url || dto.url.trim() === '') throw new Error('INVALID_URL');
    if (!dto.type || dto.type.trim() === '') throw new Error('INVALID_TYPE');
    if (!dto.provider || dto.provider.trim() === '') throw new Error('INVALID_PROVIDER');
  }

  static async SaveService(dto: UploadFileDto): Promise<ResponseType> {
    const log_ = log;
    try {
      this.SaveValidation(dto);
      const provider = dto.provider.trim();

      const db = this.Db();
      const table = this.EntityService();
      const id = dto.id?.trim() || this.BuildId(provider, dto.type, dto.name);

      const patch = toEntityMapper({
        id,
        name: dto.name.trim(),
        url: dto.url.trim(),
        status: dto.status?.trim() || 'active',
        type: dto.type.trim(),
        provider,
        active: dto.active ?? true,
      }) as Partial<UploadFileEntity>;

      const raw = this.AuditUpdate(patch, true) as UploadFileEntity;
      await db.insert(table).values(raw);

      log_.info?.(`Saved upload-file: ${id}`);
      return { data: toViewMapper(raw) };
    } catch (error) {
      log_.error?.(`Failed to save upload-file: ${error}`);
      throw error;
    }
  }

  static async EntityByIdService(id: string): Promise<ResponseType> {
    if (!id?.trim()) throw new Error('INVALID_ID');
    const db = this.Db();
    const table = this.EntityService();
    const rows = await db.select().from(table).where(eq(table.id, id.trim())).limit(1);
    if (!rows[0]) return { data: null };
    return { data: toViewMapper(rows[0]) };
  }

  static async DeleteService(id: string): Promise<ResponseType> {
    if (!id?.trim()) throw new Error('INVALID_ID');
    const db = this.Db();
    const table = this.EntityService();
    await db.delete(table).where(eq(table.id, id.trim()));
    return { data: { id } };
  }

  static async UpdateStatusService(id: string, status: string): Promise<ResponseType> {
    if (!id?.trim()) throw new Error('INVALID_ID');
    if (!status?.trim()) throw new Error('INVALID_STATUS');
    const db = this.Db();
    const table = this.EntityService();
    const raw = this.AuditUpdate({ status: status.trim() }, false);
    await db.update(table).set(raw).where(eq(table.id, id.trim()));
    return this.EntityByIdService(id.trim());
  }

  static async SearchEntitiesService(input: UploadFileSearchRequest): Promise<ResponseType> {
    const db = this.Db();
    const table = this.EntityService();
    const skip = Math.max(0, Number(input.skip) || 0);
    const limit = Math.min(100, Math.max(1, Number(input.limit) || 20));
    const conds = [];
    if (input.provider) conds.push(eq(table.provider, input.provider.trim()));
    if (input.type) conds.push(eq(table.type, input.type.trim()));
    if (input.status) conds.push(eq(table.status, input.status.trim()));
    if (input.active !== undefined) conds.push(eq(table.active, input.active));
    const whereCond = conds.length > 0 ? and(...conds) : undefined;
    const rows = await db
      .select()
      .from(table)
      .where(whereCond)
      .orderBy(desc(table.created_at))
      .limit(limit)
      .offset(skip);
    return { data: rows.map((r: any) => toViewMapper(r)), skip, limit };
  }
}
