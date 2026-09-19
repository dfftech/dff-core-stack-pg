import { Service } from "encore.dev/service";
import { init_tenants_db, IS_TENANT } from "../../db/db-connection";
import { runConfigSqlAfterInit } from "../../db/config-sql";

import { LoggingMiddleware } from "../../middleware/app-logging";
import { TenantMiddleware } from "../../middleware/db-middleware";

// Load-time: connect DB, then run config-sql in order.yaml
init_tenants_db()
  .then(async () => {
    console.log(":---------DB initialization completed---------:");
    await runConfigSqlAfterInit(IS_TENANT);
    console.log(":---------config-sql completed---------:");
  })
  .catch((err) => console.error(":---------DB initialization failed---------:", err));

export default new Service("health", {
  middlewares: [LoggingMiddleware, TenantMiddleware],
});
