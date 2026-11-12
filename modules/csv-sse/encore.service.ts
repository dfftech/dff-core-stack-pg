import { Service } from 'encore.dev/service';
import { LoggingMiddleware } from '../../middleware/app-logging';
import { TenantMiddleware } from '../../middleware/db-middleware';

/** Dedicated service for streaming remote CSV records as Server-Sent Events. */
export default new Service('csv-sse', {
  middlewares: [LoggingMiddleware, TenantMiddleware],
});
