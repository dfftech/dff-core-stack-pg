import type { SearchType } from "dff-util";

export type UploadValidationDto = {
  id?: string;
  type: string;
  entityField: string;
  fileField: string;
  isRequired?: boolean;
  compute?: string;
  aiSummary?: string;
  active?: boolean;
};

export type UploadValidationSearchRequest = SearchType & {
  type?: string;
};

export type UploadValidationBatchSaveRequest = {
  items: UploadValidationDto[];
};
