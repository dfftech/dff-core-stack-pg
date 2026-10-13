import { api } from "encore.dev/api";
import type { ResponseType, SearchType } from "dff-util";
import type { EnquiryDto } from "./enquiry.dto";
import EnquiryService from "./enquiry.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

export const SaveEnquiry = api<EnquiryDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/enquiry-save",
  },
  async (input) => {
    try {
      const data = await EnquiryService.SaveService(input);
      return { data, status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to save enquiry: ${error}`);
      throw error;
    }
  }
);

export const SearchEnquiries = api<SearchType, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/enquiry-search",
  },
  async (input) => {
    try {
      const page = await EnquiryService.SearchService(input);
      return { ...page, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to search enquiries: ${error}`);
      throw error;
    }
  }
);

export const EntityByIdEnquiry = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/enquiry-entity/:id",
  },
  async (params) => {
    try {
      const data = await EnquiryService.EntityByIdService(params.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to entity by id enquiry: ${error}`);
      throw error;
    }
  }
);

export const GetEnquiry = api<void, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/enquiry-get",
  },
  async () => {
    try {
      const data = await EnquiryService.GetService();
      return { data, status: "RETRIEVED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to get enquiry: ${error}`);
      throw error;
    }
  }
);
