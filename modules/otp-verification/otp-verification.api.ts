import { api } from "encore.dev/api";
import type { ResponseType, SearchType } from "dff-util";
import type { OtpVerificationDto } from "./otp-verification.dto";
import OtpVerificationService from "./otp-verification.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

export const SaveOtpVerification = api<OtpVerificationDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/otp-verification-save",
  },
  async (input: OtpVerificationDto) => {
    try {
      const data = await OtpVerificationService.SaveService(input);
      return { data, status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to save otp verification: ${error}`);
      throw error;
    }
  }
);

export const SearchOtpVerifications = api<SearchType, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/otp-verification-search",
  },
  async (input: SearchType) => {
    try {
      const page = await OtpVerificationService.SearchService(input);
      return { ...page, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to search otp verifications: ${error}`);
      throw error;
    }
  }
);

export const EntityByIdOtpVerification = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/otp-verification-entity/:id",
  },
  async (params: { id: string }) => {
    try {
      const data = await OtpVerificationService.EntityByIdService(params.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to entity by id otp verification: ${error}`);
      throw error;
    }
  }
);
