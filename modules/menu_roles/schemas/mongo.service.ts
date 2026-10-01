import { toSchemaMapper, toViewMapper } from 'dff-util';
import { session_db } from '../../../utils/app-util';
import { COLLECTIONS } from '../menu_roles.consts';
import type { MenuRolesData } from '../menu_roles.types';

export class MenuRolesMongoService {
  static Collection() {
    return session_db().collection(COLLECTIONS.MENU_ROLES);
  }

  async findById(id: string): Promise<MenuRolesData | null> {
    const doc = await MenuRolesMongoService.Collection().findOne({ _id: id });

    if (!doc) {
      return null;
    }

    const data = toViewMapper(doc) as MenuRolesData;
    return data;
  }

  async search(dto: any): Promise<MenuRolesData[]> {
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
    const sortBy = dto.orderBy || 'updated_at';
    const sortOrder = dto.order?.toUpperCase() === 'ASC' ? 1 : -1;

    const docs = await MenuRolesMongoService.Collection()
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return docs.map((doc) => toViewMapper(doc) as MenuRolesData);
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

    return await MenuRolesMongoService.Collection().countDocuments(query);
  }

  async save(data: any, userId: string): Promise<MenuRolesData> {
    const entity = toSchemaMapper(data);
    const existing = await MenuRolesMongoService.Collection().findOne({ _id: entity._id });

    entity.updated_at = new Date();
    entity.updated_by = userId;

    if (!existing) {
      entity.created_at = new Date();
      entity.created_by = userId;
      await MenuRolesMongoService.Collection().insertOne(entity);
    } else {
      entity.created_at = existing.created_at;
      entity.created_by = existing.created_by;
      await MenuRolesMongoService.Collection().updateOne({ _id: entity._id }, { $set: entity });
    }

    const result = toViewMapper(entity) as MenuRolesData;
    return result;
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await MenuRolesMongoService.Collection().deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}

