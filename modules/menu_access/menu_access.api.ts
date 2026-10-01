import { api } from "encore.dev/api";
import type { ResponseType } from "../../utils/app-types";
import type {
  BulkCreateMenuAccessDto,
  CheckAccessDto,
  CreateMenuAccessDto,
  GetMenuAccessDto,
  SearchMenuAccessDto,
} from './menu_access.dto';
import MenuAccessService from "./menu_access.service";

export const CreateMenuAccess = api<CreateMenuAccessDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-access-create",
  },
  async (body: CreateMenuAccessDto) => {
    const data = await MenuAccessService.CreateMenuAccessService(body);
    return { data };
  }
);

export const GetMenuAccess = api<GetMenuAccessDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-access-get",
  },
  async (body: GetMenuAccessDto) => {
    const data = await MenuAccessService.GetMenuAccessService(body);
    return { data };
  }
);

// export const UpdateMenuAccess = api<UpdateMenuAccessDto, ResponseType>(
//   {
//     expose: true,
//     method: "PUT",
//     path: "/menu-access-update",
//   },
//   async (body: UpdateMenuAccessDto) => {
//     const data = await MenuAccessService.UpdateMenuAccessService(body);
//     return { data };
//   }
// );

export const SearchMenuAccess = api<SearchMenuAccessDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-access-search",
  },
  async (body: SearchMenuAccessDto) => {
    const result = await MenuAccessService.SearchMenuAccessService(body);
    return { data: result.data, total: result.total };
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
    const data = await MenuAccessService.DeleteMenuAccessService(body.id);
    return { data };
  }
);

