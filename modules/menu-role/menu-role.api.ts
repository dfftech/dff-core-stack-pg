import { api } from "encore.dev/api";
import type { ResponseType } from "dff-util";
import type { MenuRoleDto, SearchMenuRolesDto } from "./menu-role.dto";
import MenuRoleService from "./menu-role.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

export const SaveMenuRole = api<MenuRoleDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-role-save",
  },
  async (body: MenuRoleDto) => {
    try {
      const data = await MenuRoleService.SaveService(body);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to save menu role: ${error}`);
      throw error;
    }
  }
);

export const SearchMenuRoles = api<SearchMenuRolesDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-role-search",
  },
  async (body: SearchMenuRolesDto) => {
    try {
      const result = await MenuRoleService.SearchService(body);
      return { data: result.data, total: result.total };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to search menu roles: ${error}`);
      throw error;
    }
  }
);

export const EntityByIdMenuRole = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/menu-role-entity/:id",
  },
  async (params: { id: string }) => {
    try {
      const data = await MenuRoleService.EntityByIdService(params.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to entity by id menu role: ${error}`);
      throw error;
    }
  }
);

export const DeleteMenuRole = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "DELETE",
    path: "/menu-role-delete",
  },
  async (body: { id: string }) => {
    try {
      const data = await MenuRoleService.DeleteService(body.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to delete menu role: ${error}`);
      throw error;
    }
  }
);
