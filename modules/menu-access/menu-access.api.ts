import { api } from "encore.dev/api";
import type { ResponseType } from "dff-util";
import type {
  BulkCreateMenuAccessDto,
  CheckAccessDto,
  MenuAccessDto,
  SearchMenuAccessDto,
} from "./menu-access.dto";
import MenuAccessService from "./menu-access.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

export const SaveMenuAccess = api<MenuAccessDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-access-save",
  },
  async (body: MenuAccessDto) => {
    try {
      const data = await MenuAccessService.SaveService(body);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to save menu access: ${error}`);
      throw error;
    }
  }
);

export const SearchMenuAccess = api<SearchMenuAccessDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-access-search",
  },
  async (body: SearchMenuAccessDto) => {
    try {
      const result = await MenuAccessService.SearchService(body);
      return { data: result.data, total: result.total };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to search menu access: ${error}`);
      throw error;
    }
  }
);

export const EntityByIdMenuAccess = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/menu-access-entity/:id",
  },
  async (params: { id: string }) => {
    try {
      const data = await MenuAccessService.EntityByIdService(params.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to entity by id menu access: ${error}`);
      throw error;
    }
  }
);

export const BulkCreateMenuAccess = api<BulkCreateMenuAccessDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-access-bulk-create",
  },
  async (body: BulkCreateMenuAccessDto) => {
    try {
      const data = await MenuAccessService.BulkCreateMenuAccessService(body);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to bulk create menu access: ${error}`);
      throw error;
    }
  }
);

export const CheckAccess = api<CheckAccessDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/menu-access-check-access",
  },
  async (body: CheckAccessDto) => {
    try {
      const data = await MenuAccessService.CheckAccessService(body);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to check access: ${error}`);
      throw error;
    }
  }
);

export const DeleteMenuAccess = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "DELETE",
    path: "/menu-access-delete",
  },
  async (body: { id: string }) => {
    try {
      const data = await MenuAccessService.DeleteService(body.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to delete menu access: ${error}`);
      throw error;
    }
  }
);
