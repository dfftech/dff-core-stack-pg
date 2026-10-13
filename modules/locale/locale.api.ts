import { api } from "encore.dev/api";
import type { ResponseType, SearchType } from "dff-util";
import type { LocaleDto } from "./locale.dto";
import LocaleService from "./locale.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

export const SaveLocale = api<LocaleDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/locale-save",
  },
  async (input) => {
    try {
      const data = await LocaleService.SaveService(input);
      return { data, status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to save locale: ${error}`);
      throw error;
    }
  }
);

export const SearchLocales = api<SearchType, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/locale-search",
  },
  async (input) => {
    try {
      const page = await LocaleService.SearchService(input);
      return { ...page, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to search locales: ${error}`);
      throw error;
    }
  }
);

export const EntityByIdLocale = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/locale-entity/:id",
  },
  async (params) => {
    try {
      const data = await LocaleService.EntityByIdService(params.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to entity by id locale: ${error}`);
      throw error;
    }
  }
);
