import { api } from "encore.dev/api";
import type { ResponseType } from "../../utils/app-types";
import type { MenuLinkDto, SearchMenuLinksDto } from "./menu-link.dto";
import MenuLinkService from "./menu-link.service";

export const SaveMenuLink = api<MenuLinkDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-link-save",
  },
  async (body: MenuLinkDto) => {
    const data = await MenuLinkService.SaveService(body);
    return { data };
  }
);

export const SearchMenuLinks = api<SearchMenuLinksDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-link-search",
  },
  async (body: SearchMenuLinksDto) => {
    const result = await MenuLinkService.SearchService(body);
    return { data: result.data, total: result.total };
  }
);

export const EntityByIdMenuLink = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/menu-link-entity/:id",
  },
  async (params: { id: string }) => {
    const data = await MenuLinkService.EntityByIdService(params.id);
    return { data };
  }
);

export const DeleteMenuLink = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "DELETE",
    path: "/menu-link-delete",
  },
  async (body: { id: string }) => {
    const data = await MenuLinkService.DeleteService(body.id);
    return { data };
  }
);
