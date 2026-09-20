import type { Pool } from "pg";
import { loadSqlOrder, readSqlFile } from "./order";

function quoteIdent(name: string): string {
  return `"${String(name).replace(/"/g, '""')}"`;
}

/**
 * Tenant URLs often set search_path to a schema that does not exist yet.
 * Postgres then errors: "no schema has been selected to create in".
 * Create the schema (if needed) on a live connection before running scripts.
 */
async function ensureSearchPathSchema(pool: Pool, label: string): Promise<void> {
  const client = await pool.connect();
  try {
    const res = await client.query<{ search_path: string }>("SHOW search_path");
    const raw = String(res.rows[0]?.search_path ?? "public");
    let schema = raw.split(",")[0]?.trim().replace(/^"|"$/g, "") || "public";
    if (schema === "$user") schema = "public";

    const quoted = quoteIdent(schema);
    console.log(`[config-sql] ${label}: ensure schema ${schema}`);
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${quoted}`);
    await client.query(`SET search_path TO ${quoted}`);
  } finally {
    client.release();
  }
}

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

  await ensureSearchPathSchema(pool, label);

  for (const name of order) {
    await runSqlFile(pool, name, label);
  }

  console.log(`[config-sql] ${label}: completed`);
}
