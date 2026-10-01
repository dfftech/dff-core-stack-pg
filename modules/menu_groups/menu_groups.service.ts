import { AppCodeByType, toViewMapper } from "dff-util";
import { and, asc, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { logger, session_db, session_user } from "../../utils/app-util";
import MenuLinksService from "../menu_links/menu_links.service";
import type { CreateMenuGroupDto, GetMenuGroupDto, SearchMenuGroupsDto } from "./menu_groups.dto";
import { menuGroupEntity, type MenuGroupEntity } from "./menu_groups.entity";
import type { MenuGroupsData } from "./menu_groups.types";

export default class MenuGroupsService {
  static Db() {
    return session_db();
  }

  static EntityService() {
    return menuGroupEntity;
  }

  static AuditUpdate(entity: MenuGroupEntity, isNew: boolean): MenuGroupEntity {
    const now = new Date();
    const by = session_user()?.id ?? "System";
    return {
      ...entity,
      updated_at: now,
      updated_by: by,
      ...(isNew ? { created_at: now, created_by: by } : {}),
    };
  }

  static async FindById(id: string): Promise<MenuGroupsData | null> {
    const rows = await this.Db().select().from(menuGroupEntity).where(eq(menuGroupEntity.id, id)).limit(1);
    return rows[0] ? (toViewMapper(rows[0]) as MenuGroupsData) : null;
  }

  static Where(dto: SearchMenuGroupsDto): SQL | undefined {
    const table = menuGroupEntity;
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

  static async Query(dto: SearchMenuGroupsDto): Promise<{ data: MenuGroupsData[]; total: number }> {
    const table = menuGroupEntity;
    const where = this.Where(dto);
    const limit = dto.limit || 10;
    const skip = ((dto.page || 1) - 1) * limit;
    const col = dto.orderBy === "name" ? table.name : dto.orderBy === "updated_at" ? table.updated_at : table.priority;
    const order = dto.order?.toUpperCase() === "ASC" ? asc(col) : desc(col);
    const [rows, totalRow] = await Promise.all([
      this.Db().select().from(table).where(where).orderBy(order).limit(limit).offset(skip),
      this.Db().select({ value: count() }).from(table).where(where),
    ]);
    return {
      data: rows.map((row) => toViewMapper(row) as MenuGroupsData),
      total: Number(totalRow[0]?.value ?? 0),
    };
  }

  static async Upsert(data: {
    id: string;
    active: boolean;
    icon: string;
    name: string;
    nameLang: Record<string, string>;
    priority: number;
    persona: string;
  }): Promise<MenuGroupsData> {
    const existing =
      (await this.Db().select().from(menuGroupEntity).where(eq(menuGroupEntity.id, data.id)).limit(1))[0] ?? null;
    let entity = this.AuditUpdate(
      {
        ...(existing ?? {}),
        id: data.id,
        active: data.active,
        icon: data.icon,
        name: data.name,
        name_lang: data.nameLang,
        priority: data.priority,
        persona: data.persona,
      } as MenuGroupEntity,
      !existing
    );
    if (existing) {
      await this.Db().update(menuGroupEntity).set(entity).where(eq(menuGroupEntity.id, entity.id));
    } else {
      const [inserted] = await this.Db().insert(menuGroupEntity).values(entity).returning();
      entity = inserted ?? entity;
    }
    return toViewMapper(entity) as MenuGroupsData;
  }

  static linksFor(groupId: string, persona?: string) {
    return MenuLinksService.Query({
      menuGroupId: groupId,
      persona,
      active: true,
      orderBy: "priority",
      order: "ASC",
      page: 1,
      limit: 1000,
    });
  }

  static async CreateMenuGroupService(dto: CreateMenuGroupDto): Promise<MenuGroupsData> {
    const log = logger();
    const id = dto.id || AppCodeByType(dto.nameLang?.["en-US"] || dto.name || "menu_group", dto.persona);
    log.info("Creating menu group", { name: dto.nameLang?.["en-US"] });
    const existing = await this.FindById(id);
    if (existing && !dto.id) throw new Error(`Menu group already exists with id ${id}`);
    const saved = await this.Upsert({
      id,
      active: dto.active !== undefined ? dto.active : true,
      icon: dto.icon,
      name: dto.name || dto.nameLang?.["en-US"] || "",
      nameLang: dto.nameLang,
      priority: dto.priority,
      persona: dto.persona,
    });
    log.info("Menu group created", { id: saved.id });
    return saved;
  }

  static async GetMenuGroupService(dto: GetMenuGroupDto) {
    const log = logger();
    log.info("Getting menu group", { id: dto.id });
    const menuGroup = await this.FindById(dto.id);
    if (!menuGroup) {
      log.warn("Menu group not found", { id: dto.id });
      return null;
    }
    const links = (await this.linksFor(menuGroup.id, menuGroup.persona)).data;
    return { ...menuGroup, links };
  }

  static async SearchMenuGroupsService(dto: SearchMenuGroupsDto) {
    const log = logger();
    log.info("Searching menu groups", { searchTerm: dto.searchTerm });
    const { data: groups } = await this.Query(dto);
    const dataWithLinks = await Promise.all(
      groups.map(async (group) => {
        const links = (await this.linksFor(group.id, group.persona)).data;
        return { ...group, links };
      })
    );
    const rootLinks = (
      await MenuLinksService.Query({
        menuGroupId: "ROOT",
        active: dto.active,
        persona: dto.persona,
        orderBy: "priority",
        order: "ASC",
        page: 1,
        limit: 1000,
      })
    ).data;
    if (rootLinks.length > 0) {
      dataWithLinks.unshift({
        id: "ROOT",
        active: true,
        icon: "root",
        name: "Root",
        nameLang: { "en-US": "Root" },
        priority: 0,
        persona: dto.persona || "",
        links: rootLinks,
        createdAt: new Date(),
        createdBy: "system",
        updatedAt: new Date(),
        updatedBy: "system",
      } as MenuGroupsData & { links: unknown[] });
    }
    return { data: dataWithLinks, total: dataWithLinks.length };
  }

  static async DeleteMenuGroupService(id: string): Promise<boolean> {
    const log = logger();
    log.info("Deleting menu group", { id });
    const result = await this.Db().delete(menuGroupEntity).where(eq(menuGroupEntity.id, id));
    const deleted = (result.rowCount ?? 0) > 0;
    if (deleted) log.info("Menu group deleted successfully", { id });
    else log.warn("Menu group not found for deletion", { id });
    return deleted;
  }
}
