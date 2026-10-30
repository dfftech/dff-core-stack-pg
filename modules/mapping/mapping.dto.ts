import type { SearchType } from "dff-util";

export type MappingDto = {
  id?: string;
  type: string;
  entityField: string;
  inputField: string;
  isRequired?: boolean;
  compute?: string[];
  aiSummary?: string;
  active?: boolean;
};

export type MappingSearchRequest = SearchType & {
  type?: string;
};

export type MappingBatchSaveRequest = {
  items: MappingDto[];
};
