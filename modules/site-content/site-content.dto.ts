import type { Query } from "encore.dev/api";
import type { SearchType } from "../../utils/app-types";

export type SiteContentDto = {
  id?: string;
  type: string;
  version: string;
  lang?: string;
  content: string;
  priority?: number;
  active?: boolean;
};

export type SiteContentSearchRequest = SearchType & {
  lang?: string;
};

export type SiteContentGetRequest = {
  type: string;
  lang?: Query<string>;
};
