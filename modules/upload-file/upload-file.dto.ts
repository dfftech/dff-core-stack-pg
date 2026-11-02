import type { SearchType } from 'dff-util';

export type UploadFileDto = {
  id?: string;
  name: string;
  url: string;
  status?: string;
  type: string;
  provider: string;
  summary?: string | null;
  errorSummary?: string | null;
  active?: boolean;
};

export type UploadFileSearchRequest = SearchType & {
  provider?: string;
  type?: string;
  status?: string;
};
