import { api } from "encore.dev/api";
import type { ResponseType, SearchType } from "../../utils/app-types";
import type { LegalDocumentDto } from "./legal-document.dto";
import LegalDocumentService from "./legal-document.service";

export const SaveLegalDocument = api<LegalDocumentDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/legal-document-save",
  },
  async (input) => {
    return LegalDocumentService.SaveService(input);
  }
);

export const SearchLegalDocuments = api<SearchType, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/legal-document-search",
  },
  async (input) => {
    return LegalDocumentService.SearchService(input);
  }
);

export const EntityByIdLegalDocument = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/legal-document-entity/:id",
  },
  async (params) => {
    return LegalDocumentService.EntityByIdService(params.id);
  }
);

export const GetLegalDocument = api<void, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/legal-document-get",
  },
  async () => {
    return LegalDocumentService.GetService();
  }
);
