import { api } from "encore.dev/api";
import type {
  RequestByIdType,
  RequestQueryType,
  ResponseType,
} from "../../utils/app-types";
import { asParams } from "../../utils/query-helper";
import QueryReportService from "./query-report.service";

type QueryByIdRequest = RequestByIdType & RequestQueryType;

export const QueryReport = api<QueryByIdRequest, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/query-report/:id",
  },
  async (req) => {
    return QueryReportService.ReportService(req.id, asParams(req));
  }
);
