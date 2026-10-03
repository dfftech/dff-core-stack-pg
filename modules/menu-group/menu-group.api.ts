import { api } from "encore.dev/api";
import type { ResponseType } from "../../utils/app-types";
import type { MenuGroupDto, SearchMenuGroupsDto } from "./menu-group.dto";
import MenuGroupService from "./menu-group.service";

export const SaveMenuGroup = api<MenuGroupDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-group-save",
  },
  async (body: MenuGroupDto) => {
    const data = await MenuGroupService.SaveService(body);
    return { data };
  }
);

export const SearchMenuGroups = api<SearchMenuGroupsDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-group-search",
  },
  async (body: SearchMenuGroupsDto) => {
    const result = await MenuGroupService.SearchService(body);
    return { data: result.data, total: result.total };
  }
);

export const EntityByIdMenuGroup = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/menu-group-entity/:id",
  },
  async (params: { id: string }) => {
    const data = await MenuGroupService.EntityByIdService(params.id);
    return { data };
  }
);

export const DeleteMenuGroup = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "DELETE",
    path: "/menu-group-delete",
  },
  async (body: { id: string }) => {
    const data = await MenuGroupService.DeleteService(body.id);
    return { data };
  }
);
