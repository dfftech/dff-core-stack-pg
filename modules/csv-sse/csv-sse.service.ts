import { ConstKeys } from 'dff-util';
import log from 'encore.dev/log';
import { parse } from 'fast-csv';
import { Readable } from 'node:stream';
import { AppError } from '../../utils/app-error';
import { session_meta } from '../../utils/app-util';
import { kafkaPublish } from '../../utils/kafka-util';
import {
  DEFAULT_BATCH_SIZE,
  MAX_BATCH_SIZE,
  MAX_CSV_BYTES,
  MAX_CSV_ROWS,
  type CsvSseRecordError,
  type CsvSseRequest,
  type CsvSseStartResult,
  type NormalizedCsvSseRequest,
} from './csv-sse.dto';

const PRIVATE_IPV4_RANGES = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
  /^172\.(?:1[6-9]|2\d|3[01])\./,
];

export default class CsvSseService {
  static async StartService(input: CsvSseRequest): Promise<CsvSseStartResult> {
    const { request_id: requestId, tenant_id: tenant, branch_id: branch } = session_meta();
    const { request, response } = await validateCSV(input);

    void processCsv(request, response, { requestId, tenant, branch }).catch((error: unknown) => {
      log.error('CSV background processing failed', {
        topic: request.topic,
        tenant,
        branch,
        error: errorMessage(error),
      });
    });

    return { message: 'DOWNLOAD_STARTED', topic: request.topic };
  }
}

async function processCsv(
  input: NormalizedCsvSseRequest,
  response: Response,
  kafkaContext: CsvKafkaContext
): Promise<void> {
  const byteLimitedBody = Readable.fromWeb(response.body as never);
  const parser = parse<Record<string, string>, Record<string, string>>({
    headers: normalizeHeaders,
    ignoreEmpty: true,
    strictColumnHandling: true,
    trim: true,
  });
  const context = new CsvStreamContext(byteLimitedBody);

  byteLimitedBody.on('data', context.trackDownloadedBytes);
  parser.on('data-invalid', context.collectRecordError);
  byteLimitedBody.pipe(parser);

  try {
    for await (const row of parser) {
      context.processed += 1;
      if (context.processed > MAX_CSV_ROWS) throw new CsvProcessingError('CSV_ROW_LIMIT_EXCEEDED');

      const currentBatchNo = context.batches + 1;
      const wantCurrentBatch = input.batchNo === undefined || input.batchNo === currentBatchNo;
      if (wantCurrentBatch) context.batch.push(row);
      if (context.processed % input.batchSize !== 0) continue;

      context.batches += 1;
      if (wantCurrentBatch) {
        await publishCsvBatch(
          input.topic,
          context.batch.splice(0),
          context.processed,
          context.recordErrors,
          kafkaContext,
          input.batchSize,
          input.key
        );
      }
      if (
        (input.batchNo !== undefined && context.batches >= input.batchNo) ||
        (input.maxBatches !== undefined && context.batches >= input.maxBatches)
      ) {
        byteLimitedBody.destroy();
        parser.destroy();
        break;
      }
    }

    if (!parser.destroyed && context.batch.length > 0) {
      context.batches += 1;
      await publishCsvBatch(
        input.topic,
        context.batch.splice(0),
        context.processed,
        context.recordErrors,
        kafkaContext,
        input.batchSize,
        input.key
      );
    }

    await kafkaPublish(input.topic, input.key, {
      event: ConstKeys.ACTION_COMPLETED,
      requestId: kafkaContext.requestId,
      tenant: kafkaContext.tenant,
      branch: kafkaContext.branch,
      limit: input.batchSize,
      processed: context.processed,
      data: [],
      error: takeRecordErrors(context.recordErrors),
    });
  } catch (error) {
    byteLimitedBody.destroy();
    parser.destroy();
    const code = error instanceof CsvProcessingError ? error.code : 'CSV_PROCESSING_FAILED';
    await kafkaPublish(input.topic, input.key, {
      event: ConstKeys.OPERATION_FAILED,
      requestId: kafkaContext.requestId,
      tenant: kafkaContext.tenant,
      branch: kafkaContext.branch,
      limit: input.batchSize,
      processed: context.processed,
      data: [],
      error: [{ code }],
    });
    throw error;
  }
}

class CsvStreamContext {
  readonly batch: Record<string, string>[] = [];
  readonly recordErrors: CsvSseRecordError[] = [];
  downloadedBytes = 0;
  processed = 0;
  batches = 0;

  constructor(private readonly stream: Readable) {}

  trackDownloadedBytes = (chunk: Buffer): void => {
    this.downloadedBytes += chunk.length;
    if (this.downloadedBytes > MAX_CSV_BYTES) {
      this.stream.destroy(new CsvProcessingError('CSV_FILE_TOO_LARGE'));
    }
  };

  collectRecordError = (record: unknown, rowNumber: number, reason?: unknown): void => {
    this.recordErrors.push({ record, rowNumber, message: errorMessage(reason) });
  };
}

type CsvKafkaContext = {
  requestId: string;
  tenant?: string;
  branch?: string;
};

async function publishCsvBatch(
  topic: string,
  data: Record<string, string>[],
  processed: number,
  recordErrors: CsvSseRecordError[],
  kafkaContext: CsvKafkaContext,
  limit: number,
  key: string | null
): Promise<void> {
  await kafkaPublish(topic, key, {
    event: ConstKeys.PROCESSING,
    requestId: kafkaContext.requestId,
    tenant: kafkaContext.tenant,
    branch: kafkaContext.branch,
    limit,
    processed,
    data,
    error: takeRecordErrors(recordErrors),
  });
}

function normalizeHeaders(headers: (string | null | undefined)[]): (string | undefined)[] {
  return headers.map((header) => (header?.trim() ? header : undefined));
}

async function validateCSV(input: CsvSseRequest): Promise<{ request: NormalizedCsvSseRequest; response: Response }> {
  if (!input.topic?.trim()) throw new AppError('CSV_TOPIC_REQUIRED');
  if (!/^[a-zA-Z0-9._-]+$/.test(input.topic.trim())) throw new AppError('INVALID_CSV_TOPIC');

  let url: URL;
  try {
    url = new URL(input.url);
  } catch {
    throw new AppError('INVALID_CSV_URL');
  }

  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || isPrivateHost(url.hostname)) {
    throw new AppError('INVALID_CSV_URL');
  }

  const batchSize = input.batchSize ?? DEFAULT_BATCH_SIZE;
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > MAX_BATCH_SIZE) {
    throw new AppError('INVALID_BATCH_SIZE');
  }
  if (input.maxBatches !== undefined && (!Number.isInteger(input.maxBatches) || input.maxBatches < 1)) {
    throw new AppError('INVALID_MAX_BATCHES');
  }
  if (input.batchNo !== undefined && (!Number.isInteger(input.batchNo) || input.batchNo < 1)) {
    throw new AppError('INVALID_BATCH_NO');
  }

  const key = input.key?.trim() || null;
  const request = { ...input, url: url.toString(), topic: input.topic.trim(), key, batchSize };
  const response = await fetch(request.url, {
    redirect: 'error',
    headers: { Accept: 'text/csv,application/csv,text/plain;q=0.9,*/*;q=0.1' },
  }).catch(() => {
    throw new AppError('CSV_DOWNLOAD_FAILED');
  });

  if (!response.ok || !response.body) throw new AppError('CSV_DOWNLOAD_FAILED');

  const contentLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_CSV_BYTES) {
    await response.body.cancel();
    throw new AppError('CSV_FILE_TOO_LARGE');
  }

  return { request, response };
}

class CsvProcessingError extends Error {
  constructor(
    public readonly code: string,
    cause?: unknown
  ) {
    super(code, { cause });
    this.name = 'CsvProcessingError';
  }
}

function takeRecordErrors(errors: CsvSseRecordError[]): CsvSseRecordError[] {
  return errors.splice(0);
}

function errorMessage(reason: unknown): string {
  if (reason instanceof Error) return reason.message;
  if (typeof reason === 'string' && reason.trim()) return reason;
  return 'Invalid CSV record';
}

function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  return (
    host === 'localhost' ||
    host === '::1' ||
    host === '0:0:0:0:0:0:0:1' ||
    PRIVATE_IPV4_RANGES.some((range) => range.test(host))
  );
}
