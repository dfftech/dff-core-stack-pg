import { api } from "encore.dev/api";
import type { ResponseType } from "../../utils/app-types";
import type { MenuRoleDto, SearchMenuRolesDto } from "./menu-role.dto";
import MenuRoleService from "./menu-role.service";

export const SaveMenuRole = api<MenuRoleDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-role-save",
  },
  async (body: MenuRoleDto) => {
    const data = await MenuRoleService.SaveService(body);
    return { data };
  }
);

export const SearchMenuRoles = api<SearchMenuRolesDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-role-search",
  },
  async (body: SearchMenuRolesDto) => {
    const result = await MenuRoleService.SearchService(body);
    return { data: result.data, total: result.total };
  }
);

export const EntityByIdMenuRole = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/menu-role-entity/:id",
  },
  async (params: { id: string }) => {
    const data = await MenuRoleService.EntityByIdService(params.id);
    return { data };
  }
);

export const DeleteMenuRole = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "DELETE",
    path: "/menu-role-delete",
  },
  async (body: { id: string }) => {
    const data = await MenuRoleService.DeleteService(body.id);
    return { data };
  }
);
