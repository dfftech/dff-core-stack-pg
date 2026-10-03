import { api } from "encore.dev/api";
import type { ResponseType, SearchType } from "../../utils/app-types";
import type { OtpVerificationDto } from "./otp-verification.dto";
import OtpVerificationService from "./otp-verification.service";

export const SaveOtpVerification = api<OtpVerificationDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/otp-verification-save",
  },
  async (input: OtpVerificationDto) => {
    return await OtpVerificationService.SaveService(input);
  }
);

export const SearchOtpVerifications = api<SearchType, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/otp-verification-search",
  },
  async (input: SearchType) => {
    return await OtpVerificationService.SearchService(input);
  }
);

export const EntityByIdOtpVerification = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/otp-verification-entity/:id",
  },
  async (params: { id: string }) => {
    return await OtpVerificationService.EntityByIdService(params.id);
  }
);
