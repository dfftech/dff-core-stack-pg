import { api } from "encore.dev/api";
import type { ResponseType, SearchType } from "../../utils/app-types";
import type { ProfileDto } from "./profile.dto";
import ProfileService from "./profile.service";

export const SaveProfile = api<ProfileDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/profile-save",
  },
  async (input: ProfileDto) => {
    return await ProfileService.SaveService(input);
  }
);

export const SearchProfiles = api<SearchType, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/profile-search",
  },
  async (input: SearchType) => {
    return await ProfileService.SearchService(input);
  }
);

export const EntityByIdProfile = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/profile-entity/:id",
  },
  async (params: { id: string }) => {
    return await ProfileService.EntityByIdService(params.id);
  }
);
