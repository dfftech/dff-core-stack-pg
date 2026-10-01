import { Service } from 'encore.dev/service';
import { LoggingMiddleware } from '../../middleware/app-logging';
import { TenantMiddleware } from '../../middleware/db-middleware';

export default new Service('menu_groups', { middlewares: [LoggingMiddleware, TenantMiddleware] });

