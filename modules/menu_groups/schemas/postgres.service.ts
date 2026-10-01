import { toEntityMapper, toViewMapper } from 'dff-util';
import type { Pool } from 'pg';
import { session_db } from '../../../utils/app-util';
import { TABLES } from '../menu_groups.consts';
import type { MenuGroupsData } from '../menu_groups.types';

export class MenuGroupsPostgresService {
  static Pool() {
    return session_db() as Pool;
  }

  async findById(id: string): Promise<MenuGroupsData | null> {
    const query = `SELECT * FROM ${TABLES.MENU_GROUPS} WHERE id = $1 LIMIT 1`;
    const result = await MenuGroupsPostgresService.Pool().query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const data = toViewMapper(result.rows[0]) as MenuGroupsData;
    return data;
  }

  async search(dto: any): Promise<MenuGroupsData[]> {
    let query = `SELECT * FROM ${TABLES.MENU_GROUPS} WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (dto.searchTerm) {
      query += ` AND (name_lang->>'en-US' ILIKE $${paramIndex} OR name ILIKE $${paramIndex})`;
      params.push(`%${dto.searchTerm}%`);
      paramIndex++;
    }

    if (dto.persona !== undefined) {
      query += ` AND persona = $${paramIndex}`;
      params.push(dto.persona);
      paramIndex++;
    }

    if (dto.active !== undefined) {
      query += ` AND active = $${paramIndex}`;
      params.push(dto.active);
      paramIndex++;
    }

    const orderBy = dto.orderBy || 'priority';
    const order = dto.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${orderBy} ${order}`;

    const page = dto.page || 1;
    const limit = dto.limit || 10;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, (page - 1) * limit);

    const result = await MenuGroupsPostgresService.Pool().query(query, params);
    return result.rows.map((row) => toViewMapper(row) as MenuGroupsData);
  }

  async count(dto: any): Promise<number> {
    let query = `SELECT COUNT(*) FROM ${TABLES.MENU_GROUPS} WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (dto.searchTerm) {
      query += ` AND (name_lang->>'en-US' ILIKE $${paramIndex} OR name ILIKE $${paramIndex})`;
      params.push(`%${dto.searchTerm}%`);
      paramIndex++;
    }

    if (dto.persona !== undefined) {
      query += ` AND persona = $${paramIndex}`;
      params.push(dto.persona);
      paramIndex++;
    }

    if (dto.active !== undefined) {
      query += ` AND active = $${paramIndex}`;
      params.push(dto.active);
      paramIndex++;
    }

    const result = await MenuGroupsPostgresService.Pool().query(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  async save(data: any, userId: string): Promise<MenuGroupsData> {
    const entity = toEntityMapper(data);
    const existing = await this.findById(entity.id);

    entity.updated_at = new Date();
    entity.updated_by = userId;

    if (!existing) {
      entity.created_at = new Date();
      entity.created_by = userId;

      const columns = Object.keys(entity);
      const values = Object.values(entity);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const query = `INSERT INTO ${TABLES.MENU_GROUPS} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;

      const result = await MenuGroupsPostgresService.Pool().query(query, values);
      const saved = toViewMapper(result.rows[0]) as MenuGroupsData;
      return saved;
    } else {
      const setClauses = Object.keys(entity)
        .map((key, i) => `${key} = $${i + 1}`)
        .join(', ');
      const values = [...Object.values(entity), entity.id];
      const query = `UPDATE ${TABLES.MENU_GROUPS} SET ${setClauses} WHERE id = $${values.length} RETURNING *`;

      const result = await MenuGroupsPostgresService.Pool().query(query, values);
      const saved = toViewMapper(result.rows[0]) as MenuGroupsData;
      return saved;
    }
  }

  async deleteById(id: string): Promise<boolean> {
    const query = `DELETE FROM ${TABLES.MENU_GROUPS} WHERE id = $1`;
    const result = await MenuGroupsPostgresService.Pool().query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

