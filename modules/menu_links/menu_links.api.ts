import { api } from "encore.dev/api";
import type { ResponseType } from "../../utils/app-types";
import type {
  CreateMenuLinkDto,
  GetMenuLinkDto,
  SearchMenuLinksDto,
} from './menu_links.dto';
import MenuLinksService from "./menu_links.service";

export const CreateMenuLink = api<CreateMenuLinkDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-links-create",
  },
  async (body: CreateMenuLinkDto) => {
    const data = await MenuLinksService.CreateMenuLinkService(body);
    return { data };
  }
);

export const GetMenuLink = api<GetMenuLinkDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-links-get",
  },
  async (body: GetMenuLinkDto) => {
    const data = await MenuLinksService.GetMenuLinkService(body);
    return { data };
  }
);


export const SearchMenuLinks = api<SearchMenuLinksDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-links-search",
  },
  async (body: SearchMenuLinksDto) => {
    const result = await MenuLinksService.SearchMenuLinksService(body);
    return { data: result.data, total: result.total };
  }
);

export const DeleteMenuLink = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "DELETE",
    path: "/menu-links-delete",
  },
  async (body: { id: string }) => {
    const data = await MenuLinksService.DeleteMenuLinkService(body.id);
    return { data };
  }
);

