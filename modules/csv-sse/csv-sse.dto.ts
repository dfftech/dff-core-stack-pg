export const DEFAULT_BATCH_SIZE = 25;
export const MAX_BATCH_SIZE = 1_000;
export const MAX_CSV_BYTES = 10 * 1024 * 1024 * 1024;
export const MAX_CSV_ROWS = 100_000;

export type CsvSseRequest = {
  url: string;
  topic: string;
  key?: string;
  batchSize?: number;
  maxBatches?: number;
  batchNo?: number;
};

export type NormalizedCsvSseRequest = Omit<CsvSseRequest, 'key' | 'batchSize'> & {
  key: string | null;
  batchSize: number;
};

export type CsvSseStartResult = {
  message: 'DOWNLOAD_STARTED';
  topic: string;
};

export type CsvSseRecordError = {
  record: unknown;
  rowNumber: number;
  message: string;
};

export type CsvSseTopicMessage = {
  event: string;
  requestId: string;
  tenant?: string;
  branch?: string;
  /** Requested CSV rows per emitted batch. */
  limit: number;
  processed: number;
  data: Record<string, string>[];
  error: CsvSseRecordError[] | { code: string }[];
};
