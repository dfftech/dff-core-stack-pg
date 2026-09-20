import type { Pool } from "pg";
import { toViewMapper } from "dff-util";
import { getCorePool, get_tenant_pool, IS_TENANT } from "../../db/db-connection";
import { session_user, tenant_id } from "../../utils/app-util";

/** Session id "System" (case-insensitive) → public access mode. */
export function isPublicSession(): boolean {
  const id = String(session_user()?.id ?? "");
  return id.toLowerCase() === "system";
}

/** Pool that holds query_* definition tables (tenant DB when multi-tenant). */
export async function definitionPool(): Promise<Pool> {
  if (IS_TENANT) {
    const tid = tenant_id();
    if (!tid) throw new Error("TENANT_REQUIRED");
    return get_tenant_pool(tid);
  }
  return getCorePool();
}

/** Pool used to execute the built SQL. */
export async function executionPool(isCore: boolean): Promise<Pool> {
  if (isCore) return getCorePool();
  if (IS_TENANT) {
    const tid = tenant_id();
    if (!tid) throw new Error("TENANT_REQUIRED");
    return get_tenant_pool(tid);
  }
  return getCorePool();
}

/**
 * Replaces {{params.key}} / {params.key} / ${params.key} (optionally quoted)
 * with $1, $2, ... and collects values.
 */
export function buildPgQuery(
  queryString: string,
  params: Record<string, unknown>
): { text?: string; values?: unknown[]; error?: string } {
  const values: unknown[] = [];
  const regex =
    /'?(?:\{\{params\.([a-zA-Z0-9_]+)\}\}|\$\{params\.([a-zA-Z0-9_]+)\}|\{params\.([a-zA-Z0-9_]+)\})'?/g;
  let lastIndex = 0;
  let text = "";

  try {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(queryString)) !== null) {
      const key = match[1] || match[2] || match[3];
      text += queryString.substring(lastIndex, match.index);
      values.push(params[key]);
      text += `$${values.length}`;
      lastIndex = match.index + match[0].length;
    }
    text += queryString.substring(lastIndex);
    return { text, values };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

export function mapRows(rows: Record<string, unknown>[]): unknown[] {
  return rows.map((r) => toViewMapper(r));
}

/** Allow only simple "col ASC|DESC" or "col1 desc, col2 asc" identifiers. */
export function sanitizeOrder(orderBy: string): string {
  const parts = orderBy.split(",").map((p) => p.trim());
  const cleaned: string[] = [];
  for (const part of parts) {
    const m = part.match(/^([a-zA-Z_][a-zA-Z0-9_"]*)\s*(asc|desc)?$/i);
    if (!m) continue;
    cleaned.push(`${m[1]} ${(m[2] || "asc").toUpperCase()}`);
  }
  return cleaned.length ? cleaned.join(", ") : "updated_at DESC";
}
