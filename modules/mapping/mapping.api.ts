import { api } from "encore.dev/api";
import type { ResponseType } from "dff-util";
import type {
  MappingBatchSaveRequest,
  MappingDto,
  MappingSearchRequest,
} from "./mapping.dto";
import MappingService from "./mapping.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

export const SaveMapping = api<MappingDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/mapping-save",
  },
  async (input) => {
    try {
      const data = await MappingService.SaveService(input);
      return { data, status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to save mapping: ${error}`);
      throw error;
    }
  }
);

export const BatchSaveMapping = api<MappingBatchSaveRequest, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/mapping-batch-save",
  },
  async (input) => {
    try {
      const data = await MappingService.BatchSaveService(input);
      return { data, total: data.length, status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to batch save mappings: ${error}`);
      throw error;
    }
  }
);

export const SearchMappings = api<MappingSearchRequest, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/mapping-search",
  },
  async (input) => {
    try {
      const page = await MappingService.SearchService(input);
      return { ...page, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to search mappings: ${error}`);
      throw error;
    }
  }
);

export const EntityByIdMapping = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/mapping-entity/:id",
  },
  async (params) => {
    try {
      const data = await MappingService.EntityByIdService(params.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to entity by id mapping: ${error}`);
      throw error;
    }
  }
);

export const TypeMapping = api<{ type: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/mapping-type/:type",
  },
  async (params) => {
    try {
      const data = await MappingService.TypeService(params.type);
      return { data, total: data.length, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to list mapping by type: ${error}`);
      throw error;
    }
  }
);
