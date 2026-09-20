import type { Query } from "encore.dev/api";
import type { RequestBodyType } from "../../utils/app-types";

export type TemplateFileDto = {
  id?: string;
  name: string;
  lang?: string;
  channel?: string;
  subject?: string;
  template: string;
  active?: boolean;
};

export type TemplateFileRenderDto = {
  templateId: string;
  lang?: string;
  data?: RequestBodyType;
};

export type TemplateFileSearchRequest = {
  limit?: Query<number>;
  skip?: Query<number>;
  orderBy?: Query<string>;
  order?: Query<string>;
  searchTerm?: Query<string>;
  lang?: Query<string>;
  active?: Query<boolean>;
  filters?: Query<string>;
};
