import { AppCode, AppCodeByType } from 'dff-util';
import { db_type, logger, session_user } from '../../utils/app-util';
import type { CreateMenuRoleDto, GetMenuRoleDto, SearchMenuRolesDto } from './menu_roles.dto';
import type { MenuRolesData } from './menu_roles.types';
import { MenuRolesMongoService } from './schemas/mongo.service';
import { MenuRolesPostgresService } from './schemas/postgres.service';
import MenuLinksService from '../menu_links/menu_links.service';
import MenuAccessService from '../menu_access/menu_access.service';

export default class MenuRolesService {
  static getMenuRolesDbService(): MenuRolesMongoService | MenuRolesPostgresService {
    const dbType = db_type();
    if (dbType === 'postgres') {
      return new MenuRolesPostgresService();
    } else if (dbType === 'mongo') {
      return new MenuRolesMongoService();
    } else {
      throw new Error('Invalid database type');
    }
  }

  static async CreateMenuRoleService(dto: CreateMenuRoleDto): Promise<MenuRolesData> {
    const log = logger();
    const user = session_user();
    const dbService = this.getMenuRolesDbService();

    log.info('Creating menu role', { name: dto.nameLang?.['en-US'] });

    const menuRoleData = {
      // id: dto.id || AppCode(dto.nameLang?.['en-US'] || dto.name || 'menu_role'),
      id: dto.id || AppCodeByType(dto.nameLang?.['en-US'] || dto.name || 'menu_role', dto.persona as any),
      name: dto.name || dto.nameLang?.['en-US'] || '',
      nameLang: dto.nameLang,
      persona: dto.persona,
      active: dto.active !== undefined ? dto.active : true,
    };

    const existing = await dbService.findById(menuRoleData.id);

    if (existing && !dto.id) {
      throw new Error(`Menu role already exists with id ${menuRoleData.id}`);
    }



    const saved = await dbService.save(menuRoleData, user.id);
    log.info('Menu role created', { id: saved.id });

    try {
      const linksDb = MenuLinksService.getMenuLinksDbService();
      const links = await linksDb.search({
        active: true,
        orderBy: 'priority',
        order: 'ASC',
        persona: dto.persona,
        page: 1,
        limit: 10000,
      });
      if (links.length > 0) {
        await MenuAccessService.BulkCreateMenuAccessService({
          menuRoleId: saved.id,
          menuLinks: links.map((l: any) => ({
            menuLinkId: l.id,
            read: false,
            create: false,
            update: false,
            delete: false,
          })),
        });
        log.info('Default access entries created for new role', { roleId: saved.id, count: links.length });
      } else {
        log.info('No menu links found for persona; skipping default access creation', { roleId: saved.id });
      }
    } catch (e: any) {
      log.error('Failed creating default access for new role', { roleId: saved.id, error: e?.message });
    }

    return saved;
  }

  static async GetMenuRoleService(dto: GetMenuRoleDto): Promise<MenuRolesData | null> {
    const log = logger();
    const dbService = this.getMenuRolesDbService();

    log.info('Getting menu role', { id: dto.id });

    const menuRole = await dbService.findById(dto.id);

    if (!menuRole) {
      log.warn('Menu role not found', { id: dto.id });
      return null;
    }

    return menuRole;
  }



  static async SearchMenuRolesService(dto: SearchMenuRolesDto): Promise<{ data: MenuRolesData[]; total: number }> {
    const log = logger();
    const dbService = this.getMenuRolesDbService();

    log.info('Searching menu roles', { searchTerm: dto.searchTerm });

    const [data, total] = await Promise.all([dbService.search(dto), dbService.count(dto)]);

    return { data, total };
  }

  static async DeleteMenuRoleService(id: string): Promise<boolean> {
    const log = logger();
    const dbService = this.getMenuRolesDbService();

    log.info('Deleting menu role', { id });

    const deleted = await dbService.deleteById(id);

    if (deleted) {
      log.info('Menu role deleted successfully', { id });
    } else {
      log.warn('Menu role not found for deletion', { id });
    }

    return deleted;
  }
}
