import { api } from "encore.dev/api";
import type { ResponseType, SearchType } from "dff-util";
import type { ProfileHashDto } from "./profile-hash.dto";
import ProfileHashService from "./profile-hash.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

export const SaveProfileHash = api<ProfileHashDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/profile-hash-save",
  },
  async (input: ProfileHashDto) => {
    try {
      const data = await ProfileHashService.SaveService(input);
      return { data, status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to save profile hash: ${error}`);
      throw error;
    }
  }
);

export const SearchProfileHashes = api<SearchType, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/profile-hash-search",
  },
  async (input: SearchType) => {
    try {
      const page = await ProfileHashService.SearchService(input);
      return { ...page, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to search profile hashes: ${error}`);
      throw error;
    }
  }
);

export const EntityByIdProfileHash = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/profile-hash-entity/:id",
  },
  async (params: { id: string }) => {
    try {
      const data = await ProfileHashService.EntityByIdService(params.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to entity by id profile hash: ${error}`);
      throw error;
    }
  }
);
