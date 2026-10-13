import { api } from "encore.dev/api";
import type { RequestByIdType, SearchType, ResponseType } from "dff-util";
import type { RequestQueryType } from "../../utils/app-types";
import { asParams } from "../../utils/query-helper";
import QueryListService from "./query-list.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

type QueryListRequest = RequestByIdType & RequestQueryType & SearchType;

export const QueryList = api<QueryListRequest, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/query-list/:id",
  },
  async (req) => {
    try {
      const { rows, col, limit, skip } = await QueryListService.ListService(req.id, asParams(req), req);
      return { data: { rows, col }, limit, skip, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to query list: ${error}`);
      throw error;
    }
  }
);
