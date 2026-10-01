import { toSchemaMapper, toViewMapper } from 'dff-util';
import { session_db } from '../../../utils/app-util';
import { COLLECTIONS } from '../menu_groups.consts';
import type { MenuGroupsData } from '../menu_groups.types';

export class MenuGroupsMongoService {
  static Collection() {
    return session_db().collection(COLLECTIONS.MENU_GROUPS);
  }

  async findById(id: string): Promise<MenuGroupsData | null> {
    const doc = await MenuGroupsMongoService.Collection().findOne({ _id: id });

    if (!doc) {
      return null;
    }

    const data = toViewMapper(doc) as MenuGroupsData;
    return data;
  }

  async search(dto: any): Promise<MenuGroupsData[]> {
    const query: any = {};

    if (dto.searchTerm) {
      query.$or = [
        { 'name_lang.en-US': { $regex: dto.searchTerm, $options: 'i' } },
        { name: { $regex: dto.searchTerm, $options: 'i' } },
      ];
    }

    if (dto.persona !== undefined) {
      query.persona = dto.persona;
    }

    if (dto.active !== undefined) {
      query.active = dto.active;
    }

    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const sortBy = dto.orderBy || 'priority';
    const sortOrder = dto.order?.toUpperCase() === 'ASC' ? 1 : -1;

    const docs = await MenuGroupsMongoService.Collection()
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return docs.map((doc: any) => toViewMapper(doc) as MenuGroupsData);
  }

  async count(dto: any): Promise<number> {
    const query: any = {};

    if (dto.searchTerm) {
      query.$or = [
        { 'name_lang.en-US': { $regex: dto.searchTerm, $options: 'i' } },
        { name: { $regex: dto.searchTerm, $options: 'i' } },
      ];
    }

    if (dto.persona !== undefined) {
      query.persona = dto.persona;
    }

    if (dto.active !== undefined) {
      query.active = dto.active;
    }

    return await MenuGroupsMongoService.Collection().countDocuments(query);
  }

  async save(data: any, userId: string): Promise<MenuGroupsData> {
    const entity = toSchemaMapper(data);
    const existing = await MenuGroupsMongoService.Collection().findOne({ _id: entity._id });

    entity.updated_at = new Date();
    entity.updated_by = userId;

    if (!existing) {
      entity.created_at = new Date();
      entity.created_by = userId;
      await MenuGroupsMongoService.Collection().insertOne(entity);
    } else {
      entity.created_at = existing.created_at;
      entity.created_by = existing.created_by;
      await MenuGroupsMongoService.Collection().updateOne({ _id: entity._id }, { $set: entity });
    }

    const result = toViewMapper(entity) as MenuGroupsData;
    return result;
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await MenuGroupsMongoService.Collection().deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}

