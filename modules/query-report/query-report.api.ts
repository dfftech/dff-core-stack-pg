import { api } from "encore.dev/api";
import type { RequestByIdType, ResponseType } from "dff-util";
import type { RequestQueryType } from "../../utils/app-types";
import { asParams } from "../../utils/query-helper";
import QueryReportService from "./query-report.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

type QueryByIdRequest = RequestByIdType & RequestQueryType;

export const QueryReport = api<QueryByIdRequest, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/query-report/:id",
  },
  async (req) => {
    try {
      const { data, queryId } = await QueryReportService.ReportService(req.id, asParams(req));
      return { data, status: "REPORT_SUCCESSFULLY", meta: { requestId: queryId } };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to query report: ${error}`);
      throw error;
    }
  }
);
