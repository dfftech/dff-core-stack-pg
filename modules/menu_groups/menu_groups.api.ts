import { api } from "encore.dev/api";
import type { ResponseType } from "../../utils/app-types";
import type {
  CreateMenuGroupDto,
  GetMenuGroupDto,
  SearchMenuGroupsDto,
} from './menu_groups.dto';
import MenuGroupsService from "./menu_groups.service";

export const CreateMenuGroup = api<CreateMenuGroupDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-groups-create",
  },
  async (body: CreateMenuGroupDto) => {
    const data = await MenuGroupsService.CreateMenuGroupService(body);
    return { data };
  }
);

export const GetMenuGroup = api<GetMenuGroupDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-groups-get",
  },
  async (body: GetMenuGroupDto) => {
    const data = await MenuGroupsService.GetMenuGroupService(body);
    return { data };
  }
);

export const SearchMenuGroups = api<SearchMenuGroupsDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-groups-search",
  },
  async (body: SearchMenuGroupsDto) => {
    const result = await MenuGroupsService.SearchMenuGroupsService(body);
    return { data: result.data, total: result.total };
  }
);

export const DeleteMenuGroup = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "DELETE",
    path: "/menu-groups-delete",
  },
  async (body: { id: string }) => {
    const data = await MenuGroupsService.DeleteMenuGroupService(body.id);
    return { data };
  }
);

