import { api } from "encore.dev/api";
import type { ResponseType, SearchType } from "../../utils/app-types";
import type { OtpDto } from "./otp.dto";
import OtpService from "./otp.service";

export const SaveOtp = api<OtpDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/otp-save",
  },
  async (input: OtpDto) => {
    return await OtpService.SaveService(input);
  }
);

export const SearchOtps = api<SearchType, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/otp-search",
  },
  async (input: SearchType) => {
    return await OtpService.SearchService(input);
  }
);

export const EntityByIdOtp = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/otp-entity/:id",
  },
  async (params: { id: string }) => {
    return await OtpService.EntityByIdService(params.id);
  }
);
