import { api } from "encore.dev/api";
import type { ResponseType } from "../../utils/app-types";
import type {
  QueryByIdRequest,
  QueryListApiRequest,
} from "./query-types";
import QueryLoadService from "./query-load.service";
import QueryReportService from "./query-report.service";
import QueryListService from "./query-list.service";

function asParams(req: {
  params?: string;
  persona?: string;
}): Record<string, string> {
  const out: Record<string, string> = {};
  if (req.params) {
    try {
      const parsed = JSON.parse(req.params) as Record<string, unknown>;
      for (const [k, v] of Object.entries(parsed)) {
        if (v === null || v === undefined) continue;
        out[k] = String(v);
      }
    } catch {
      // ignore invalid JSON; other query fields still apply
    }
  }
  if (req.persona !== undefined && req.persona !== "") {
    out.persona = String(req.persona);
  }
  return out;
}

/** Public when JWT session id is System (case-insensitive); otherwise private. */
export const QueryLoad = api(
  {
    expose: true,
    method: "GET",
    path: "/query-load/:id",
  },
  async (req: QueryByIdRequest): Promise<ResponseType> => {
    return QueryLoadService.LoadService(req.id, asParams(req));
  }
);

export const QueryReport = api(
  {
    expose: true,
    method: "GET",
    path: "/query-report/:id",
  },
  async (req: QueryByIdRequest): Promise<ResponseType> => {
    return QueryReportService.ReportService(req.id, asParams(req));
  }
);

export const QueryList = api(
  {
    expose: true,
    method: "GET",
    path: "/query-list/:id",
  },
  async (req: QueryListApiRequest): Promise<ResponseType> => {
    return QueryListService.ListService(req.id, asParams(req), {
      limit: req.limit,
      skip: req.skip,
      orderBy: req.orderBy,
    });
  }
);
