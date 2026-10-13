import { api } from "encore.dev/api";
import type { ResponseType, SearchType } from "dff-util";
import type { AppConstantDto } from "./app-constant.dto";
import AppConstantService from "./app-constant.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

export const SaveAppConstant = api<AppConstantDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/app-constant-save",
  },
  async (input) => {
    try {
      const data = await AppConstantService.SaveService(input);
      return { data, status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to save app constant: ${error}`);
      throw error;
    }
  }
);

export const SearchAppConstants = api<SearchType, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/app-constant-search",
  },
  async (input) => {
    try {
      const page = await AppConstantService.SearchService(input);
      return { ...page, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to search app constants: ${error}`);
      throw error;
    }
  }
);

export const EntityByIdAppConstant = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/app-constant-entity/:id",
  },
  async (params) => {
    try {
      const data = await AppConstantService.EntityByIdService(params.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to entity by id app constant: ${error}`);
      throw error;
    }
  }
);

export const TypeAppConstant = api<{ type: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/app-constant-type/:type",
  },
  async (params) => {
    try {
      const data = await AppConstantService.TypeService(params.type);
      return { data, total: data.length, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to list app constant by type: ${error}`);
      throw error;
    }
  }
);
