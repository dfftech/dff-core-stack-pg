import { randomUUID } from "node:crypto";
import { toViewMapper } from "dff-util";
import { and, count, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import type { ResponseType } from "../../utils/app-types";
import { logger, session_db, session_user } from "../../utils/app-util";
import type { AddressDto, AddressSearchDto } from "./address.dto";
import { addressEntity, type AddressEntity } from "./address.entity";

export default class AddressService {
  static Db() {
    return session_db();
  }

  static EntityService() {
    return addressEntity;
  }

  static AuditUpdate(entity: AddressEntity, isNew: boolean): AddressEntity {
    const now = new Date();
    const by = session_user()?.id ?? "System";
    return {
      ...entity,
      updated_at: now,
      updated_by: by,
      ...(isNew ? { created_at: now, created_by: by } : {}),
    } as AddressEntity;
  }

  static async EntityByIdService(id: string): Promise<ResponseType> {
    const rows = await this.Db()
      .select()
      .from(addressEntity)
      .where(eq(addressEntity.id, id))
      .limit(1);
    const entity = rows[0];
    if (!entity) return { data: null };
    return { data: toViewMapper(entity) };
  }

  static SaveValidation(dto: AddressDto): string | null {
    if (!String(dto.address || "").trim()) return "INVALID_ADDRESS";
    if (!String(dto.type || "").trim()) return "INVALID_ADDRESS_TYPE";
    return null;
  }

  static FromDto(dto: AddressDto): AddressEntity {
    const id = dto.id || randomUUID();
    const lat = dto.lat === undefined || dto.lat === null ? null : Number(dto.lat);
    const lng = dto.lng === undefined || dto.lng === null ? null : Number(dto.lng);
    const trim = (v?: string) => (v ? String(v).trim() : null);
    return {
      id,
      address: String(dto.address).trim(),
      area: trim(dto.area),
      city: trim(dto.city),
      state: trim(dto.state),
      country: trim(dto.country),
      zipcode: trim(dto.zipCode),
      type: String(dto.type).trim(),
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
      created_by: "System",
      updated_by: "System",
      created_at: new Date(),
      updated_at: new Date(),
    } as AddressEntity;
  }

  static async SaveService(dto: AddressDto): Promise<ResponseType> {
    const log = logger();
    try {
      const invalid = this.SaveValidation(dto);
      if (invalid) return { data: null, error: invalid };

      let entity = this.FromDto(dto);
      const existing =
        (await this.Db()
          .select()
          .from(addressEntity)
          .where(eq(addressEntity.id, entity.id))
          .limit(1))[0] ?? null;
      entity = this.AuditUpdate({ ...(existing ?? {}), ...entity } as AddressEntity, !existing);

      if (existing) {
        await this.Db().update(addressEntity).set(entity).where(eq(addressEntity.id, entity.id));
      } else {
        const [inserted] = await this.Db().insert(addressEntity).values(entity).returning();
        entity = inserted ?? entity;
      }
      log.info(`Saved address: ${entity.id}`);
      return { data: toViewMapper(entity), status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      log.error(`Failed to save address: ${error}`);
      throw error;
    }
  }

  static buildSearchWhere(input: AddressSearchDto): SQL | undefined {
    const table = this.EntityService();
    const parts: SQL[] = [];
    const like = (value: string) => `%${value}%`;
    if (input.type) parts.push(ilike(table.type, like(input.type)));
    if (input.zipCode) parts.push(ilike(table.zipcode, like(input.zipCode)));
    if (input.area) parts.push(ilike(table.area, like(input.area)));
    if (input.city) parts.push(ilike(table.city, like(input.city)));
    if (input.state) parts.push(ilike(table.state, like(input.state)));
    if (input.country) parts.push(ilike(table.country, like(input.country)));
    if (input.searchTerm) {
      const term = `%${input.searchTerm}%`;
      const match = or(
        ilike(table.address, term),
        ilike(table.area, term),
        ilike(table.city, term),
        ilike(table.state, term),
        ilike(table.country, term),
        ilike(table.zipcode, term),
        ilike(table.type, term)
      );
      if (match) parts.push(match);
    }
    return parts.length ? and(...parts) : undefined;
  }

  static async SearchService(input: AddressSearchDto): Promise<ResponseType> {
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
      data: rows.map((r: Record<string, unknown>) => toViewMapper(r)),
      total: Number(totalRow[0]?.value ?? 0),
      skip,
      limit,
      status: "LISTED_SUCCESSFULLY",
    };
  }
}
