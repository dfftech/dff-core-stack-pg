import { api } from "encore.dev/api";
import type { ResponseType, SearchType } from "../../utils/app-types";
import type { ProfileHashDto } from "./profile-hash.dto";
import ProfileHashService from "./profile-hash.service";

export const SaveProfileHash = api<ProfileHashDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/profile-hash-save",
  },
  async (input: ProfileHashDto) => {
    return await ProfileHashService.SaveService(input);
  }
);

export const SearchProfileHashes = api<SearchType, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/profile-hash-search",
  },
  async (input: SearchType) => {
    return await ProfileHashService.SearchService(input);
  }
);

export const EntityByIdProfileHash = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/profile-hash-entity/:id",
  },
  async (params: { id: string }) => {
    return await ProfileHashService.EntityByIdService(params.id);
  }
);
