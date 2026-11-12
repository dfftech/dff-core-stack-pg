import type { ResponseType } from 'dff-util';
import { api } from 'encore.dev/api';
import { AppError } from '../../utils/app-error';
import { logger } from '../../utils/app-util';
import type { CsvSseRequest } from './csv-sse.dto';
import CsvSseService from './csv-sse.service';

/**
 * Starts downloading a remote CSV and publishes each parsed batch to `topic`.
 * The response confirms that the download was started; processing continues in
 * the background and completion or failure is sent to the supplied Kafka topic.
 */
export const CsvSse = api<CsvSseRequest, ResponseType>(
  { expose: true, method: 'POST', path: '/csv-sse' },
  async (input) => {
    try {
      const data = await CsvSseService.StartService(input);
      return { data, status: 'DOWNLOAD_STARTED' };
    } catch (error) {
      if (error instanceof AppError) return { data: null, error: error.code };
      logger().error(`Failed to start CSV download: ${error}`);
      throw error;
    }
  }
);
