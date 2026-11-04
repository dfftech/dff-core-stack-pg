import { parse } from "fast-csv";
import { Readable } from "node:stream";
import {
    DEFAULT_BATCH_SIZE,
    MAX_BATCH_SIZE,
    MAX_CSV_BYTES,
    MAX_CSV_ROWS,
    type CsvSseRequest,
} from "./csv-sse.dto";

const PRIVATE_IPV4_RANGES = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
  /^172\.(?:1[6-9]|2\d|3[01])\./,
];

export class CsvSseError extends Error {
  constructor(public readonly code: string, cause?: unknown) {
    super(code, { cause });
    this.name = "CsvSseError";
  }
}

export function parseRequest(
  urlValue: string | null,
  batchSizeValue: string | null,
  maxBatchesValue: string | null,
  batchNoValue: string | null
): CsvSseRequest {
  if (!urlValue?.trim()) throw new CsvSseError('INVALID_CSV_URL');

  let url: URL;
  try {
    url = new URL(urlValue);
  } catch {
    throw new CsvSseError('INVALID_CSV_URL');
  }

  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || isPrivateHost(url.hostname)) {
    throw new CsvSseError('INVALID_CSV_URL');
  }

  const batchSize =
    batchSizeValue === null || batchSizeValue.trim() === '' ? DEFAULT_BATCH_SIZE : Number(batchSizeValue);

  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > MAX_BATCH_SIZE) {
    throw new CsvSseError('INVALID_BATCH_SIZE');
  }

  let maxBatches: number | undefined;
  if (maxBatchesValue !== null && maxBatchesValue.trim() !== '') {
    maxBatches = Number(maxBatchesValue);
    if (!Number.isInteger(maxBatches) || maxBatches < 1) {
      throw new CsvSseError('INVALID_MAX_BATCHES');
    }
  }

  let batchNo: number | undefined;
  if (batchNoValue !== null && batchNoValue.trim() !== '') {
    batchNo = Number(batchNoValue);
    if (!Number.isInteger(batchNo) || batchNo < 1) {
      throw new CsvSseError('INVALID_BATCH_NO');
    }
  }

  return { url: url.toString(), batchSize, maxBatches, batchNo };
}

export async function streamCsv(
  input: CsvSseRequest,
  onBatch: (
    rows: Record<string, string>[],
    processed: number,
    batch: number,
  ) => Promise<void>,
  onRecordError: (record: unknown, rowNumber: number, message: string) => void,
): Promise<{ processed: number; batches: number }> {
  const response = await fetch(input.url, {
    redirect: "error",
    headers: { Accept: "text/csv,application/csv,text/plain;q=0.9,*/*;q=0.1" },
  }).catch((error: unknown) => {
    throw new CsvSseError("CSV_DOWNLOAD_FAILED", error);
  });

  if (!response.ok || !response.body) {
    throw new CsvSseError("CSV_DOWNLOAD_FAILED");
  }

  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_CSV_BYTES) {
    throw new CsvSseError("CSV_FILE_TOO_LARGE");
  }

  let downloadedBytes = 0;
  const byteLimitedBody = Readable.fromWeb(response.body as never);
  byteLimitedBody.on("data", (chunk: Buffer) => {
    downloadedBytes += chunk.length;
    if (downloadedBytes > MAX_CSV_BYTES) {
      byteLimitedBody.destroy(new CsvSseError("CSV_FILE_TOO_LARGE"));
    }
  });

  const parser = parse<Record<string, string>, Record<string, string>>({
    headers: (headers) => headers.map((header) => (header?.trim() ? header : undefined)),
    ignoreEmpty: true,
    strictColumnHandling: true,
    trim: true,
  });
  parser.on("data-invalid", (record: unknown, rowNumber: number, reason?: unknown) => {
    onRecordError(record, rowNumber, errorMessage(reason));
  });
  byteLimitedBody.pipe(parser);

  const batch: Record<string, string>[] = [];
  let processed = 0;
  let batches = 0;

  try {
    for await (const row of parser) {
      processed += 1;
      if (processed > MAX_CSV_ROWS) {
        throw new CsvSseError("CSV_ROW_LIMIT_EXCEEDED");
      }

      const currentBatchNo = batches + 1;
      const wantCurrentBatch = input.batchNo === undefined || input.batchNo === currentBatchNo;
      if (wantCurrentBatch) batch.push(row);

      if (processed % input.batchSize === 0) {
        batches += 1;
        if (wantCurrentBatch) {
          await onBatch(batch.splice(0), processed, batches);
        }
        if (input.batchNo !== undefined && batches >= input.batchNo) {
          byteLimitedBody.destroy();
          parser.destroy();
          return { processed, batches };
        }
        if (input.maxBatches !== undefined && batches >= input.maxBatches) {
          byteLimitedBody.destroy();
          parser.destroy();
          return { processed, batches };
        }
      }
    }

    if (batch.length > 0) {
      batches += 1;
      await onBatch(batch.splice(0), processed, batches);
    }
    return { processed, batches };
  } catch (error) {
    byteLimitedBody.destroy();
    parser.destroy();
    if (error instanceof CsvSseError) throw error;
    throw new CsvSseError("CSV_PARSE_FAILED", error);
  }
}

function errorMessage(reason: unknown): string {
  if (reason instanceof Error) return reason.message;
  if (typeof reason === "string" && reason.trim()) return reason;
  return "Invalid CSV record";
}

function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return (
    host === "localhost" ||
    host === "::1" ||
    host === "0:0:0:0:0:0:0:1" ||
    PRIVATE_IPV4_RANGES.some((range) => range.test(host))
  );
}
