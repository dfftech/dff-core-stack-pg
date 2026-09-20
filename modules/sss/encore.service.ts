import { Service } from "encore.dev/service";
import { LoggingMiddleware } from "../../middleware/app-logging";
import { TenantMiddleware } from "../../middleware/db-middleware";
import "./sss.bucket";

export default new Service("sss", {
  middlewares: [LoggingMiddleware, TenantMiddleware],
});
