import { AppCodeByType, toViewMapper } from "dff-util";
import { and, asc, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { isFullAccessRoleId } from "../../utils/app-roles";
import { logger, session_db, session_user } from "../../utils/app-util";
import MenuAccessService from "../menu-access/menu-access.service";
import MenuLinkService from "../menu-link/menu-link.service";
import type { MenuRoleDto, SearchMenuRolesDto } from "./menu-role.dto";
import { menuRoleEntity, type MenuRoleEntity } from "./menu-role.entity";
import type { MenuRolesData } from "./menu-role.types";

export default class MenuRoleService {
  static Db() {
    return session_db();
  }

  static EntityService() {
    return menuRoleEntity;
  }

  static AuditUpdate(entity: MenuRoleEntity, isNew: boolean): MenuRoleEntity {
    const now = new Date();
    const by = session_user()?.id ?? "System";
    return {
      ...entity,
      updated_at: now,
      updated_by: by,
      ...(isNew ? { created_at: now, created_by: by } : {}),
    };
  }

  static async FindById(id: string): Promise<MenuRolesData | null> {
    const rows = await this.Db().select().from(menuRoleEntity).where(eq(menuRoleEntity.id, id)).limit(1);
    return rows[0] ? (toViewMapper(rows[0]) as MenuRolesData) : null;
  }

  static Where(dto: SearchMenuRolesDto): SQL | undefined {
    const table = menuRoleEntity;
    const parts: SQL[] = [];
    if (dto.searchTerm) {
      const term = `%${dto.searchTerm}%`;
      const match = or(ilike(table.name, term), sql`${table.name_lang}->>'en-US' ILIKE ${term}`);
      if (match) parts.push(match);
    }
    if (dto.persona !== undefined) parts.push(eq(table.persona, dto.persona));
    if (dto.active !== undefined) parts.push(eq(table.active, dto.active));
    return parts.length ? and(...parts) : undefined;
  }

  static async Query(dto: SearchMenuRolesDto): Promise<{ data: MenuRolesData[]; total: number }> {
    const table = menuRoleEntity;
    const where = this.Where(dto);
    const limit = dto.limit || 10;
    const skip = ((dto.page || 1) - 1) * limit;
    const col = dto.orderBy === "name" ? table.name : table.updated_at;
    const order = dto.order?.toUpperCase() === "ASC" ? asc(col) : desc(col);
    const [rows, totalRow] = await Promise.all([
      this.Db().select().from(table).where(where).orderBy(order).limit(limit).offset(skip),
      this.Db().select({ value: count() }).from(table).where(where),
    ]);
    return {
      data: rows.map((row) => toViewMapper(row) as MenuRolesData),
      total: Number(totalRow[0]?.value ?? 0),
    };
  }

  static async Upsert(data: {
    id: string;
    name: string;
    nameLang: Record<string, string>;
    persona: string;
    active: boolean;
  }): Promise<MenuRolesData> {
    const existing =
      (await this.Db().select().from(menuRoleEntity).where(eq(menuRoleEntity.id, data.id)).limit(1))[0] ?? null;
    let entity = this.AuditUpdate(
      {
        ...(existing ?? {}),
        id: data.id,
        name: data.name,
        name_lang: data.nameLang,
        persona: data.persona,
        active: data.active,
      } as MenuRoleEntity,
      !existing
    );
    if (existing) {
      await this.Db().update(menuRoleEntity).set(entity).where(eq(menuRoleEntity.id, entity.id));
    } else {
      const [inserted] = await this.Db().insert(menuRoleEntity).values(entity).returning();
      entity = inserted ?? entity;
    }
    return toViewMapper(entity) as MenuRolesData;
  }

  static async SaveService(dto: MenuRoleDto): Promise<MenuRolesData> {
    const log = logger();
    const id = dto.id || AppCodeByType(dto.nameLang?.["en-US"] || dto.name || "menu_role", dto.persona);
    if (isFullAccessRoleId(id)) throw new Error("RESERVED_ROLES_NOT_ALLOWED");
    log.info("Creating menu role", { name: dto.nameLang?.["en-US"] });
    const existing = await this.FindById(id);
    if (existing && !dto.id) throw new Error(`Menu role already exists with id ${id}`);
    const saved = await this.Upsert({
      id,
      name: dto.name || dto.nameLang?.["en-US"] || "",
      nameLang: dto.nameLang,
      persona: dto.persona,
      active: dto.active !== undefined ? dto.active : true,
    });
    log.info("Menu role created", { id: saved.id });
    try {
      const links = (
        await MenuLinkService.Query({
          active: true,
          orderBy: "priority",
          order: "ASC",
          persona: dto.persona,
          page: 1,
          limit: 10000,
        })
      ).data;
      if (links.length > 0) {
        await MenuAccessService.BulkCreateMenuAccessService({
          menuRoleId: saved.id,
          menuLinks: links.map((link) => ({
            menuLinkId: link.id,
            read: false,
            create: false,
            update: false,
            delete: false,
          })),
        });
        log.info("Default access entries created for new role", { roleId: saved.id, count: links.length });
      }
    } catch (error) {
      log.error("Failed creating default access for new role", { roleId: saved.id, error });
    }
    return saved;
  }

  static async EntityByIdService(id: string): Promise<MenuRolesData | null> {
    const log = logger();
    log.info("Getting menu role", { id });
    const menuRole = await this.FindById(id);
    if (!menuRole) log.warn("Menu role not found", { id });
    return menuRole;
  }

  static async SearchService(dto: SearchMenuRolesDto) {
    const log = logger();
    log.info("Searching menu roles", { searchTerm: dto.searchTerm });
    return this.Query(dto);
  }

  static async DeleteService(id: string): Promise<boolean> {
    const log = logger();
    log.info("Deleting menu role", { id });
    const result = await this.Db().delete(menuRoleEntity).where(eq(menuRoleEntity.id, id));
    const deleted = (result.rowCount ?? 0) > 0;
    if (deleted) log.info("Menu role deleted successfully", { id });
    else log.warn("Menu role not found for deletion", { id });
    return deleted;
  }
}
