import { Service } from "encore.dev/service";
import { LoggingMiddleware } from "../../middleware/app-logging";

export default new Service("jwt", {
  middlewares: [LoggingMiddleware],
});
