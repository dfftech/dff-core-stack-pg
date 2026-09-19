import { getCorePool, tenantPools } from "../db-pool";
import { runConfigSqlOnPool } from "./runner";

/**
 * After DB init succeeds:
 * - single-tenant → run config-sql on core pool
 * - multi-tenant  → run config-sql on every tenant pool
 */
export async function runConfigSqlAfterInit(isTenant: boolean): Promise<void> {
  if (!isTenant) {
    await runConfigSqlOnPool(getCorePool(), "core");
    return;
  }

  const ids = Array.from(tenantPools.keys());
  if (ids.length === 0) {
    console.log("[config-sql] multi-tenant: no tenant pools yet, skip");
    return;
  }

  for (const tenantId of ids) {
    const pool = tenantPools.get(tenantId);
    if (!pool) continue;
    await runConfigSqlOnPool(pool, `tenant:${tenantId}`);
  }
}

/**
 * After tenants table change (sync pools first, then re-apply config-sql).
 * Idempotent — safe to re-run (IF NOT EXISTS / ON CONFLICT DO NOTHING).
 */
export async function runConfigSqlOnTenantChange(): Promise<void> {
  const ids = Array.from(tenantPools.keys());
  if (ids.length === 0) {
    console.log("[config-sql] tenant change: no tenant pools, skip");
    return;
  }

  for (const tenantId of ids) {
    const pool = tenantPools.get(tenantId);
    if (!pool) continue;
    await runConfigSqlOnPool(pool, `tenant:${tenantId}`);
  }
}

export { runConfigSqlOnPool } from "./runner";
export { loadSqlOrder } from "./order";
