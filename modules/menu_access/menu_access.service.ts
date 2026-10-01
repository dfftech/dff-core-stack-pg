import { AppCode, AppCodeByType } from 'dff-util';
import { db_type, logger, session_user } from '../../utils/app-util';
import type {
  BulkCreateMenuAccessDto,
  CheckAccessDto,
  CreateMenuAccessDto,
  GetMenuAccessDto,
  SearchMenuAccessDto,
} from './menu_access.dto';
import type { MenuAccessData } from './menu_access.types';
import { MenuAccessMongoService } from './schemas/mongo.service';
import { MenuAccessPostgresService } from './schemas/postgres.service';
import MenuLinksService from '../menu_links/menu_links.service';
import MenuRolesService from '../menu_roles/menu_roles.service';
import MenuGroupsService from '../menu_groups/menu_groups.service';

export default class MenuAccessService {
  static getMenuAccessDbService(): MenuAccessMongoService | MenuAccessPostgresService {
    const dbType = db_type();
    if (dbType === 'postgres') {
      return new MenuAccessPostgresService();
    } else if (dbType === 'mongo') {
      return new MenuAccessMongoService();
    } else {
      throw new Error('Invalid database type');
    }
  }

  static async CreateMenuAccessService(dto: CreateMenuAccessDto): Promise<MenuAccessData> {
    const log = logger();
    const user = session_user();
    const dbService = this.getMenuAccessDbService();

    log.info('Creating menu access', { menuRoleId: dto.menuRoleId, menuLinkId: dto.menuLinkId });

    const menuAccessData = {
      // id: dto.id || AppCodeByType(`${dto.menuRoleId}_${dto.menuLinkId}`),
      id: dto.id || AppCodeByType(dto.menuLinkId as any, dto.menuRoleId as any),
      menuRoleId: dto.menuRoleId,
      menuLinkId: dto.menuLinkId,
      read: dto.read,
      create: dto.create,
      update: dto.update,
      delete: dto.delete,
      persona: dto.persona,
    };
    const existing = await dbService.findById(menuAccessData.id);

    if (existing && !dto.id) {
      throw new Error(`Menu access already exists with id ${menuAccessData.id}`);
    }



    const saved = await dbService.save(menuAccessData, user.id);
    log.info('Menu access created', { id: saved.id });

    return saved;
  }

  static async GetMenuAccessService(dto: GetMenuAccessDto): Promise<MenuAccessData | null> {
    const log = logger();
    const dbService = this.getMenuAccessDbService();

    log.info('Getting menu access', { id: dto.id });

    const menuAccess = await dbService.findById(dto.id);

    if (!menuAccess) {
      log.warn('Menu access not found', { id: dto.id });
      return null;
    }

    const rolesDb = MenuRolesService.getMenuRolesDbService();
    const [menuLink, menuRole] = await Promise.all([
      MenuLinksService.GetMenuLinkService({ id: menuAccess.menuLinkId }),
      rolesDb.findById(menuAccess.menuRoleId),
    ]);

    const groupMissing =
      menuLink &&
      (menuLink as any).menuGroupId &&
      (menuLink as any).menuGroupId !== 'ROOT' &&
      !(menuLink as any).menuGroup;

    if (!menuLink || groupMissing) {
      return {
        ...menuAccess,
        read: false,
        create: false,
        update: false,
        delete: false,
        menuLink: menuLink || null,
        menuRole,
      } as any;
    }

    return { ...menuAccess, menuLink, menuRole } as any;
  }

  static async SearchMenuAccessService(dto: SearchMenuAccessDto): Promise<{ data: MenuAccessData[]; total: number }> {
    const log = logger();
    const dbService = this.getMenuAccessDbService();

    log.info('Searching menu access', { menuRoleId: dto.menuRoleId, menuLinkId: dto.menuLinkId });

    const rolesDb = MenuRolesService.getMenuRolesDbService();
    const linksDb = MenuLinksService.getMenuLinksDbService();
    const groupsDb = MenuGroupsService.getMenuGroupsDbService();

    const roleIds = dto.menuRoleId
      ? (Array.isArray(dto.menuRoleId) ? dto.menuRoleId : [dto.menuRoleId])
      : null;

    if (roleIds && roleIds.length > 0) {
      const allData: any[] = [];
      const emptyActions = { read: false, create: false, update: false, delete: false };

      for (const roleId of roleIds) {
        const role = await rolesDb.findById(roleId);
        if (!role) continue;

        const [allLinks, existingAccess] = await Promise.all([
          linksDb.search({
            active: true,
            persona: (role as any).persona,
            page: 1,
            limit: 10000,
            orderBy: 'priority',
            order: 'ASC',
          }),
          // Pull all existing access rows for the role before merging with all links.
          // Using dto pagination here (default limit=10) causes false negatives.
          dbService.search({
            menuRoleId: roleId,
            menuLinkId: dto.menuLinkId,
            persona: dto.persona,
            page: 1,
            limit: 10000,
            orderBy: 'updated_at',
            order: 'DESC',
          }),
        ]);

        const accessMap = new Map<string, any>();
        for (const acc of existingAccess) {
          accessMap.set(acc.menuLinkId, acc);
        }

        const roleData = await Promise.all(
          allLinks.map(async (link: any) => {
            const menuGroup =
              !link.menuGroupId || link.menuGroupId === 'ROOT'
                ? ({ id: 'ROOT' } as any)
                : await groupsDb.findById(link.menuGroupId);

            const existing = accessMap.get(link.id);
            const groupMissing = link.menuGroupId && link.menuGroupId !== 'ROOT' && !menuGroup;

            if (existing && !groupMissing) {
              return {
                ...existing,
                menuLink: { ...link, menuGroup },
                menuRole: role,
              };
            }

            return {
              id: existing?.id || AppCodeByType(link.id, roleId as any),
              menuRoleId: roleId,
              menuLinkId: link.id,
              ...emptyActions,
              persona: (role as any).persona || '',
              menuLink: { ...link, menuGroup },
              menuRole: role,
            };
          })
        );

        allData.push(...roleData);
      }

      return { data: allData as any, total: allData.length };
    }

    const [accessList, total] = await Promise.all([dbService.search(dto), dbService.count(dto)]);

    const data = await Promise.all(
      accessList.map(async (acc) => {
        const [menuLink, menuRole] = await Promise.all([
          MenuLinksService.GetMenuLinkService({ id: acc.menuLinkId }),
          rolesDb.findById(acc.menuRoleId),
        ]);

        if (!menuLink || ((menuLink as any).menuGroupId && (menuLink as any).menuGroupId !== 'ROOT' && !(menuLink as any).menuGroup)) {
          return {
            ...acc,
            read: false,
            create: false,
            update: false,
            delete: false,
            menuLink: menuLink || null,
            menuRole,
          } as any;
        }

        return { ...acc, menuLink, menuRole } as any;
      })
    );

    return { data: data as any, total };
  }

  static async BulkCreateMenuAccessService(dto: BulkCreateMenuAccessDto): Promise<MenuAccessData[]> {
    const log = logger();
    const user = session_user();
    const dbService = this.getMenuAccessDbService();
    const rolesDb = (await import('../menu_roles/menu_roles.service')).default.getMenuRolesDbService();
    const role = await rolesDb.findById(dto.menuRoleId);

    log.info('Bulk creating menu access', { menuRoleId: dto.menuRoleId, count: dto.menuLinks.length });

    const saved: MenuAccessData[] = [];

    for (const menuLink of dto.menuLinks) {
      const existing = await dbService.findByRoleAndLink(dto.menuRoleId, menuLink.menuLinkId);
      const menuAccessData = {
        // id: existing?.id || AppCodeByType(`${dto.menuRoleId}_${menuLink.menuLinkId}`),
        id: existing?.id || AppCodeByType(menuLink.menuLinkId, dto.menuRoleId as any),
        menuRoleId: dto.menuRoleId,
        menuLinkId: menuLink.menuLinkId,
        read: menuLink.read,
        create: menuLink.create,
        update: menuLink.update,
        delete: menuLink.delete,
        persona: role?.persona || '',
      };

      const result = await dbService.save(menuAccessData, user.id);
      saved.push(result);
    }

    log.info('Bulk menu access created', { count: saved.length });
    return saved;
  }

  static async CheckAccessService(dto: CheckAccessDto): Promise<{ hasAccess: boolean }> {
    const log = logger();
    const dbService = this.getMenuAccessDbService();

    log.info('Checking access', { menuRoleIds: dto.menuRoleIds, menuLinkId: dto.menuLinkId, action: dto.action });

    const hasAccess = await dbService.checkAccess(dto.menuRoleIds, dto.menuLinkId, dto.action);

    return { hasAccess };
  }

  static async DeleteMenuAccessService(id: string): Promise<boolean> {
    const log = logger();
    const dbService = this.getMenuAccessDbService();

    log.info('Deleting menu access', { id });

    const deleted = await dbService.deleteById(id);

    if (deleted) {
      log.info('Menu access deleted successfully', { id });
    } else {
      log.warn('Menu access not found for deletion', { id });
    }

    return deleted;
  }
}
