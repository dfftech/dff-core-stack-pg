import { api } from "encore.dev/api";
import type { RequestByIdType, ResponseType, SearchType } from "dff-util";
import type { ProfileDto, ProfileRoleDto, ProfileRoleSearchDto } from "./profile.dto";
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

export const EntityByIdProfile = api<RequestByIdType, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/profile-entity/:id",
  },
  async (params: RequestByIdType) => {
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

/** Lists all non-archived profiles whose `roles` array contains the given roleId (no pagination). */
export const SearchProfileRoles = api<ProfileRoleSearchDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/profile-role-search",
  },
  async (input: ProfileRoleSearchDto) => {
    try {
      const data = await ProfileService.SearchByRoleService(input);
      return { data, total: data.length, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to search profiles by role: ${error}`);
      throw error;
    }
  }
);

/** Adds a roleId to a profile's `roles` array. */
export const AddProfileRole = api<ProfileRoleDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/profile-role-add",
  },
  async (input: ProfileRoleDto) => {
    try {
      const data = await ProfileService.AddRoleService(input);
      return { data, status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to add profile role: ${error}`);
      throw error;
    }
  }
);

/** Removes a roleId from a profile's `roles` array. Uses POST (not DELETE) so `profileId`/`roleId` are read from the JSON body — Encore.ts decodes DELETE request params from the query string only. */
export const DeleteProfileRole = api<ProfileRoleDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/profile-role-delete",
  },
  async (input: ProfileRoleDto) => {
    try {
      const data = await ProfileService.DeleteRoleService(input);
      return { data, status: "DELETED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to delete profile role: ${error}`);
      throw error;
    }
  }
);
