import { api } from "encore.dev/api";
import type { ResponseType } from "../../utils/app-types";
import type {
  TemplateDto,
  TemplateRenderDto,
  TemplateSearchRequest,
} from "./template.dto";
import TemplateService from "./template.service";

export const SaveTemplate = api<TemplateDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/template-save",
  },
  async (input) => {
    return TemplateService.SaveService(input);
  }
);

export const SearchTemplates = api<TemplateSearchRequest, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/template-search",
  },
  async (input) => {
    return TemplateService.SearchService(input);
  }
);

export const EntityByIdTemplate = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/template-entity/:id",
  },
  async (params) => {
    return TemplateService.EntityByIdService(params.id);
  }
);

export const RenderTemplate = api<TemplateRenderDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/template-render",
  },
  async (input) => {
    return TemplateService.RenderService(input);
  }
);
