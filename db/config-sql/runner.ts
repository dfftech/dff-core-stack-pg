import type { Pool } from "pg";
import { loadSqlOrder, readSqlFile } from "./order";

/**
 * Run one SQL script file against a pool (IF NOT EXISTS / ON CONFLICT DO NOTHING).
 */
async function runSqlFile(pool: Pool, name: string, label: string): Promise<void> {
  const sql = readSqlFile(name);
  if (!sql.trim()) {
    console.log(`[config-sql] ${label}: skip empty ${name}.sql`);
    return;
  }

  console.log(`[config-sql] ${label}: running ${name}.sql`);
  await pool.query(sql);
  console.log(`[config-sql] ${label}: done ${name}.sql`);
}

/**
 * Execute all config-sql scripts in order.yaml against the given pool.
 */
export async function runConfigSqlOnPool(pool: Pool, label: string): Promise<void> {
  const order = loadSqlOrder();
  console.log(`[config-sql] ${label}: start (${order.length} files)`);

  for (const name of order) {
    await runSqlFile(pool, name, label);
  }

  console.log(`[config-sql] ${label}: completed`);
}
