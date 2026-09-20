import type { ResponseType } from "../../utils/app-types";
import type { ReportQueryRow } from "./query-types";
import { queryReportEntity } from "./query-report.entity";
import {
  buildPgQuery,
  definitionPool,
  executionPool,
  mapRows,
} from "./query.helper";

export default class QueryReportService {
  static EntityService() {
    return queryReportEntity;
  }

  static async ReportService(
    id: string,
    paramObj: Record<string, string>
  ): Promise<ResponseType> {
    try {
      const defPool = await definitionPool();

      const defResult = await defPool.query<ReportQueryRow>(
        `SELECT id, type, display_name, name, query, params
         FROM query_reports WHERE id = $1 LIMIT 1`,
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

      const pool = await executionPool(false);
      const result = await pool.query({ text: built.text!, values: built.values });
      const data = mapRows((result?.rows as Record<string, unknown>[]) ?? []);
      return {
        data,
        status: "REPORT_SUCCESSFULLY",
        meta: { requestId: queryDef.id },
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { data: null, error: `EXECUTION_ERROR: ${message}` };
    }
  }
}
