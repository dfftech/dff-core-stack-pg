import { toEntityMapper, toViewMapper } from "dff-util";
import { and, count, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import type { ResponseType } from "../../utils/app-types";
import { logger, session_db, session_user } from "../../utils/app-util";
import { addressEntity } from "../address/address.entity";
import type { ProfileAddressDto, ProfileAddressSearchDto } from "./profile-address.dto";
import { profileAddressEntity, type ProfileAddressEntity } from "./profile-address.entity";

export default class ProfileAddressService {
  static Db() {
    return session_db();
  }

  static EntityService() {
    return profileAddressEntity;
  }

  static AuditUpdate(entity: ProfileAddressEntity, isNew: boolean): ProfileAddressEntity {
    const now = new Date();
    const by = session_user()?.id ?? "System";
    return {
      ...entity,
      updated_at: now,
      updated_by: by,
      ...(isNew ? { created_at: now, created_by: by } : {}),
    } as ProfileAddressEntity;
  }

  static async EntityByIdService(id: string): Promise<ResponseType> {
    const rows = await this.Db()
      .select()
      .from(profileAddressEntity)
      .where(eq(profileAddressEntity.id, id))
      .limit(1);
    const entity = rows[0];
    if (!entity) return { data: null };
    return { data: toViewMapper(entity) };
  }

  static LinkId(dto: ProfileAddressDto): string {
    const profileId = String(dto.profileId || "").trim();
    const addressId = String(dto.addressId || "").trim();
    return dto.id?.trim() || `${profileId}-${addressId}`;
  }

  static async SaveValidation(dto: ProfileAddressDto): Promise<string | null> {
    if (!String(dto.profileId || "").trim()) return "INVALID_PROFILE_ID";
    if (!String(dto.addressId || "").trim()) return "INVALID_ADDRESS_ID";

    const addressRows = await this.Db()
      .select({ id: addressEntity.id })
      .from(addressEntity)
      .where(eq(addressEntity.id, String(dto.addressId).trim()))
      .limit(1);
    if (!addressRows[0]) return "ADDRESS_NOT_FOUND";
    return null;
  }

  static async SaveService(dto: ProfileAddressDto): Promise<ResponseType> {
    const log = logger();
    try {
      const invalid = await this.SaveValidation(dto);
      if (invalid) return { data: null, error: invalid };

      const id = this.LinkId(dto);
      let entity = toEntityMapper({
        ...dto,
        id,
        profileId: String(dto.profileId).trim(),
        addressId: String(dto.addressId).trim(),
      }) as ProfileAddressEntity;
      const existing =
        (await this.Db()
          .select()
          .from(profileAddressEntity)
          .where(eq(profileAddressEntity.id, entity.id))
          .limit(1))[0] ?? null;
      entity = this.AuditUpdate({ ...(existing ?? {}), ...entity } as ProfileAddressEntity, !existing);

      if (existing) {
        await this.Db()
          .update(profileAddressEntity)
          .set(entity)
          .where(eq(profileAddressEntity.id, entity.id));
      } else {
        const [inserted] = await this.Db().insert(profileAddressEntity).values(entity).returning();
        entity = inserted ?? entity;
      }
      log.info(`Saved profile address: ${entity.id}`);
      return { data: toViewMapper(entity), status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      log.error(`Failed to save profile address: ${error}`);
      throw error;
    }
  }

  static buildSearchWhere(input: ProfileAddressSearchDto): SQL | undefined {
    const table = this.EntityService();
    const parts: SQL[] = [];
    const like = (value: string) => `%${value}%`;
    if (input.profileId) parts.push(ilike(table.profile_id, like(input.profileId)));
    if (input.addressId) parts.push(ilike(table.address_id, like(input.addressId)));
    if (input.searchTerm) {
      const term = like(input.searchTerm);
      const match = or(
        ilike(table.id, term),
        ilike(table.profile_id, term),
        ilike(table.address_id, term)
      );
      if (match) parts.push(match);
    }
    return parts.length ? and(...parts) : undefined;
  }

  static async SearchService(input: ProfileAddressSearchDto): Promise<ResponseType> {
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
