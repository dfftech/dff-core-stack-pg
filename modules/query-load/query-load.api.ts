import { api } from "encore.dev/api";
import type { RequestByIdType, ResponseType } from "dff-util";
import type { RequestQueryType } from "../../utils/app-types";
import { asParams } from "../../utils/query-helper";
import QueryLoadService from "./query-load.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

type QueryByIdRequest = RequestByIdType & RequestQueryType;

export const QueryLoad = api<QueryByIdRequest, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/query-load/:id",
  },
  async (req) => {
    try {
      const data = await QueryLoadService.LoadService(req.id, asParams(req));
      return { data, status: "LOADED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to query load: ${error}`);
      throw error;
    }
  }
);
