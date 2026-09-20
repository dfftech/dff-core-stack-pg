import type { ResponseType, SearchType } from "../../utils/app-types";
import type { ListQueryRow } from "./query-types";
import { queryListEntity } from "./query-list.entity";
import {
  buildPgQuery,
  definitionPool,
  executionPool,
  mapRows,
  sanitizeOrder,
} from "./query.helper";

export default class QueryListService {
  static EntityService() {
    return queryListEntity;
  }

  static async ListService(
    id: string,
    paramObj: Record<string, string>,
    opts?: Pick<SearchType, "limit" | "skip" | "orderBy">
  ): Promise<ResponseType> {
    try {
      const defPool = await definitionPool();

      const defResult = await defPool.query<ListQueryRow>(
        `SELECT id, col, query, default_order, default_limit, params
         FROM query_lists WHERE id = $1 LIMIT 1`,
        [id]
      );
      const queryDef = defResult.rows[0];

      if (!queryDef) {
        return { data: null, error: "RECORD_NOT_EXISTS" };
      }

      const mergedParams = {
        ...(queryDef.params || {}),
        ...paramObj,
      } as Record<string, unknown>;

      const built = buildPgQuery(queryDef.query, mergedParams);
      if (built.error) {
        return { data: null, error: `QUERY_BUILD_ERROR: ${built.error}` };
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

      const pool = await executionPool(false);
      const result = await pool.query({ text, values });
      const data = mapRows((result?.rows as Record<string, unknown>[]) ?? []);
      return {
        data: { rows: data, col: queryDef.col },
        limit,
        skip,
        status: "LISTED_SUCCESSFULLY",
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { data: null, error: `EXECUTION_ERROR: ${message}` };
    }
  }
}
