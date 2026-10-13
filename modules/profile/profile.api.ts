import { api } from "encore.dev/api";
import type { ResponseType, SearchType } from "dff-util";
import type { ProfileDto } from "./profile.dto";
import ProfileService from "./profile.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

export const SaveProfile = api<ProfileDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/profile-save",
  },
  async (input: ProfileDto) => {
    try {
      const data = await ProfileService.SaveService(input);
      return { data, status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to save profile: ${error}`);
      throw error;
    }
  }
);

export const SearchProfiles = api<SearchType, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/profile-search",
  },
  async (input: SearchType) => {
    try {
      const page = await ProfileService.SearchService(input);
      return { ...page, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to search profiles: ${error}`);
      throw error;
    }
  }
);

export const EntityByIdProfile = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/profile-entity/:id",
  },
  async (params: { id: string }) => {
    try {
      const data = await ProfileService.EntityByIdService(params.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to entity by id profile: ${error}`);
      throw error;
    }
  }
);
