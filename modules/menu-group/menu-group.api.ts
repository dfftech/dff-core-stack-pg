import { api } from "encore.dev/api";
import type { ResponseType } from "dff-util";
import type { MenuGroupDto, SearchMenuGroupsDto } from "./menu-group.dto";
import MenuGroupService from "./menu-group.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

export const SaveMenuGroup = api<MenuGroupDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-group-save",
  },
  async (body: MenuGroupDto) => {
    try {
      const data = await MenuGroupService.SaveService(body);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to save menu group: ${error}`);
      throw error;
    }
  }
);

export const SearchMenuGroups = api<SearchMenuGroupsDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-group-search",
  },
  async (body: SearchMenuGroupsDto) => {
    try {
      const result = await MenuGroupService.SearchService(body);
      return { data: result.data, total: result.total };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to search menu groups: ${error}`);
      throw error;
    }
  }
);

export const EntityByIdMenuGroup = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/menu-group-entity/:id",
  },
  async (params: { id: string }) => {
    try {
      const data = await MenuGroupService.EntityByIdService(params.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to entity by id menu group: ${error}`);
      throw error;
    }
  }
);

export const DeleteMenuGroup = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "DELETE",
    path: "/menu-group-delete",
  },
  async (body: { id: string }) => {
    try {
      const data = await MenuGroupService.DeleteService(body.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to delete menu group: ${error}`);
      throw error;
    }
  }
);
