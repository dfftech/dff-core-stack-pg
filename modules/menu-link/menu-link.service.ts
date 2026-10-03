import { AppCodeByType, toViewMapper } from "dff-util";
import { and, asc, count, desc, eq, ilike, isNull, or, sql, type SQL } from "drizzle-orm";
import { logger, session_db, session_user } from "../../utils/app-util";
import MenuGroupService from "../menu-group/menu-group.service";
import type { MenuLinkDto, SearchMenuLinksDto } from "./menu-link.dto";
import { menuLinkEntity, type MenuLinkEntity } from "./menu-link.entity";
import type { MenuLinksData } from "./menu-link.types";

export default class MenuLinkService {
  static Db() {
    return session_db();
  }

  static EntityService() {
    return menuLinkEntity;
  }

  static AuditUpdate(entity: MenuLinkEntity, isNew: boolean): MenuLinkEntity {
    const now = new Date();
    const by = session_user()?.id ?? "System";
    return {
      ...entity,
      updated_at: now,
      updated_by: by,
      ...(isNew ? { created_at: now, created_by: by } : {}),
    };
  }

  static async FindById(id: string): Promise<MenuLinksData | null> {
    const rows = await this.Db().select().from(menuLinkEntity).where(eq(menuLinkEntity.id, id)).limit(1);
    return rows[0] ? (toViewMapper(rows[0]) as MenuLinksData) : null;
  }

  static Where(dto: SearchMenuLinksDto): SQL | undefined {
    const table = menuLinkEntity;
    const parts: SQL[] = [];
    if (dto.searchTerm) {
      const term = `%${dto.searchTerm}%`;
      const match = or(
        ilike(table.name, term),
        ilike(table.href, term),
        sql`${table.name_lang}->>'en-US' ILIKE ${term}`
      );
      if (match) parts.push(match);
    }
    if (dto.menuGroupId !== undefined) {
      if (dto.menuGroupId === null || dto.menuGroupId === "ROOT" || dto.menuGroupId === "") {
        const root = or(isNull(table.menu_group_id), eq(table.menu_group_id, ""), eq(table.menu_group_id, "ROOT"));
        if (root) parts.push(root);
      } else {
        parts.push(eq(table.menu_group_id, dto.menuGroupId));
      }
    }
    if (dto.persona !== undefined) parts.push(eq(table.persona, dto.persona));
    if (dto.active !== undefined) parts.push(eq(table.active, dto.active));
    return parts.length ? and(...parts) : undefined;
  }

  static async Query(dto: SearchMenuLinksDto): Promise<{ data: MenuLinksData[]; total: number }> {
    const table = menuLinkEntity;
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
      data: rows.map((row) => toViewMapper(row) as MenuLinksData),
      total: Number(totalRow[0]?.value ?? 0),
    };
  }

  static async Upsert(data: {
    id: string;
    active: boolean;
    href: string;
    icon: string;
    menuGroupId: string;
    name: string;
    nameLang: Record<string, string>;
    priority: number;
    persona?: string;
  }): Promise<MenuLinksData> {
    const existing =
      (await this.Db().select().from(menuLinkEntity).where(eq(menuLinkEntity.id, data.id)).limit(1))[0] ?? null;
    let entity = this.AuditUpdate(
      {
        ...(existing ?? {}),
        id: data.id,
        active: data.active,
        href: data.href,
        icon: data.icon,
        menu_group_id: data.menuGroupId,
        name: data.name,
        name_lang: data.nameLang,
        priority: data.priority,
        persona: data.persona ?? existing?.persona ?? null,
      } as MenuLinkEntity,
      !existing
    );
    if (existing) {
      await this.Db().update(menuLinkEntity).set(entity).where(eq(menuLinkEntity.id, entity.id));
    } else {
      const [inserted] = await this.Db().insert(menuLinkEntity).values(entity).returning();
      entity = inserted ?? entity;
    }
    return toViewMapper(entity) as MenuLinksData;
  }

  static async SaveService(dto: MenuLinkDto): Promise<MenuLinksData> {
    const log = logger();
    const id = dto.id || AppCodeByType(dto.name as string, dto.persona as string);
    log.info("Creating menu link", { name: dto.nameLang?.["en-US"] });
    const existing = await this.FindById(id);
    if (existing && !dto.id) throw new Error(`Menu link already exists with id ${id}`);
    const saved = await this.Upsert({
      id,
      active: dto.active !== undefined ? dto.active : true,
      href: dto.href,
      icon: dto.icon,
      menuGroupId: dto.menuGroupId || "ROOT",
      name: dto.name || dto.nameLang?.["en-US"] || "",
      nameLang: dto.nameLang,
      priority: dto.priority,
      persona: dto.persona,
    });
    log.info("Menu link created", { id: saved.id });
    return saved;
  }

  static async attachGroup(link: MenuLinksData) {
    const menuGroup =
      !link.menuGroupId || link.menuGroupId === "ROOT"
        ? { id: "ROOT" }
        : await MenuGroupService.FindById(link.menuGroupId);
    return { ...link, menuGroup };
  }

  static async EntityByIdService(id: string) {
    const log = logger();
    log.info("Getting menu link", { menuLinkId: id });
    const menuLink = await this.FindById(id);
    if (!menuLink) {
      log.warn("Menu link not found", { id });
      return null;
    }
    return this.attachGroup(menuLink);
  }

  static async SearchService(dto: SearchMenuLinksDto) {
    const log = logger();
    log.info("Searching menu links", { searchTerm: dto.searchTerm });
    const { data, total } = await this.Query(dto);
    const dataWithGroup = await Promise.all(data.map((link) => this.attachGroup(link)));
    return { data: dataWithGroup, total };
  }

  static async DeleteService(id: string): Promise<boolean> {
    const log = logger();
    log.info("Deleting menu link", { id });
    const existing = await this.FindById(id);
    if (!existing) {
      log.warn("Menu link not found for deletion", { id });
      return false;
    }
    const result = await this.Db().delete(menuLinkEntity).where(eq(menuLinkEntity.id, id));
    const deleted = (result.rowCount ?? 0) > 0;
    if (deleted) log.info("Menu link deleted successfully", { id });
    return deleted;
  }
}
