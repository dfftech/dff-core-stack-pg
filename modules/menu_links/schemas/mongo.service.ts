import { toSchemaMapper, toViewMapper } from 'dff-util';
import { session_db } from '../../../utils/app-util';
import { COLLECTIONS } from '../menu_links.consts';
import type { MenuLinksData } from '../menu_links.types';

export class MenuLinksMongoService {
  static Collection() {
    return session_db().collection(COLLECTIONS.MENU_LINKS);
  }

  async findById(id: string): Promise<MenuLinksData | null> {
    const doc = await MenuLinksMongoService.Collection().findOne({ _id: id });

    if (!doc) {
      return null;
    }

    const data = toViewMapper(doc) as MenuLinksData;
    return data;
  }

  async search(dto: any): Promise<MenuLinksData[]> {
    const query: any = {};
    const andConditions: any[] = [];

    if (dto.searchTerm) {
      andConditions.push({
        $or: [
          { 'name_lang.en-US': { $regex: dto.searchTerm, $options: 'i' } },
          { name: { $regex: dto.searchTerm, $options: 'i' } },
          { href: { $regex: dto.searchTerm, $options: 'i' } },
        ],
      });
    }

    if (dto.menuGroupId !== undefined) {
      if (dto.menuGroupId === null || dto.menuGroupId === 'ROOT' || dto.menuGroupId === '') {
        // Find links with null, empty, or ROOT menu_group_id
        andConditions.push({
          $or: [
            { menu_group_id: { $exists: false } },
            { menu_group_id: null },
            { menu_group_id: '' },
            { menu_group_id: 'ROOT' },
          ],
        });
      } else {
        query.menu_group_id = dto.menuGroupId;
      }
    }

    if (dto.persona !== undefined) {
      query.persona = dto.persona;
    }

    if (dto.active !== undefined) {
      query.active = dto.active;
    }

    // Combine conditions with $and if we have multiple $or conditions
    if (andConditions.length > 0) {
      if (andConditions.length === 1 && Object.keys(query).length === 0) {
        // If only one $or condition and no other conditions, use it directly
        Object.assign(query, andConditions[0]);
      } else {
        // Combine with $and
        query.$and = andConditions;
      }
    }

    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const sortBy = dto.orderBy || 'priority';
    const sortOrder = dto.order?.toUpperCase() === 'ASC' ? 1 : -1;

    const docs = await MenuLinksMongoService.Collection()
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return docs.map((doc: any) => toViewMapper(doc) as MenuLinksData);
  }

  async count(dto: any): Promise<number> {
    const query: any = {};
    const andConditions: any[] = [];

    if (dto.searchTerm) {
      andConditions.push({
        $or: [
          { 'name_lang.en-US': { $regex: dto.searchTerm, $options: 'i' } },
          { name: { $regex: dto.searchTerm, $options: 'i' } },
          { href: { $regex: dto.searchTerm, $options: 'i' } },
        ],
      });
    }

    if (dto.menuGroupId !== undefined) {
      if (dto.menuGroupId === null || dto.menuGroupId === 'ROOT' || dto.menuGroupId === '') {
        // Find links with null, empty, or ROOT menu_group_id
        andConditions.push({
          $or: [
            { menu_group_id: { $exists: false } },
            { menu_group_id: null },
            { menu_group_id: '' },
            { menu_group_id: 'ROOT' },
          ],
        });
      } else {
        query.menu_group_id = dto.menuGroupId;
      }
    }

    if (dto.persona !== undefined) {
      query.persona = dto.persona;
    }

    if (dto.active !== undefined) {
      query.active = dto.active;
    }

    // Combine conditions with $and if we have multiple $or conditions
    if (andConditions.length > 0) {
      if (andConditions.length === 1 && Object.keys(query).length === 0) {
        // If only one $or condition and no other conditions, use it directly
        Object.assign(query, andConditions[0]);
      } else {
        // Combine with $and
        query.$and = andConditions;
      }
    }

    return await MenuLinksMongoService.Collection().countDocuments(query);
  }

  async save(data: any, userId: string): Promise<MenuLinksData> {
    const entity = toSchemaMapper(data);
    const existing = await MenuLinksMongoService.Collection().findOne({ _id: entity._id });

    entity.updated_at = new Date();
    entity.updated_by = userId;

    if (!existing) {
      entity.created_at = new Date();
      entity.created_by = userId;
      await MenuLinksMongoService.Collection().insertOne(entity);
    } else {
      entity.created_at = existing.created_at;
      entity.created_by = existing.created_by;
      await MenuLinksMongoService.Collection().updateOne({ _id: entity._id }, { $set: entity });
    }

    const result = toViewMapper(entity) as MenuLinksData;
    return result;
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await MenuLinksMongoService.Collection().deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}

