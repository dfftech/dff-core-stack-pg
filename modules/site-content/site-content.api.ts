import { api } from "encore.dev/api";
import type { ResponseType } from "../../utils/app-types";
import type {
  SiteContentDto,
  SiteContentGetRequest,
  SiteContentSearchRequest,
} from "./site-content.dto";
import SiteContentService from "./site-content.service";

export const SaveSiteContent = api<SiteContentDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/site-content-save",
  },
  async (input) => {
    return SiteContentService.SaveService(input);
  }
);

export const SearchSiteContents = api<SiteContentSearchRequest, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/site-content-search",
  },
  async (input) => {
    return SiteContentService.SearchService(input);
  }
);

export const EntityByIdSiteContent = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/site-content-entity/:id",
  },
  async (params) => {
    return SiteContentService.EntityByIdService(params.id);
  }
);

export const GetSiteContent = api<SiteContentGetRequest, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/site-content-get/:type",
  },
  async (input) => {
    return SiteContentService.GetService(input);
  }
);
