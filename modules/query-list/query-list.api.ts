import { api } from "encore.dev/api";
import type {
  RequestByIdType,
  RequestQueryType,
  SearchType,
  ResponseType,
} from "../../utils/app-types";
import { asParams } from "../../utils/query-helper";
import QueryListService from "./query-list.service";

type QueryListRequest = RequestByIdType & RequestQueryType & SearchType;

export const QueryList = api<QueryListRequest, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/query-list/:id",
  },
  async (req) => {
    return QueryListService.ListService(req.id, asParams(req), req);
  }
);
