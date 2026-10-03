import { api } from "encore.dev/api";
import type { ResponseType } from "../../utils/app-types";
import type {
  BulkCreateMenuAccessDto,
  CheckAccessDto,
  MenuAccessDto,
  SearchMenuAccessDto,
} from "./menu-access.dto";
import MenuAccessService from "./menu-access.service";

export const SaveMenuAccess = api<MenuAccessDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-access-save",
  },
  async (body: MenuAccessDto) => {
    const data = await MenuAccessService.SaveService(body);
    return { data };
  }
);

export const SearchMenuAccess = api<SearchMenuAccessDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-access-search",
  },
  async (body: SearchMenuAccessDto) => {
    const result = await MenuAccessService.SearchService(body);
    return { data: result.data, total: result.total };
  }
);

export const EntityByIdMenuAccess = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/menu-access-entity/:id",
  },
  async (params: { id: string }) => {
    const data = await MenuAccessService.EntityByIdService(params.id);
    return { data };
  }
);

export const BulkCreateMenuAccess = api<BulkCreateMenuAccessDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-access-bulk-create",
  },
  async (body: BulkCreateMenuAccessDto) => {
    const data = await MenuAccessService.BulkCreateMenuAccessService(body);
    return { data };
  }
);

export const CheckAccess = api<CheckAccessDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-access-check-access",
  },
  async (body: CheckAccessDto) => {
    const data = await MenuAccessService.CheckAccessService(body);
    return { data };
  }
);

export const DeleteMenuAccess = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "DELETE",
    path: "/menu-access-delete",
  },
  async (body: { id: string }) => {
    const data = await MenuAccessService.DeleteService(body.id);
    return { data };
  }
);
