import type { RequestBodyType } from "../../utils/app-types";

export type TemplateDto = {
  id?: string;
  name: string;
  lang?: string;
  channel?: string;
  subject?: string;
  content: string;
  active?: boolean;
};

export type TemplateRenderDto = {
  templateId: string;
  lang?: string;
  data?: RequestBodyType;
};

export type TemplateSearchRequest = {
  limit?: number;
  skip?: number;
  orderBy?: string;
  order?: string;
  searchTerm?: string;
  lang?: string;
  active?: boolean;
  filters?: string;
};
