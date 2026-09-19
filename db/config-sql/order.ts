import { readFileSync } from "node:fs";
import { join } from "node:path";

const CONFIG_SQL_DIR = join(process.cwd(), "config-sql");

/**
 * Read config-sql/order.yaml — simple list of `- name` entries.
 */
export function loadSqlOrder(): string[] {
  const raw = readFileSync(join(CONFIG_SQL_DIR, "order.yaml"), "utf8");
  const names: string[] = [];

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^-\s+(.+)$/);
    if (match) names.push(match[1].trim());
  }

  if (names.length === 0) {
    throw new Error("[config-sql] order.yaml has no entries");
  }

  return names;
}

/** Absolute path to a sql file from order name (without .sql). */
export function sqlFilePath(name: string): string {
  return join(CONFIG_SQL_DIR, `${name}.sql`);
}

export function readSqlFile(name: string): string {
  const path = sqlFilePath(name);
  try {
    return readFileSync(path, "utf8");
  } catch (err) {
    throw new Error(`[config-sql] missing file: ${path}`);
  }
}
