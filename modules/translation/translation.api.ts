import { api } from "encore.dev/api";
import type { ResponseType } from "dff-util";
import type {
  TranslationDataDto,
  TranslationDto,
  TranslationFillDto,
  TranslationLangDto,
  TranslationSearchDto,
  TranslationTextDto,
} from "./translation.dto";
import TranslationService from "./translation.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

export const SaveTranslation = api<TranslationDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/translation-save",
  },
  async (input) => {
    try {
      const data = await TranslationService.SaveService(input);
      return { data, status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to save translation: ${error}`);
      throw error;
    }
  }
);

export const SearchTranslations = api<TranslationSearchDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/translation-search",
  },
  async (input) => {
    try {
      const page = await TranslationService.SearchService(input);
      return { ...page, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to search translations: ${error}`);
      throw error;
    }
  }
);

export const DataTranslation = api<TranslationDataDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/translation-data",
  },
  async (input) => {
    try {
      const data = await TranslationService.DataService(input);
      return { data, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to data translation: ${error}`);
      throw error;
    }
  }
);

export const LangTranslation = api<TranslationLangDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/translation-lang",
  },
  async (input) => {
    try {
      const data = await TranslationService.LangService(input);
      return { data, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to lang translation: ${error}`);
      throw error;
    }
  }
);

export const EntityByIdTranslation = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/translation-entity/:id",
  },
  async (params) => {
    try {
      const data = await TranslationService.EntityByIdService(params.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to entity by id translation: ${error}`);
      throw error;
    }
  }
);

export const TextTranslation = api<TranslationTextDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/translation-text",
  },
  async (input) => {
    try {
      const data = await TranslationService.TextService(input);
      return { data, status: "TRANSLATED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to text translation: ${error}`);
      throw error;
    }
  }
);

export const MapTranslation = api<{ lang: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/translation-map/:lang",
  },
  async (params) => {
    try {
      const data = await TranslationService.MapService(params.lang);
      return { data, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to map translation: ${error}`);
      throw error;
    }
  }
);

export const FillTranslation = api<TranslationFillDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/translation-fill",
  },
  async (input) => {
    try {
      const data = await TranslationService.FillService(input);
      return { data, status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to fill translation: ${error}`);
      throw error;
    }
  }
);
