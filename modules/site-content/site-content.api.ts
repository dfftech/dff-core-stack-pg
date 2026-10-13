import { api } from "encore.dev/api";
import type { ResponseType } from "dff-util";
import type {
  SiteContentDto,
  SiteContentGetRequest,
  SiteContentSearchRequest,
} from "./site-content.dto";
import SiteContentService from "./site-content.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

export const SaveSiteContent = api<SiteContentDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/site-content-save",
  },
  async (input) => {
    try {
      const data = await SiteContentService.SaveService(input);
      return { data, status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to save site content: ${error}`);
      throw error;
    }
  }
);

export const SearchSiteContents = api<SiteContentSearchRequest, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/site-content-search",
  },
  async (input) => {
    try {
      const page = await SiteContentService.SearchService(input);
      return { ...page, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to search site contents: ${error}`);
      throw error;
    }
  }
);

export const EntityByIdSiteContent = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/site-content-entity/:id",
  },
  async (params) => {
    try {
      const data = await SiteContentService.EntityByIdService(params.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to entity by id site content: ${error}`);
      throw error;
    }
  }
);

export const GetSiteContent = api<SiteContentGetRequest, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/site-content-get/:type",
  },
  async (input) => {
    try {
      const data = await SiteContentService.GetService(input);
      return { data, status: "RETRIEVED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to get site content: ${error}`);
      throw error;
    }
  }
);
