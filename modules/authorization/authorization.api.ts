import { api, type Query } from "encore.dev/api";
import type { RequestByIdType, RequestQueryType, ResponseType } from "../../utils/app-types";
import AuthorizationService from "./authorization.service";

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
    const roles = String(req.roles ?? "")
      .split(",")
      .map((role) => role.trim())
      .filter(Boolean);
    if (roles.length === 0) return { data: null, error: "INVALID_ROLES" };

    const data = await AuthorizationService.MenuService({ persona: req.id, roles });
    return { data };
  }
);
