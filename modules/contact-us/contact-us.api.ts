import { api } from "encore.dev/api";
import type { ResponseType, SearchType } from "../../utils/app-types";
import type { ContactUsDto } from "./contact-us.dto";
import ContactUsService from "./contact-us.service";

export const SaveContactUs = api<ContactUsDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/contact-us-save",
  },
  async (input) => {
    return ContactUsService.SaveService(input);
  }
);

export const SearchContactUs = api<SearchType, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/contact-us-search",
  },
  async (input) => {
    return ContactUsService.SearchService(input);
  }
);

export const EntityByIdContactUs = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/contact-us-entity/:id",
  },
  async (params) => {
    return ContactUsService.EntityByIdService(params.id);
  }
);

export const GetContactUs = api<void, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/contact-us-get",
  },
  async () => {
    return ContactUsService.GetService();
  }
);
