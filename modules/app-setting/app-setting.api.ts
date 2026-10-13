import { api } from "encore.dev/api";
import type { ResponseType, SearchType } from "dff-util";
import type { AppSettingDto } from "./app-setting.dto";
import AppSettingService from "./app-setting.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

export const SaveAppSetting = api<AppSettingDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/app-setting-save",
  },
  async (input) => {
    try {
      const data = await AppSettingService.SaveService(input);
      return { data, status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to save app setting: ${error}`);
      throw error;
    }
  }
);

export const SearchAppSettings = api<SearchType, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/app-setting-search",
  },
  async (input) => {
    try {
      const page = await AppSettingService.SearchService(input);
      return { ...page, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to search app settings: ${error}`);
      throw error;
    }
  }
);

export const EntityByIdAppSetting = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/app-setting-entity/:id",
  },
  async (params) => {
    try {
      const data = await AppSettingService.EntityByIdService(params.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to entity by id app setting: ${error}`);
      throw error;
    }
  }
);

export const TypeAppSetting = api<{ type: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/app-setting-type/:type",
  },
  async (params) => {
    try {
      const data = await AppSettingService.TypeService(params.type);
      return { data, total: data.length, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to list app setting by type: ${error}`);
      throw error;
    }
  }
);
