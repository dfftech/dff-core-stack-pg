import { api } from "encore.dev/api";
import type { ResponseType, SearchType } from "../../utils/app-types";
import type { LocaleDto } from "./locale.dto";
import LocaleService from "./locale.service";

export const SaveLocale = api<LocaleDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/locale-save",
  },
  async (input) => {
    return LocaleService.SaveService(input);
  }
);

export const SearchLocales = api<SearchType, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/locale-search",
  },
  async (input) => {
    return LocaleService.SearchService(input);
  }
);

export const EntityByIdLocale = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/locale-entity/:id",
  },
  async (params) => {
    return LocaleService.EntityByIdService(params.id);
  }
);
