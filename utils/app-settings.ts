import type { Pool } from "pg";
import { session_db } from "./app-util";

export const SETTING_SMTP = "integration_smtp";
export const SETTING_S3 = "integration_s3";

/** Load `app_settings.data` by id (e.g. integration_smtp, integration_s3). */
export async function loadAppSetting(id: string): Promise<Record<string, unknown>> {
  const db = session_db() as { $client?: Pool } | undefined;
  const pool = db?.$client;
  if (!pool) throw new Error("SESSION_DB_REQUIRED");
  const res = await pool.query<{ data: unknown }>(
    `SELECT data FROM app_settings WHERE id = $1 AND active = true LIMIT 1`,
    [id]
  );
  const data = res.rows[0]?.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  return {};
}

export function settingText(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  return value == null ? "" : String(value).trim();
}

export function settingNumber(
  data: Record<string, unknown>,
  key: string,
  fallback: number
): number {
  const n = Number(data[key]);
  return Number.isFinite(n) ? n : fallback;
}
