import { api } from "encore.dev/api";
import type { ResponseType } from "dff-util";
import type { AddressDto, AddressSearchDto } from "./address.dto";
import AddressService from "./address.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

export const SaveAddress = api<AddressDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/address-save",
  },
  async (input) => {
    try {
      const data = await AddressService.SaveService(input);
      return { data, status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to save address: ${error}`);
      throw error;
    }
  }
);

export const SearchAddresses = api<AddressSearchDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/address-search",
  },
  async (input) => {
    try {
      const page = await AddressService.SearchService(input);
      return { ...page, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to search addresses: ${error}`);
      throw error;
    }
  }
);

export const EntityByIdAddress = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/address-entity/:id",
  },
  async (params) => {
    try {
      const data = await AddressService.EntityByIdService(params.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to entity by id address: ${error}`);
      throw error;
    }
  }
);
