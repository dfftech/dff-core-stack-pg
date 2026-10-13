import { api } from "encore.dev/api";
import type { ResponseType } from "dff-util";
import type { ProfileAddressDto, ProfileAddressSearchDto } from "./profile-address.dto";
import ProfileAddressService from "./profile-address.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

export const SaveProfileAddress = api<ProfileAddressDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/profile-address-save",
  },
  async (input) => {
    try {
      const data = await ProfileAddressService.SaveService(input);
      return { data, status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to save profile address: ${error}`);
      throw error;
    }
  }
);

export const SearchProfileAddresses = api<ProfileAddressSearchDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/profile-address-search",
  },
  async (input) => {
    try {
      const page = await ProfileAddressService.SearchService(input);
      return { ...page, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to search profile addresses: ${error}`);
      throw error;
    }
  }
);

export const EntityByIdProfileAddress = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/profile-address-entity/:id",
  },
  async (params) => {
    try {
      const data = await ProfileAddressService.EntityByIdService(params.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to entity by id profile address: ${error}`);
      throw error;
    }
  }
);
