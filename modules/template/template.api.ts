import { api } from "encore.dev/api";
import type { ResponseType } from "dff-util";
import type {
  TemplateDto,
  TemplateRenderDto,
  TemplateSearchRequest,
} from "./template.dto";
import TemplateService from "./template.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

export const SaveTemplate = api<TemplateDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/template-save",
  },
  async (input) => {
    try {
      const data = await TemplateService.SaveService(input);
      return { data, status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to save template: ${error}`);
      throw error;
    }
  }
);

export const SearchTemplates = api<TemplateSearchRequest, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/template-search",
  },
  async (input) => {
    try {
      const page = await TemplateService.SearchService(input);
      return { ...page, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to search templates: ${error}`);
      throw error;
    }
  }
);

export const EntityByIdTemplate = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/template-entity/:id",
  },
  async (params) => {
    try {
      const data = await TemplateService.EntityByIdService(params.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to entity by id template: ${error}`);
      throw error;
    }
  }
);

export const RenderTemplate = api<TemplateRenderDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/template-render",
  },
  async (input) => {
    try {
      const data = await TemplateService.RenderService(input);
      return { data, status: "RETRIEVED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to render template: ${error}`);
      throw error;
    }
  }
);
