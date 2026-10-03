import type { Pool } from "pg";
import { toViewMapper } from "dff-util";
import { logger, query_params, session_db, session_user } from "./app-util";
import type { RequestQueryType, SearchType } from "./app-types";

/** Session id "System" (case-insensitive) → public access mode. */
export function isPublicSession(): boolean {
  const id = String(session_user()?.id ?? "");
  return id.toLowerCase() === "system";
}

/** pg Pool for the current request session. Never the core registry DB. */
export function sessionPool(): Pool {
  const db = session_db() as { $client?: Pool } | undefined;
  const pool = db?.$client;
  if (!pool) throw new Error("SESSION_DB_REQUIRED");
  return pool;
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
      values.push(params[key] ?? null);
      text += `$${values.length}::text`;
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

function sqlLiteral(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

/** Replace $1 / $1::text with bound values for readable logs. */
function filledSql(text: string, values: unknown[]): string {
  return text.replace(/\$(\d+)(?:::\w+)?/g, (match, n) => {
    const idx = Number(n) - 1;
    return idx >= 0 && idx < values.length ? sqlLiteral(values[idx]) : match;
  });
}

export async function logSql(
  id: string,
  text: string,
  values: unknown[]
): Promise<void> {
  const log = logger();
  await log?.info?.("Executing query", {
    id,
    query: filledSql(text, values),
  });
}

/** Combine definition defaults with request params; skip empty seed values like {persona:""}. */
export function resolveParams(
  defParams: Record<string, unknown> | null | undefined,
  paramObj: Record<string, string>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(defParams || {})) {
    if (v === null || v === undefined || v === "") continue;
    out[k] = v;
  }
  return { ...out, ...paramObj };
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

const URL_PARAM_SKIP = new Set([
  "limit",
  "skip",
  "orderBy",
  "order",
  "query",
  "params",
  "filters",
]);

function parseParamsJson(raw?: string): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (v === null || v === undefined) continue;
      out[k] = String(v);
    }
    return out;
  } catch {
    return {};
  }
}

/** Query string keys (type, active, persona, …) become {{params.key}} in SQL. */
export function asParams(req: RequestQueryType & SearchType): Record<string, string> {
  const fromUrl = query_params();
  const out: Record<string, string> = {
    ...parseParamsJson(fromUrl.params),
    ...parseParamsJson(fromUrl.filters),
    ...parseParamsJson(fromUrl.query),
    ...parseParamsJson(req.query),
    ...parseParamsJson(req.filters),
  };

  for (const [k, v] of Object.entries(fromUrl)) {
    if (URL_PARAM_SKIP.has(k) || v === "") continue;
    out[k] = v;
  }

  if (req.searchTerm) out.searchTerm = req.searchTerm;
  if (req.active !== undefined) out.active = String(req.active);

  return out;
}
