import { api } from "encore.dev/api";
import type { ResponseType, SearchType } from "../../utils/app-types";
import type { AppSettingDto } from "./app-setting.dto";
import AppSettingService from "./app-setting.service";

export const SaveAppSetting = api<AppSettingDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/app-setting-save",
  },
  async (input) => {
    return AppSettingService.SaveService(input);
  }
);

export const SearchAppSettings = api<SearchType, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/app-setting-search",
  },
  async (input) => {
    return AppSettingService.SearchService(input);
  }
);

export const EntityByIdAppSetting = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/app-setting-entity/:id",
  },
  async (params) => {
    return AppSettingService.EntityByIdService(params.id);
  }
);
