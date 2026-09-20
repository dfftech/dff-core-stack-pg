import { Service } from "encore.dev/service";
import { LoggingMiddleware } from "../../middleware/app-logging";
import { TenantMiddleware } from "../../middleware/db-middleware";

export default new Service("lang", {
  middlewares: [LoggingMiddleware, TenantMiddleware],
});
