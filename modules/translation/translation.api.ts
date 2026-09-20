import { api } from "encore.dev/api";
import type { ResponseType } from "../../utils/app-types";
import type {
  TranslationDataDto,
  TranslationDto,
  TranslationFillDto,
  TranslationLangDto,
  TranslationSearchDto,
  TranslationTextDto,
} from "./translation.dto";
import TranslationService from "./translation.service";

export const SaveTranslation = api<TranslationDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/translation-save",
  },
  async (input) => {
    return TranslationService.SaveService(input);
  }
);

export const SearchTranslations = api<TranslationSearchDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/translation-search",
  },
  async (input) => {
    return TranslationService.SearchService(input);
  }
);

export const DataTranslation = api<TranslationDataDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/translation-data",
  },
  async (input) => {
    return TranslationService.DataService(input);
  }
);

export const LangTranslation = api<TranslationLangDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/translation-lang",
  },
  async (input) => {
    return TranslationService.LangService(input);
  }
);

export const EntityByIdTranslation = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/translation-entity/:id",
  },
  async (params) => {
    return TranslationService.EntityByIdService(params.id);
  }
);

export const TextTranslation = api<TranslationTextDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/translation-text",
  },
  async (input) => {
    return TranslationService.TextService(input);
  }
);

export const MapTranslation = api<{ lang: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/translation-map/:lang",
  },
  async (params) => {
    return TranslationService.MapService(params.lang);
  }
);

export const FillTranslation = api<TranslationFillDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/translation-fill",
  },
  async (input) => {
    return TranslationService.FillService(input);
  }
);
