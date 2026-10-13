import { AppError } from "../../utils/app-error";
import type { LoadQueryRow } from "../../utils/query-types";
import { queryLoadEntity } from "./query-load.entity";
import {
  buildPgQuery,
  isPublicSession,
  logSql,
  mapRows,
  resolveParams,
  sessionPool,
} from "../../utils/query-helper";

export default class QueryLoadService {
  static EntityService() {
    return queryLoadEntity;
  }

  static async LoadService(
    id: string,
    paramObj: Record<string, string>
  ) {
    try {
      const isPublic = isPublicSession();
      const pool = sessionPool();

      const defResult = await pool.query<LoadQueryRow>(
        `SELECT id, query, params, is_public
         FROM query_loads WHERE id = $1 LIMIT 1`,
        [id]
      );
      const queryDef = defResult.rows[0];

      if (!queryDef) {
        throw new AppError("RECORD_NOT_EXISTS");
      }

      if (isPublic && !queryDef.is_public) {
        throw new AppError("please contact admin");
      }

      const mergedParams = resolveParams(queryDef.params, paramObj);

      const built = buildPgQuery(queryDef.query, mergedParams);
      if (built.error) {
        throw new AppError(`QUERY_BUILD_ERROR: ${built.error}`);
      }

      await logSql(id, built.text!, built.values ?? []);
      const result = await pool.query({ text: built.text!, values: built.values });
      const data = mapRows((result?.rows as Record<string, unknown>[]) ?? []);
      return data;
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      const message = err instanceof Error ? err.message : String(err);
      throw new AppError(`EXECUTION_ERROR: ${message}`);
    }
  }
}
