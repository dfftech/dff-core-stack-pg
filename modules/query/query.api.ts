import { api } from "encore.dev/api";
import type { ResponseType } from "../../utils/app-types";
import type {
  QueryByIdRequest,
  QueryListApiRequest,
} from "./query-types";
import QueryLoadService from "./query-load.service";
import QueryReportService from "./query-report.service";
import QueryListService from "./query-list.service";
import { query_params } from "../../utils/app-util";

const URL_PARAM_SKIP = new Set(["limit", "skip", "orderBy", "params"]);

function parseParamsJson(raw?: string): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (v === null || v === undefined) continue;
      out[k] = String(v);
    }
    return out;
  } catch {
    return {};
  }
}

function asParams(req: {
  params?: string;
  persona?: string;
}): Record<string, string> {
  const fromUrl = query_params();
  const out: Record<string, string> = {
    ...parseParamsJson(fromUrl.params),
    ...parseParamsJson(req.params),
  };

  for (const [k, v] of Object.entries(fromUrl)) {
    if (URL_PARAM_SKIP.has(k) || v === "") continue;
    out[k] = v;
  }

  if (req.persona !== undefined && req.persona !== "") {
    out.persona = String(req.persona);
  }
  return out;
}

/** Public when JWT session id is System (case-insensitive); otherwise private. */
export const QueryLoad = api<QueryByIdRequest, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/query-load/:id",
  },
  async (req) => {
    return QueryLoadService.LoadService(req.id, asParams(req));
  }
);

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

export const QueryList = api<QueryListApiRequest, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/query-list/:id",
  },
  async (req) => {
    return QueryListService.ListService(req.id, asParams(req), {
      limit: req.limit,
      skip: req.skip,
      orderBy: req.orderBy,
    });
  }
);
