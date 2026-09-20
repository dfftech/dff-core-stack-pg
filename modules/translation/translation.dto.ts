import type { RequestBodyType } from "../../utils/app-types";

export type TranslationDto = {
  id?: string;
  type: string;
  key: string;
  data?: RequestBodyType;
  active?: boolean;
};

export type TranslationTextDto = {
  text: string;
  source?: string;
  target: string;
};

export type TranslationFillDto = {
  lang: string;
  source?: string;
};

export type TranslationSearchDto = {
  limit?: number;
  skip?: number;
  searchTerm?: string;
  active?: boolean;
  type?: string;
  lang?: string;
  filters?: string;
};

export type TranslationDataDto = {
  type?: string;
  lang?: string;
};

export type TranslationLangDto = {
  lang?: string;
};
