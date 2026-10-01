import { toEntityMapper, toViewMapper } from 'dff-util';
import { sessionPool } from '../../query/query.helper';
import { TABLES } from '../menu_links.consts';
import type { MenuLinksData } from '../menu_links.types';

export class MenuLinksPostgresService {
  static Pool() {
    return sessionPool();
  }

  async findById(id: string): Promise<MenuLinksData | null> {
    const query = `SELECT * FROM ${TABLES.MENU_LINKS} WHERE id = $1 LIMIT 1`;
    const result = await MenuLinksPostgresService.Pool().query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const data = toViewMapper(result.rows[0]) as MenuLinksData;
    return data;
  }

  async search(dto: any): Promise<MenuLinksData[]> {
    let query = `SELECT * FROM ${TABLES.MENU_LINKS} WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (dto.searchTerm) {
      query += ` AND (name_lang->>'en-US' ILIKE $${paramIndex} OR name ILIKE $${paramIndex} OR href ILIKE $${paramIndex})`;
      params.push(`%${dto.searchTerm}%`);
      paramIndex++;
    }

    if (dto.menuGroupId !== undefined) {
      if (dto.menuGroupId === null || dto.menuGroupId === 'ROOT' || dto.menuGroupId === '') {
        // Find links with null, empty, or ROOT menu_group_id
        query += ` AND (menu_group_id IS NULL OR menu_group_id = '' OR menu_group_id = 'ROOT')`;
      } else {
        query += ` AND menu_group_id = $${paramIndex}`;
        params.push(dto.menuGroupId);
        paramIndex++;
      }
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

    const result = await MenuLinksPostgresService.Pool().query(query, params);
    return result.rows.map((row) => toViewMapper(row) as MenuLinksData);
  }

  async count(dto: any): Promise<number> {
    let query = `SELECT COUNT(*) FROM ${TABLES.MENU_LINKS} WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (dto.searchTerm) {
      query += ` AND (name_lang->>'en-US' ILIKE $${paramIndex} OR name ILIKE $${paramIndex} OR href ILIKE $${paramIndex})`;
      params.push(`%${dto.searchTerm}%`);
      paramIndex++;
    }

    if (dto.menuGroupId !== undefined) {
      if (dto.menuGroupId === null || dto.menuGroupId === 'ROOT' || dto.menuGroupId === '') {
        // Find links with null, empty, or ROOT menu_group_id
        query += ` AND (menu_group_id IS NULL OR menu_group_id = '' OR menu_group_id = 'ROOT')`;
      } else {
        query += ` AND menu_group_id = $${paramIndex}`;
        params.push(dto.menuGroupId);
        paramIndex++;
      }
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

    const result = await MenuLinksPostgresService.Pool().query(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  async save(data: any, userId: string): Promise<MenuLinksData> {
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
      const query = `INSERT INTO ${TABLES.MENU_LINKS} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;

      const result = await MenuLinksPostgresService.Pool().query(query, values);
      const saved = toViewMapper(result.rows[0]) as MenuLinksData;
      return saved;
    } else {
      const setClauses = Object.keys(entity)
        .map((key, i) => `${key} = $${i + 1}`)
        .join(', ');
      const values = [...Object.values(entity), entity.id];
      const query = `UPDATE ${TABLES.MENU_LINKS} SET ${setClauses} WHERE id = $${values.length} RETURNING *`;

      const result = await MenuLinksPostgresService.Pool().query(query, values);
      const saved = toViewMapper(result.rows[0]) as MenuLinksData;
      return saved;
    }
  }

  async deleteById(id: string): Promise<boolean> {
    const query = `DELETE FROM ${TABLES.MENU_LINKS} WHERE id = $1`;
    const result = await MenuLinksPostgresService.Pool().query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

