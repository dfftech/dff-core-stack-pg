import { ConstKeys } from "dff-util";
import { api } from "encore.dev/api";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
    CsvSseError,
    parseRequest,
    streamCsv,
} from "./csv-sse.service";

/**
 * GET /csv-sse?url=<encoded-csv-url>&batch-size=100&max-batches=5&batch-no=3
 *
 * Streams `PROCESSING` batches and an `ACTION_COMPLETED` final event.
 * Each event has `processed`, `batches`, `data`, and `error` fields.
 * `max-batches`, when provided, stops streaming once that many batches
 * have been emitted (the CSV download is aborted early).
 * `batch-no`, when provided, emits only that specific batch (earlier rows
 * are still read from the stream but discarded) and stops immediately after.
 */
export const CsvSse = api.raw(
  { expose: true, method: "GET", path: "/csv-sse", sensitive: true },
  (req: IncomingMessage, resp: ServerResponse) => {
    void handleCsvSse(req, resp);
  },
);

async function handleCsvSse(req: IncomingMessage, resp: ServerResponse): Promise<void> {
  try {
    const requestUrl = new URL(req.url ?? "/csv-sse", "http://localhost");
    const input = parseRequest(
      requestUrl.searchParams.get('url'),
      requestUrl.searchParams.get('batch-size'),
      requestUrl.searchParams.get('max-batches'),
      requestUrl.searchParams.get('batch-no')
    );

    resp.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    resp.flushHeaders();

    const recordErrors: CsvRecordError[] = [];
    const result = await streamCsv(
      input,
      async (rows, processed, batches) => {
        await writeEvent(resp, ConstKeys.PROCESSING, {
          processed,
          batches,
          data: rows,
          error: takeRecordErrors(recordErrors),
        });
      },
      (record, rowNumber, message) => {
        recordErrors.push({ record, rowNumber, message });
      },
    );
    await writeEvent(resp, ConstKeys.ACTION_COMPLETED, {
      processed: result.processed,
      batches: result.batches,
      data: [],
      error: takeRecordErrors(recordErrors),
    });
  } catch (error) {
    const code = error instanceof CsvSseError ? error.code : "CSV_SSE_FAILED";
    if (!resp.destroyed) {
      if (!resp.headersSent) {
        resp.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        resp.end(JSON.stringify({ error: code }));
        return;
      }
      if (!resp.destroyed) {
        await writeEvent(resp, ConstKeys.OPERATION_FAILED, {
          processed: 0,
          batches: 0,
          data: [],
          error: [{ code }],
        });
      }
    }
  } finally {
    if (!resp.writableEnded && !resp.destroyed) resp.end();
  }
}

type CsvRecordError = {
  record: unknown;
  rowNumber: number;
  message: string;
};

function takeRecordErrors(errors: CsvRecordError[]): CsvRecordError[] {
  return errors.splice(0);
}

async function writeEvent(
  resp: ServerResponse,
  event: string,
  data: Record<string, unknown>,
): Promise<void> {
  const payload = { event, ...data };
  if (resp.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`)) return;
  await new Promise<void>((resolve) => resp.once("drain", resolve));
}
