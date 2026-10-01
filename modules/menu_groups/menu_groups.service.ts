import { AppCode, AppCodeByType } from 'dff-util';
import { db_type, logger, session_user } from '../../utils/app-util';
import type { CreateMenuGroupDto, GetMenuGroupDto, SearchMenuGroupsDto } from './menu_groups.dto';
import type { MenuGroupsData } from './menu_groups.types';
import { MenuGroupsMongoService } from './schemas/mongo.service';
import { MenuGroupsPostgresService } from './schemas/postgres.service';
import MenuLinksService from '../menu_links/menu_links.service';

export default class MenuGroupsService {
  static getMenuGroupsDbService(): MenuGroupsMongoService | MenuGroupsPostgresService {
    const dbType = db_type();
    if (dbType === 'postgres') {
      return new MenuGroupsPostgresService();
    } else if (dbType === 'mongo') {
      return new MenuGroupsMongoService();
    } else {
      throw new Error('Invalid database type');
    }
  }

  static async CreateMenuGroupService(dto: CreateMenuGroupDto): Promise<MenuGroupsData> {
    const log = logger();
    const user = session_user();
    const dbService = this.getMenuGroupsDbService();

    log.info('Creating menu group', { name: dto.nameLang?.['en-US'] });

    const menuGroupData = {
      id: dto.id || AppCodeByType(dto.nameLang?.['en-US'] || dto.name || 'menu_group', dto.persona as any),
      // id: dto.id || AppCode(dto.nameLang?.['en-US'] || dto.name || 'menu_group'),
      active: dto.active !== undefined ? dto.active : true,
      icon: dto.icon,
      name: dto.name || dto.nameLang?.['en-US'] || '',
      nameLang: dto.nameLang,
      priority: dto.priority,
      persona: dto.persona,
    };

    const existing = await dbService.findById(menuGroupData.id);

    if (existing && !dto.id) {
      throw new Error(`Menu group already exists with id ${menuGroupData.id}`);
    }



    const saved = await dbService.save(menuGroupData, user.id);
    log.info('Menu group created', { id: saved.id });

    return saved;
  }

  static async GetMenuGroupService(dto: GetMenuGroupDto): Promise<MenuGroupsData | null> {
    const log = logger();
    const dbService = this.getMenuGroupsDbService();

    log.info('Getting menu group', { id: dto.id });

    const menuGroup = await dbService.findById(dto.id);

    if (!menuGroup) {
      log.warn('Menu group not found', { id: dto.id });
      return null;
    }

    const linksDb = MenuLinksService.getMenuLinksDbService();
    const links = await linksDb.search({
      menuGroupId: menuGroup.id,
      persona: menuGroup.persona,
      active: true,
      orderBy: 'priority',
      order: 'ASC',
      page: 1,
      limit: 1000,
    });

    return { ...menuGroup, links } as any;
  }



  static async SearchMenuGroupsService(dto: SearchMenuGroupsDto): Promise<{ data: MenuGroupsData[]; total: number }> {
    const log = logger();
    const dbService = this.getMenuGroupsDbService();

    log.info('Searching menu groups', { searchTerm: dto.searchTerm });

    const [groups, total] = await Promise.all([dbService.search(dto), dbService.count(dto)]);

    const linksDb = MenuLinksService.getMenuLinksDbService();
    const dataWithLinks = await Promise.all(
      groups.map(async (group) => {
        const links = await linksDb.search({
          menuGroupId: group.id,
          persona: group.persona,
          active: true,
          orderBy: 'priority',
          order: 'ASC',
          page: 1,
          limit: 1000,
        });
        return { ...group, links } as any;
      })
    );

    // Find menu links with empty/null/ROOT menu_group_id and add them under ROOT group
    const rootLinksQuery: any = {
      orderBy: 'priority',
      order: 'ASC',
      page: 1,
      limit: 1000,
    };

    // Add filters to match the menu groups search criteria
    if (dto.active !== undefined) {
      rootLinksQuery.active = dto.active;
    }

    if (dto.persona !== undefined) {
      rootLinksQuery.persona = dto.persona;
    }

    // Search for links with empty/null/ROOT menu_group_id (using 'ROOT' as special value)
    const uniqueRootLinks = await linksDb.search({
      ...rootLinksQuery,
      menuGroupId: 'ROOT', // Special value to find null/empty/ROOT menu_group_id
    });

    // If there are any root links, add ROOT group to the results
    if (uniqueRootLinks.length > 0) {
      const rootGroup: any = {
        id: 'ROOT',
        active: true,
        icon: 'root',
        name: 'Root',
        nameLang: { 'en-US': 'Root' },
        priority: 0,
        persona: dto.persona || null,
        links: uniqueRootLinks,
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      };

      // Add ROOT group at the beginning (priority 0)
      dataWithLinks.unshift(rootGroup);
    }

    return { data: dataWithLinks as any, total: dataWithLinks.length };
  }

  static async DeleteMenuGroupService(id: string): Promise<boolean> {
    const log = logger();
    const dbService = this.getMenuGroupsDbService();

    log.info('Deleting menu group', { id });

    const deleted = await dbService.deleteById(id);

    if (deleted) {
      log.info('Menu group deleted successfully', { id });
    } else {
      log.warn('Menu group not found for deletion', { id });
    }

    return deleted;
  }
}
