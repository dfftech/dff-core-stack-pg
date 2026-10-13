import { api, type Query } from "encore.dev/api";
import type { RequestByIdType, ResponseType } from "dff-util";
import type { RequestQueryType } from "../../utils/app-types";
import AuthorizationService from "./authorization.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

type AuthorizationRequest = RequestByIdType &
  RequestQueryType & {
    roles?: Query<string>;
  };

export const Authorization = api<AuthorizationRequest, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/authorization/:id",
  },
  async (req) => {
    try {
      const roles = String(req.roles ?? "")
        .split(",")
        .map((role) => role.trim())
        .filter(Boolean);
      if (roles.length === 0) return { data: null, error: "INVALID_ROLES" };

      const data = await AuthorizationService.MenuService({ persona: req.id, roles });
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to authorization: ${error}`);
      throw error;
    }
  }
);
