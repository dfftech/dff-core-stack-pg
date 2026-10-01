import { AppCodeByType, toSchemaMapper, toViewMapper } from 'dff-util';
import { session_db } from '../../../utils/app-util';
import { COLLECTIONS } from '../menu_access.consts';
import type { MenuAccessData } from '../menu_access.types';

export class MenuAccessMongoService {
  static Collection() {
    return session_db().collection(COLLECTIONS.MENU_ACCESS);
  }

  async findById(id: string): Promise<MenuAccessData | null> {
    const doc = await MenuAccessMongoService.Collection().findOne({ _id: id });

    if (!doc) {
      return null;
    }

    const data = toViewMapper(doc) as MenuAccessData;
    return data;
  }

  async findByRoleAndLink(menuRoleId: string, menuLinkId: string): Promise<MenuAccessData | null> {
    const doc = await MenuAccessMongoService.Collection().findOne({
      menu_role_id: menuRoleId,
      menu_link_id: menuLinkId,
    });

    if (!doc) {
      return null;
    }

    const data = toViewMapper(doc) as MenuAccessData;
    return data;
  }

  async search(dto: any): Promise<MenuAccessData[]> {
    const query: any = {};

    if (dto.menuRoleId) {
      if (Array.isArray(dto.menuRoleId)) {
        query.menu_role_id = { $in: dto.menuRoleId };
      } else {
        query.menu_role_id = dto.menuRoleId;
      }
    }

    if (dto.menuLinkId) {
      query.menu_link_id = dto.menuLinkId;
    }

    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const sortBy = dto.orderBy || 'updated_at';
    const sortOrder = dto.order?.toUpperCase() === 'ASC' ? 1 : -1;

    const docs = await MenuAccessMongoService.Collection()
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    
    console.log('Mongo Search Debug:', { query, count: docs.length });

    return docs.map((doc: any) => toViewMapper(doc) as MenuAccessData);
  }

  async count(dto: any): Promise<number> {
    const query: any = {};

    if (dto.menuRoleId) {
      if (Array.isArray(dto.menuRoleId)) {
        query.menu_role_id = { $in: dto.menuRoleId };
      } else {
        query.menu_role_id = dto.menuRoleId;
      }
    }

    if (dto.menuLinkId) {
      query.menu_link_id = dto.menuLinkId;
    }

    if (dto.persona !== undefined) {
      query.persona = dto.persona;
    }

    return await MenuAccessMongoService.Collection().countDocuments(query);
  }

  async save(data: any, userId: string): Promise<MenuAccessData> {
    const entity = toSchemaMapper(data);
    const existing = await MenuAccessMongoService.Collection().findOne({ _id: entity._id });

    entity.updated_at = new Date();
    entity.updated_by = userId;

    // Ensure all required boolean fields are present and properly typed
    if (typeof entity.read !== 'boolean') entity.read = false;
    if (typeof entity.create !== 'boolean') entity.create = false;
    if (typeof entity.update !== 'boolean') entity.update = false;
    if (typeof entity.delete !== 'boolean') entity.delete = false;
    // persona is optional string

    // Ensure required string fields are present
    if (!entity.menu_role_id) {
      throw new Error('menu_role_id is required');
    }
    if (!entity.menu_link_id) {
      throw new Error('menu_link_id is required');
    }

    if (!existing) {
      entity.created_at = new Date();
      entity.created_by = userId;
      try {
        await MenuAccessMongoService.Collection().insertOne(entity);
      } catch (error: any) {
        console.error('MongoDB insert error:', error);
        console.error('Entity being inserted:', JSON.stringify(entity, null, 2));
        throw error;
      }
    } else {
      entity.created_at = existing.created_at;
      entity.created_by = existing.created_by;
      await MenuAccessMongoService.Collection().updateOne({ _id: entity._id }, { $set: entity });
    }

    const result = toViewMapper(entity) as MenuAccessData;
    return result;
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await MenuAccessMongoService.Collection().deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async checkAccess(menuRoleIds: string[], menuLinkId: string, action: string): Promise<boolean> {
    const doc = await MenuAccessMongoService.Collection().findOne({
      menu_role_id: { $in: menuRoleIds },
      menu_link_id: menuLinkId,
      [action]: true,
    });

    return !!doc;
  }
}

