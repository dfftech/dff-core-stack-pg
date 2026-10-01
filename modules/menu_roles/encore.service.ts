import { Service } from 'encore.dev/service';
import { LoggingMiddleware } from '../../middleware/app-logging';
import { DbMiddleware } from '../../middleware/db-middleware';

export default new Service('menu_roles', { middlewares: [LoggingMiddleware, DbMiddleware] });

