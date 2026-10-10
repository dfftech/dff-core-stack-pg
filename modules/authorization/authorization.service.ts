import { and, eq, inArray } from "drizzle-orm";
import { FULL_ACCESS_ROLES } from "../../utils/app-roles";
import { logger, session_db } from "../../utils/app-util";
import { menuAccessEntity, type MenuAccessEntity } from "../menu-access/menu-access.entity";
import { menuGroupEntity, type MenuGroupEntity } from "../menu-group/menu-group.entity";
import { menuLinkEntity, type MenuLinkEntity } from "../menu-link/menu-link.entity";
import type { AuthorizationMenuData, AuthorizationRequestDto, PermissionData } from "./authorization.dto";

const ROOT = "ROOT";

function permission(value: boolean): PermissionData {
  return { read: value, create: value, update: value, delete: value };
}

function hasAnyPermission(item: PermissionData): boolean {
  return item.read || item.create || item.update || item.delete;
}

function byPriority(a: AuthorizationMenuData, b: AuthorizationMenuData): number {
  return a.priority - b.priority;
}

export default class AuthorizationService {
  static Db() {
    return session_db();
  }

  /** Merge permissions of all roles per link (OR). */
  static MergeAccess(rows: MenuAccessEntity[]): Map<string, PermissionData> {
    const merged = new Map<string, PermissionData>();
    for (const row of rows) {
      const current = merged.get(row.menu_link_id);
      if (!current) {
        merged.set(row.menu_link_id, {
          read: row.read,
          create: row.create,
          update: row.update,
          delete: row.delete,
        });
        continue;
      }
      current.read ||= row.read;
      current.create ||= row.create;
      current.update ||= row.update;
      current.delete ||= row.delete;
    }
    return merged;
  }

  static LinkNode(link: MenuLinkEntity, access: PermissionData): AuthorizationMenuData {
    return {
      id: link.id,
      type: "link",
      name: link.name,
      nameLang: link.name_lang,
      icon: link.icon,
      href: link.href,
      priority: link.priority,
      persona: link.persona,
      menuGroupId: link.menu_group_id,
      ...access,
      children: [],
    };
  }

  /** Group is readable when any child has a permission; a group has no write permissions unless full access. */
  static GroupNode(
    group: MenuGroupEntity,
    children: AuthorizationMenuData[],
    hasFullAccess: boolean
  ): AuthorizationMenuData {
    const readable = hasFullAccess || children.some(hasAnyPermission);
    return {
      id: group.id,
      type: "group",
      name: group.name,
      nameLang: group.name_lang,
      icon: group.icon,
      priority: group.priority,
      persona: group.persona,
      read: readable,
      create: hasFullAccess,
      update: hasFullAccess,
      delete: hasFullAccess,
      children: children.sort(byPriority),
    };
  }

  static async MenuService(dto: AuthorizationRequestDto): Promise<AuthorizationMenuData[]> {
    const log = logger();
    log.info("Loading authorization menu", { persona: dto.persona, roles: dto.roles });
    const db = this.Db();
    const hasFullAccess = dto.roles.some((role) => FULL_ACCESS_ROLES.includes(role));

    const [groups, links, accessRows]: [MenuGroupEntity[], MenuLinkEntity[], MenuAccessEntity[]] =
      await Promise.all([
        db
          .select()
          .from(menuGroupEntity)
          .where(and(eq(menuGroupEntity.active, true), eq(menuGroupEntity.persona, dto.persona))),
        db
          .select()
          .from(menuLinkEntity)
          .where(and(eq(menuLinkEntity.active, true), eq(menuLinkEntity.persona, dto.persona))),
        hasFullAccess
          ? Promise.resolve([] as MenuAccessEntity[])
          : db.select().from(menuAccessEntity).where(inArray(menuAccessEntity.menu_role_id, dto.roles)),
      ]);

    const access = this.MergeAccess(accessRows);
    const groupMap = new Map(groups.map((group) => [group.id, group]));
    const childrenByGroup = new Map<string, AuthorizationMenuData[]>();
    const items: AuthorizationMenuData[] = [];

    for (const link of links) {
      const node = this.LinkNode(link, hasFullAccess ? permission(true) : access.get(link.id) ?? permission(false));
      const groupId = link.menu_group_id;
      if (!groupId || groupId === ROOT || !groupMap.has(groupId)) {
        items.push(node);
        continue;
      }
      const siblings = childrenByGroup.get(groupId) ?? [];
      siblings.push(node);
      childrenByGroup.set(groupId, siblings);
    }

    for (const group of groups) {
      const children = childrenByGroup.get(group.id);
      if (children?.length) items.push(this.GroupNode(group, children, hasFullAccess));
    }

    return items.sort(byPriority);
  }
}
