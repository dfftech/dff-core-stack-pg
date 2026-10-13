import type { SearchType } from "dff-util";
import { AppError } from "../../utils/app-error";
import type { ListQueryRow } from "../../utils/query-types";
import { queryListEntity } from "./query-list.entity";
import {
  buildPgQuery,
  logSql,
  mapRows,
  resolveParams,
  sanitizeOrder,
  sessionPool,
} from "../../utils/query-helper";

export default class QueryListService {
  static EntityService() {
    return queryListEntity;
  }

  static async ListService(
    id: string,
    paramObj: Record<string, string>,
    opts?: SearchType
  ) {
    try {
      const pool = sessionPool();

      const defResult = await pool.query<ListQueryRow>(
        `SELECT id, col, query, default_order, default_limit, params
         FROM query_lists WHERE id = $1 LIMIT 1`,
        [id]
      );
      const queryDef = defResult.rows[0];

      if (!queryDef) {
        throw new AppError("RECORD_NOT_EXISTS");
      }

      const mergedParams = resolveParams(queryDef.params, paramObj);

      const built = buildPgQuery(queryDef.query, mergedParams);
      if (built.error) {
        throw new AppError(`QUERY_BUILD_ERROR: ${built.error}`);
      }

      const limit = opts?.limit ?? queryDef.default_limit ?? 10;
      const skip = opts?.skip ?? 0;
      const orderBy = opts?.orderBy || queryDef.default_order || "updated_at desc";

      const safeOrder = sanitizeOrder(orderBy);
      let text = built.text!;
      const values = [...(built.values || [])];
      text += ` ORDER BY ${safeOrder}`;
      values.push(limit);
      text += ` LIMIT $${values.length}`;
      values.push(skip);
      text += ` OFFSET $${values.length}`;

      await logSql(id, text, values);
      const result = await pool.query({ text, values });
      const data = mapRows((result?.rows as Record<string, unknown>[]) ?? []);
      return { rows: data, col: queryDef.col, limit, skip };
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      const message = err instanceof Error ? err.message : String(err);
      throw new AppError(`EXECUTION_ERROR: ${message}`);
    }
  }
}
