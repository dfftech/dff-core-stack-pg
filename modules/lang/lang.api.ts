import { api } from "encore.dev/api";
import type { ResponseType, SearchType } from "../../utils/app-types";
import type { LangDto } from "./lang.dto";
import LangService from "./lang.service";

export const SaveLang = api<LangDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/lang-save",
  },
  async (input) => {
    return LangService.SaveService(input);
  }
);

export const SearchLangs = api<SearchType, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/lang-search",
  },
  async (input) => {
    return LangService.SearchService(input);
  }
);

export const EntityByIdLang = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/lang-entity/:id",
  },
  async (params) => {
    return LangService.EntityByIdService(params.id);
  }
);
