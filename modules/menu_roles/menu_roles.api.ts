import { api } from "encore.dev/api";
import type { ResponseType } from "../../utils/app-types";
import type {
  CreateMenuRoleDto,
  GetMenuRoleDto,
  SearchMenuRolesDto,
} from './menu_roles.dto';
import MenuRolesService from "./menu_roles.service";

export const CreateMenuRole = api<CreateMenuRoleDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-roles-create",
  },
  async (body: CreateMenuRoleDto) => {
    const data = await MenuRolesService.CreateMenuRoleService(body);
    return { data };
  }
);

export const GetMenuRole = api<GetMenuRoleDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-roles-get",
  },
  async (body: GetMenuRoleDto) => {
    const data = await MenuRolesService.GetMenuRoleService(body);
    return { data };
  }
);


export const SearchMenuRoles = api<SearchMenuRolesDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-roles-search",
  },
  async (body: SearchMenuRolesDto) => {
    const result = await MenuRolesService.SearchMenuRolesService(body);
    return { data: result.data, total: result.total };
  }
);

export const DeleteMenuRole = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "DELETE",
    path: "/menu-roles-delete",
  },
  async (body: { id: string }) => {
    const data = await MenuRolesService.DeleteMenuRoleService(body.id);
    return { data };
  }
);

