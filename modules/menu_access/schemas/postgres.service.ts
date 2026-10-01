import { toEntityMapper, toViewMapper } from 'dff-util';
import { sessionPool } from '../../query/query.helper';
import { TABLES } from '../menu_access.consts';
import type { MenuAccessData } from '../menu_access.types';

export class MenuAccessPostgresService {
  static Pool() {
    return sessionPool();
  }

  async findById(id: string): Promise<MenuAccessData | null> {
    const query = `SELECT * FROM ${TABLES.MENU_ACCESS} WHERE id = $1 LIMIT 1`;
    const result = await MenuAccessPostgresService.Pool().query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const data = toViewMapper(result.rows[0]) as MenuAccessData;
    return data;
  }

  async findByRoleAndLink(menuRoleId: string, menuLinkId: string): Promise<MenuAccessData | null> {
    const query = `SELECT * FROM ${TABLES.MENU_ACCESS} WHERE menu_role_id = $1 AND menu_link_id = $2 LIMIT 1`;
    const result = await MenuAccessPostgresService.Pool().query(query, [menuRoleId, menuLinkId]);

    if (result.rows.length === 0) {
      return null;
    }

    const data = toViewMapper(result.rows[0]) as MenuAccessData;
    return data;
  }

  async search(dto: any): Promise<MenuAccessData[]> {
    let query = `SELECT * FROM ${TABLES.MENU_ACCESS} WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (dto.menuRoleId) {
      if (Array.isArray(dto.menuRoleId)) {
        if (dto.menuRoleId.length > 0) {
          const placeholders = dto.menuRoleId.map((_: any, i: any) => `$${paramIndex + i}`).join(', ');
          query += ` AND menu_role_id IN (${placeholders})`;
          params.push(...dto.menuRoleId);
          paramIndex += dto.menuRoleId.length;
        }
      } else {
        query += ` AND menu_role_id = $${paramIndex}`;
        params.push(dto.menuRoleId);
        paramIndex++;
      }
    }

    if (dto.menuLinkId) {
      query += ` AND menu_link_id = $${paramIndex}`;
      params.push(dto.menuLinkId);
      paramIndex++;
    }

    if (dto.persona !== undefined) {
      query += ` AND persona = $${paramIndex}`;
      params.push(dto.persona);
      paramIndex++;
    }

    const orderBy = dto.orderBy || 'updated_at';
    const order = dto.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${orderBy} ${order}`;

    const page = dto.page || 1;
    const limit = dto.limit || 10;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, (page - 1) * limit);

    console.log('Postgres Search Debug:', { query, params });

    const result = await MenuAccessPostgresService.Pool().query(query, params);
    return result.rows.map((row) => toViewMapper(row) as MenuAccessData);
  }

  async count(dto: any): Promise<number> {
    let query = `SELECT COUNT(*) FROM ${TABLES.MENU_ACCESS} WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (dto.menuRoleId) {
      if (Array.isArray(dto.menuRoleId)) {
        if (dto.menuRoleId.length > 0) {
          const placeholders = dto.menuRoleId.map((_: any, i: any) => `$${paramIndex + i}`).join(', ');
          query += ` AND menu_role_id IN (${placeholders})`;
          params.push(...dto.menuRoleId);
          paramIndex += dto.menuRoleId.length;
        }
      } else {
        query += ` AND menu_role_id = $${paramIndex}`;
        params.push(dto.menuRoleId);
        paramIndex++;
      }
    }

    if (dto.menuLinkId) {
      query += ` AND menu_link_id = $${paramIndex}`;
      params.push(dto.menuLinkId);
      paramIndex++;
    }

    if (dto.persona !== undefined) {
      query += ` AND persona = $${paramIndex}`;
      params.push(dto.persona);
      paramIndex++;
    }

    const result = await MenuAccessPostgresService.Pool().query(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  async save(data: any, userId: string): Promise<MenuAccessData> {
    const entity = toEntityMapper(data);
    const existing = await this.findById(entity.id);

    entity.updated_at = new Date();
    entity.updated_by = userId;

    if (!existing) {
      entity.created_at = new Date();
      entity.created_by = userId;

      const columns = Object.keys(entity);
      const values = Object.values(entity);
      const quotedColumns = columns.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(', ');
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const query = `INSERT INTO ${TABLES.MENU_ACCESS} (${quotedColumns}) VALUES (${placeholders}) RETURNING *`;

      const result = await MenuAccessPostgresService.Pool().query(query, values);
      const saved = toViewMapper(result.rows[0]) as MenuAccessData;
      return saved;
    } else {
      const setClauses = Object.keys(entity)
        .map((key, i) => `"${String(key).replace(/"/g, '""')}" = $${i + 1}`)
        .join(', ');
      const values = [...Object.values(entity), entity.id];
      const query = `UPDATE ${TABLES.MENU_ACCESS} SET ${setClauses} WHERE id = $${values.length} RETURNING *`;

      const result = await MenuAccessPostgresService.Pool().query(query, values);
      const saved = toViewMapper(result.rows[0]) as MenuAccessData;
      return saved;
    }
  }

  async deleteById(id: string): Promise<boolean> {
    const query = `DELETE FROM ${TABLES.MENU_ACCESS} WHERE id = $1`;
    const result = await MenuAccessPostgresService.Pool().query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async checkAccess(menuRoleIds: string[], menuLinkId: string, action: string): Promise<boolean> {
    const placeholders = menuRoleIds.map((_, i) => `$${i + 1}`).join(', ');
    const actionCol = `"${String(action).replace(/"/g, '""')}"`;
    const query = `SELECT * FROM ${TABLES.MENU_ACCESS} 
      WHERE menu_role_id IN (${placeholders}) AND menu_link_id = $${menuRoleIds.length + 1} 
      AND ${actionCol} = true LIMIT 1`;
    const result = await MenuAccessPostgresService.Pool().query(query, [...menuRoleIds, menuLinkId]);
    return result.rows.length > 0;
  }
}

