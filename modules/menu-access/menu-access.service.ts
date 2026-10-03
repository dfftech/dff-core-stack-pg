import { AppCodeByType, toViewMapper } from "dff-util";
import { and, asc, count, desc, eq, inArray, type SQL } from "drizzle-orm";
import { logger, session_db, session_user } from "../../utils/app-util";
import MenuGroupService from "../menu-group/menu-group.service";
import MenuLinkService from "../menu-link/menu-link.service";
import MenuRoleService from "../menu-role/menu-role.service";
import type {
  BulkCreateMenuAccessDto,
  CheckAccessDto,
  MenuAccessDto,
  SearchMenuAccessDto,
} from "./menu-access.dto";
import { menuAccessEntity, type MenuAccessEntity } from "./menu-access.entity";
import type { MenuAccessData } from "./menu-access.types";

const EMPTY_ACTIONS = { read: false, create: false, update: false, delete: false };

export default class MenuAccessService {
  static Db() {
    return session_db();
  }

  static EntityService() {
    return menuAccessEntity;
  }

  static AuditUpdate(entity: MenuAccessEntity, isNew: boolean): MenuAccessEntity {
    const now = new Date();
    const by = session_user()?.id ?? "System";
    return {
      ...entity,
      updated_at: now,
      updated_by: by,
      ...(isNew ? { created_at: now, created_by: by } : {}),
    };
  }

  static async FindById(id: string): Promise<MenuAccessData | null> {
    const rows = await this.Db().select().from(menuAccessEntity).where(eq(menuAccessEntity.id, id)).limit(1);
    return rows[0] ? (toViewMapper(rows[0]) as MenuAccessData) : null;
  }

  static async FindByRoleAndLink(menuRoleId: string, menuLinkId: string): Promise<MenuAccessData | null> {
    const rows = await this.Db()
      .select()
      .from(menuAccessEntity)
      .where(and(eq(menuAccessEntity.menu_role_id, menuRoleId), eq(menuAccessEntity.menu_link_id, menuLinkId)))
      .limit(1);
    return rows[0] ? (toViewMapper(rows[0]) as MenuAccessData) : null;
  }

  static Where(dto: SearchMenuAccessDto): SQL | undefined {
    const table = menuAccessEntity;
    const parts: SQL[] = [];
    if (dto.menuRoleId) {
      const ids = Array.isArray(dto.menuRoleId) ? dto.menuRoleId : [dto.menuRoleId];
      if (ids.length) parts.push(inArray(table.menu_role_id, ids));
    }
    if (dto.menuLinkId) parts.push(eq(table.menu_link_id, dto.menuLinkId));
    if (dto.persona !== undefined) parts.push(eq(table.persona, dto.persona));
    return parts.length ? and(...parts) : undefined;
  }

  static async Query(dto: SearchMenuAccessDto): Promise<{ data: MenuAccessData[]; total: number }> {
    const table = menuAccessEntity;
    const where = this.Where(dto);
    const limit = dto.limit || 10;
    const skip = ((dto.page || 1) - 1) * limit;
    const order = dto.order?.toUpperCase() === "ASC" ? asc(table.updated_at) : desc(table.updated_at);
    const [rows, totalRow] = await Promise.all([
      this.Db().select().from(table).where(where).orderBy(order).limit(limit).offset(skip),
      this.Db().select({ value: count() }).from(table).where(where),
    ]);
    return {
      data: rows.map((row) => toViewMapper(row) as MenuAccessData),
      total: Number(totalRow[0]?.value ?? 0),
    };
  }

  static async Upsert(data: {
    id: string;
    menuRoleId: string;
    menuLinkId: string;
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    persona?: string;
  }): Promise<MenuAccessData> {
    const existing =
      (await this.Db().select().from(menuAccessEntity).where(eq(menuAccessEntity.id, data.id)).limit(1))[0] ?? null;
    let entity = this.AuditUpdate(
      {
        ...(existing ?? {}),
        id: data.id,
        menu_role_id: data.menuRoleId,
        menu_link_id: data.menuLinkId,
        read: data.read,
        create: data.create,
        update: data.update,
        delete: data.delete,
        persona: data.persona ?? existing?.persona ?? null,
      } as MenuAccessEntity,
      !existing
    );
    if (existing) {
      await this.Db().update(menuAccessEntity).set(entity).where(eq(menuAccessEntity.id, entity.id));
    } else {
      const [inserted] = await this.Db().insert(menuAccessEntity).values(entity).returning();
      entity = inserted ?? entity;
    }
    return toViewMapper(entity) as MenuAccessData;
  }

  static locked(menuLink: { menuGroupId?: string; menuGroup?: unknown } | null) {
    return Boolean(
      menuLink && menuLink.menuGroupId && menuLink.menuGroupId !== "ROOT" && !menuLink.menuGroup
    );
  }

  static async SaveService(dto: MenuAccessDto): Promise<MenuAccessData> {
    const log = logger();
    const id = dto.id || AppCodeByType(dto.menuLinkId, dto.menuRoleId);
    log.info("Creating menu access", { menuRoleId: dto.menuRoleId, menuLinkId: dto.menuLinkId });
    const existing = await this.FindById(id);
    if (existing && !dto.id) throw new Error(`Menu access already exists with id ${id}`);
    const saved = await this.Upsert({
      id,
      menuRoleId: dto.menuRoleId,
      menuLinkId: dto.menuLinkId,
      read: dto.read,
      create: dto.create,
      update: dto.update,
      delete: dto.delete,
      persona: dto.persona,
    });
    log.info("Menu access created", { id: saved.id });
    return saved;
  }

  static async EntityByIdService(id: string) {
    const log = logger();
    log.info("Getting menu access", { id });
    const menuAccess = await this.FindById(id);
    if (!menuAccess) {
      log.warn("Menu access not found", { id });
      return null;
    }
    const [menuLink, menuRole] = await Promise.all([
      MenuLinkService.EntityByIdService(menuAccess.menuLinkId),
      MenuRoleService.FindById(menuAccess.menuRoleId),
    ]);
    if (!menuLink || this.locked(menuLink)) {
      return { ...menuAccess, ...EMPTY_ACTIONS, menuLink: menuLink || null, menuRole };
    }
    return { ...menuAccess, menuLink, menuRole };
  }

  static async SearchService(dto: SearchMenuAccessDto) {
    const log = logger();
    log.info("Searching menu access", { menuRoleId: dto.menuRoleId, menuLinkId: dto.menuLinkId });
    const roleIds = dto.menuRoleId ? (Array.isArray(dto.menuRoleId) ? dto.menuRoleId : [dto.menuRoleId]) : null;

    if (roleIds && roleIds.length > 0) {
      const allData = [];
      for (const roleId of roleIds) {
        const role = await MenuRoleService.FindById(roleId);
        if (!role) continue;
        const [links, existingAccess] = await Promise.all([
          MenuLinkService.Query({
            active: true,
            persona: role.persona,
            page: 1,
            limit: 10000,
            orderBy: "priority",
            order: "ASC",
          }),
          this.Query({
            menuRoleId: roleId,
            menuLinkId: dto.menuLinkId,
            persona: dto.persona,
            page: 1,
            limit: 10000,
            orderBy: "updated_at",
            order: "DESC",
          }),
        ]);
        const accessMap = new Map(existingAccess.data.map((row) => [row.menuLinkId, row]));
        const roleData = await Promise.all(
          links.data.map(async (link) => {
            const menuGroup =
              !link.menuGroupId || link.menuGroupId === "ROOT"
                ? { id: "ROOT" }
                : await MenuGroupService.FindById(link.menuGroupId);
            const existing = accessMap.get(link.id);
            const groupMissing = link.menuGroupId && link.menuGroupId !== "ROOT" && !menuGroup;
            if (existing && !groupMissing) {
              return { ...existing, menuLink: { ...link, menuGroup }, menuRole: role };
            }
            return {
              id: existing?.id || AppCodeByType(link.id, roleId),
              menuRoleId: roleId,
              menuLinkId: link.id,
              ...EMPTY_ACTIONS,
              persona: role.persona || "",
              menuLink: { ...link, menuGroup },
              menuRole: role,
            };
          })
        );
        allData.push(...roleData);
      }
      return { data: allData, total: allData.length };
    }

    const { data: accessList, total } = await this.Query(dto);
    const data = await Promise.all(
      accessList.map(async (acc) => {
        const [menuLink, menuRole] = await Promise.all([
          MenuLinkService.EntityByIdService(acc.menuLinkId),
          MenuRoleService.FindById(acc.menuRoleId),
        ]);
        if (!menuLink || this.locked(menuLink)) {
          return { ...acc, ...EMPTY_ACTIONS, menuLink: menuLink || null, menuRole };
        }
        return { ...acc, menuLink, menuRole };
      })
    );
    return { data, total };
  }

  static async BulkCreateMenuAccessService(dto: BulkCreateMenuAccessDto): Promise<MenuAccessData[]> {
    const log = logger();
    const role = await MenuRoleService.FindById(dto.menuRoleId);
    log.info("Bulk creating menu access", { menuRoleId: dto.menuRoleId, count: dto.menuLinks.length });
    const saved: MenuAccessData[] = [];
    for (const menuLink of dto.menuLinks) {
      const existing = await this.FindByRoleAndLink(dto.menuRoleId, menuLink.menuLinkId);
      saved.push(
        await this.Upsert({
          id: existing?.id || AppCodeByType(menuLink.menuLinkId, dto.menuRoleId),
          menuRoleId: dto.menuRoleId,
          menuLinkId: menuLink.menuLinkId,
          read: menuLink.read,
          create: menuLink.create,
          update: menuLink.update,
          delete: menuLink.delete,
          persona: role?.persona || "",
        })
      );
    }
    log.info("Bulk menu access created", { count: saved.length });
    return saved;
  }

  static async CheckAccessService(dto: CheckAccessDto): Promise<{ hasAccess: boolean }> {
    const log = logger();
    log.info("Checking access", { menuRoleIds: dto.menuRoleIds, menuLinkId: dto.menuLinkId, action: dto.action });
    if (!dto.menuRoleIds.length) return { hasAccess: false };
    const column = {
      read: menuAccessEntity.read,
      create: menuAccessEntity.create,
      update: menuAccessEntity.update,
      delete: menuAccessEntity.delete,
    }[dto.action];
    const rows = await this.Db()
      .select({ id: menuAccessEntity.id })
      .from(menuAccessEntity)
      .where(
        and(
          inArray(menuAccessEntity.menu_role_id, dto.menuRoleIds),
          eq(menuAccessEntity.menu_link_id, dto.menuLinkId),
          eq(column, true)
        )
      )
      .limit(1);
    return { hasAccess: rows.length > 0 };
  }

  static async DeleteService(id: string): Promise<boolean> {
    const log = logger();
    log.info("Deleting menu access", { id });
    const result = await this.Db().delete(menuAccessEntity).where(eq(menuAccessEntity.id, id));
    const deleted = (result.rowCount ?? 0) > 0;
    if (deleted) log.info("Menu access deleted successfully", { id });
    else log.warn("Menu access not found for deletion", { id });
    return deleted;
  }
}
