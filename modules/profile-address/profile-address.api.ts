import { api } from "encore.dev/api";
import type { ResponseType } from "../../utils/app-types";
import type { ProfileAddressDto, ProfileAddressSearchDto } from "./profile-address.dto";
import ProfileAddressService from "./profile-address.service";

export const SaveProfileAddress = api<ProfileAddressDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/profile-address-save",
  },
  async (input) => {
    return ProfileAddressService.SaveService(input);
  }
);

export const SearchProfileAddresses = api<ProfileAddressSearchDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/profile-address-search",
  },
  async (input) => {
    return ProfileAddressService.SearchService(input);
  }
);

export const EntityByIdProfileAddress = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/profile-address-entity/:id",
  },
  async (params) => {
    return ProfileAddressService.EntityByIdService(params.id);
  }
);
