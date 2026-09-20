import type { ResponseType } from "../../utils/app-types";
import type { LoadQueryRow } from "./query-types";
import { queryLoadEntity } from "./query-load.entity";
import {
  buildPgQuery,
  definitionPool,
  executionPool,
  isPublicSession,
  mapRows,
} from "./query.helper";

export default class QueryLoadService {
  static EntityService() {
    return queryLoadEntity;
  }

  static async LoadService(
    id: string,
    paramObj: Record<string, string>
  ): Promise<ResponseType> {
    try {
      const isPublic = isPublicSession();
      const defPool = await definitionPool();

      const defResult = await defPool.query<LoadQueryRow>(
        `SELECT id, query, params, is_core, is_public
         FROM query_loads WHERE id = $1 LIMIT 1`,
        [id]
      );
      const queryDef = defResult.rows[0];

      if (!queryDef) {
        return { data: null, error: "RECORD_NOT_EXISTS" };
      }

      if (isPublic && !queryDef.is_public) {
        return { data: null, error: "please contact admin" };
      }

      const mergedParams = {
        ...(queryDef.params || {}),
        ...paramObj,
      } as Record<string, unknown>;

      const built = buildPgQuery(queryDef.query, mergedParams);
      if (built.error) {
        return { data: null, error: `QUERY_BUILD_ERROR: ${built.error}` };
      }

      const pool = await executionPool(queryDef.is_core);
      const result = await pool.query({ text: built.text!, values: built.values });
      const data = mapRows((result?.rows as Record<string, unknown>[]) ?? []);
      return { data, status: "LOADED_SUCCESSFULLY" };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { data: null, error: `EXECUTION_ERROR: ${message}` };
    }
  }
}
