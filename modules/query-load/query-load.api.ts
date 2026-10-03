import { api } from "encore.dev/api";
import type {
  RequestByIdType,
  RequestQueryType,
  ResponseType,
} from "../../utils/app-types";
import { asParams } from "../../utils/query-helper";
import QueryLoadService from "./query-load.service";

type QueryByIdRequest = RequestByIdType & RequestQueryType;

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
