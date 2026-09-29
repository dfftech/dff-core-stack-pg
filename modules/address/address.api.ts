import { api } from "encore.dev/api";
import type { ResponseType } from "../../utils/app-types";
import type { AddressDto, AddressSearchDto } from "./address.dto";
import AddressService from "./address.service";

export const SaveAddress = api<AddressDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/address-save",
  },
  async (input) => {
    return AddressService.SaveService(input);
  }
);

export const SearchAddresses = api<AddressSearchDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/address-search",
  },
  async (input) => {
    return AddressService.SearchService(input);
  }
);

export const EntityByIdAddress = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/address-entity/:id",
  },
  async (params) => {
    return AddressService.EntityByIdService(params.id);
  }
);
