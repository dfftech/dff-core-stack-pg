import { api } from "encore.dev/api";
import type { ResponseType, SearchType } from "../../utils/app-types";
import type { EnquiryDto } from "./enquiry.dto";
import EnquiryService from "./enquiry.service";

export const SaveEnquiry = api<EnquiryDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/enquiry-save",
  },
  async (input) => {
    return EnquiryService.SaveService(input);
  }
);

export const SearchEnquiries = api<SearchType, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/enquiry-search",
  },
  async (input) => {
    return EnquiryService.SearchService(input);
  }
);

export const EntityByIdEnquiry = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/enquiry-entity/:id",
  },
  async (params) => {
    return EnquiryService.EntityByIdService(params.id);
  }
);

export const GetEnquiry = api<void, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/enquiry-get",
  },
  async () => {
    return EnquiryService.GetService();
  }
);
