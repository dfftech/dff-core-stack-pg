import { AppCode, AppCodeByType } from 'dff-util';
import { db_type, logger, session_user } from '../../utils/app-util';
import type { CreateMenuLinkDto, GetMenuLinkDto, SearchMenuLinksDto } from './menu_links.dto';
import type { MenuLinksData } from './menu_links.types';
import { MenuLinksMongoService } from './schemas/mongo.service';
import { MenuLinksPostgresService } from './schemas/postgres.service';
import MenuGroupsService from '../menu_groups/menu_groups.service';

export default class MenuLinksService {
  static getMenuLinksDbService(): MenuLinksMongoService | MenuLinksPostgresService {
    const dbType = db_type();
    if (dbType === 'postgres') {
      return new MenuLinksPostgresService();
    } else if (dbType === 'mongo') {
      return new MenuLinksMongoService();
    } else {
      throw new Error('Invalid database type');
    }
  }

  static async CreateMenuLinkService(dto: CreateMenuLinkDto): Promise<MenuLinksData> {
    const log = logger();
    const user = session_user();
    const dbService = this.getMenuLinksDbService();

    log.info('Creating menu link', { name: dto.nameLang?.['en-US'] });

    const menuLinkData = {
      id: dto.id || AppCodeByType( dto.name  as any, dto.persona as any),
      // id: dto.id || AppCode(dto.nameLang?.['en-US'] || dto.name || dto.href || 'menu_link'),
      active: dto.active !== undefined ? dto.active : true,
      href: dto.href,
      icon: dto.icon,
      menuGroupId: dto.menuGroupId || 'ROOT',
      name: dto.name || dto.nameLang?.['en-US'] || '',
      nameLang: dto.nameLang,
      priority: dto.priority,
      persona: dto.persona,
    };

    const existing = await dbService.findById(menuLinkData.id);

    if (existing && !dto.id) {
      throw new Error(`Menu link already exists with id ${menuLinkData.id}`);
    }

    const saved = await dbService.save(menuLinkData, user.id);
    log.info('Menu link created', { id: saved.id });

    return saved;
  }

  static async GetMenuLinkService(dto: GetMenuLinkDto): Promise<MenuLinksData | null> {
    const log = logger();
    const dbService = this.getMenuLinksDbService();

    log.info('Getting menu link', { menuLinkId: dto.id });

    const menuLink = await dbService.findById(dto.id);

    if (!menuLink) {
      log.warn('Menu link not found', { id: dto.id });
      return null;
    }

    const groupsDb = MenuGroupsService.getMenuGroupsDbService();
    const menuGroup =
      !menuLink.menuGroupId || menuLink.menuGroupId === 'ROOT'
        ? ({ id: 'ROOT' } as any)
        : await groupsDb.findById(menuLink.menuGroupId);
    return { ...menuLink, menuGroup } as any;
  }



  static async SearchMenuLinksService(dto: SearchMenuLinksDto): Promise<{ data: MenuLinksData[]; total: number }> {
    const log = logger();
    const dbService = this.getMenuLinksDbService();

    log.info('Searching menu links', { searchTerm: dto.searchTerm });

    const [links, total] = await Promise.all([dbService.search(dto), dbService.count(dto)]);

    const groupsDb = MenuGroupsService.getMenuGroupsDbService();
    const dataWithGroup = await Promise.all(
      links.map(async (link) => {
        const menuGroup =
          !link.menuGroupId || link.menuGroupId === 'ROOT'
            ? ({ id: 'ROOT' } as any)
            : await groupsDb.findById(link.menuGroupId);
        return { ...link, menuGroup } as any;
      })
    );

    return { data: dataWithGroup as any, total };
  }

  static async DeleteMenuLinkService(id: string): Promise<boolean> {
    const log = logger();
    const dbService = this.getMenuLinksDbService();

    log.info('Deleting menu link', { id });

    const existing = await dbService.findById(id);
    if (!existing) {
      log.warn('Menu link not found for deletion', { id });
      return false;
    }

    const deleted = await dbService.deleteById(id);

    if (deleted) {
      log.info('Menu link deleted successfully', { id });
    } else {
      log.warn('Menu link not found for deletion', { id });
    }

    return deleted;
  }
}
