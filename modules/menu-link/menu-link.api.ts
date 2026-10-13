import { api } from "encore.dev/api";
import type { ResponseType } from "dff-util";
import type { MenuLinkDto, SearchMenuLinksDto } from "./menu-link.dto";
import MenuLinkService from "./menu-link.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

export const SaveMenuLink = api<MenuLinkDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-link-save",
  },
  async (body: MenuLinkDto) => {
    try {
      const data = await MenuLinkService.SaveService(body);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to save menu link: ${error}`);
      throw error;
    }
  }
);

export const SearchMenuLinks = api<SearchMenuLinksDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-link-search",
  },
  async (body: SearchMenuLinksDto) => {
    try {
      const result = await MenuLinkService.SearchService(body);
      return { data: result.data, total: result.total };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to search menu links: ${error}`);
      throw error;
    }
  }
);

export const EntityByIdMenuLink = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/menu-link-entity/:id",
  },
  async (params: { id: string }) => {
    try {
      const data = await MenuLinkService.EntityByIdService(params.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to entity by id menu link: ${error}`);
      throw error;
    }
  }
);

export const DeleteMenuLink = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "DELETE",
    path: "/menu-link-delete",
  },
  async (body: { id: string }) => {
    try {
      const data = await MenuLinkService.DeleteService(body.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to delete menu link: ${error}`);
      throw error;
    }
  }
);
