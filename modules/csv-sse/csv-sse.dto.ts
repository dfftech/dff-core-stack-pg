export const DEFAULT_BATCH_SIZE = 10;
export const MAX_BATCH_SIZE = 1_000;
export const MAX_CSV_BYTES = 10 * 1024 * 1024 * 1024;
export const MAX_CSV_ROWS = 100_000;

export type CsvSseRequest = {
  url: string;
  batchSize: number;
  maxBatches?: number;
  batchNo?: number;
};

export type CsvSseRecordError = {
  record: unknown;
  rowNumber: number;
  message: string;
};

export type CsvSseEvent = {
  processed: number;
  batches: number;
  data: Record<string, string>[];
  error: CsvSseRecordError[] | { code: string }[];
};
