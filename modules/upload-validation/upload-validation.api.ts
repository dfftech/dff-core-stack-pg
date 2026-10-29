import { api } from "encore.dev/api";
import type { ResponseType } from "dff-util";
import type {
  UploadValidationBatchSaveRequest,
  UploadValidationDto,
  UploadValidationSearchRequest,
} from "./upload-validation.dto";
import UploadValidationService from "./upload-validation.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

export const SaveUploadValidation = api<UploadValidationDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/upload-validation-save",
  },
  async (input) => {
    try {
      const data = await UploadValidationService.SaveService(input);
      return { data, status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to save upload validation: ${error}`);
      throw error;
    }
  }
);

export const BatchSaveUploadValidation = api<UploadValidationBatchSaveRequest, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/upload-validation-batch-save",
  },
  async (input) => {
    try {
      const data = await UploadValidationService.BatchSaveService(input);
      return { data, total: data.length, status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to batch save upload validations: ${error}`);
      throw error;
    }
  }
);

export const SearchUploadValidations = api<UploadValidationSearchRequest, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/upload-validation-search",
  },
  async (input) => {
    try {
      const page = await UploadValidationService.SearchService(input);
      return { ...page, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to search upload validations: ${error}`);
      throw error;
    }
  }
);

export const EntityByIdUploadValidation = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/upload-validation-entity/:id",
  },
  async (params) => {
    try {
      const data = await UploadValidationService.EntityByIdService(params.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to entity by id upload validation: ${error}`);
      throw error;
    }
  }
);

export const TypeUploadValidation = api<{ type: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/upload-validation-type/:type",
  },
  async (params) => {
    try {
      const data = await UploadValidationService.TypeService(params.type);
      return { data, total: data.length, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to list upload validation by type: ${error}`);
      throw error;
    }
  }
);
