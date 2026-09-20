import { api } from "encore.dev/api";
import type { ResponseType } from "../../utils/app-types";
import type {
  TemplateFileDto,
  TemplateFileRenderDto,
  TemplateFileSearchRequest,
} from "./template-file.dto";
import TemplateFileService from "./template-file.service";

export const SaveTemplateFile = api<TemplateFileDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/template-file-save",
  },
  async (input) => {
    return TemplateFileService.SaveService(input);
  }
);

export const SearchTemplateFile = api<TemplateFileSearchRequest, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/template-file-search",
  },
  async (input) => {
    return TemplateFileService.SearchService(input);
  }
);

export const EntityByIdTemplateFile = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/template-file-entity/:id",
  },
  async (params) => {
    return TemplateFileService.EntityByIdService(params.id);
  }
);

export const RenderTemplateFile = api<TemplateFileRenderDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/template-file-render",
  },
  async (input) => {
    return TemplateFileService.RenderService(input);
  }
);
