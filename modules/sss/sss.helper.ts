import { createHash, createHmac } from "node:crypto";

export type S3SignConfig = {
  bucket: string;
  region: string;
  accessKey: string;
  secretKey: string;
  endpoint?: string;
};

function hmac(key: string | Uint8Array, data: string): Uint8Array {
  return Uint8Array.from(createHmac("sha256", key).update(data, "utf8").digest());
}

function sha256Hex(data: string): string {
  return createHash("sha256").update(data, "utf8").digest("hex");
}

function encodePath(key: string): string {
  return key
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function canonicalQuery(params: Record<string, string>): string {
  return Object.keys(params)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");
}

function objectTarget(cfg: S3SignConfig, key: string): { host: string; origin: string; uri: string } {
  const path = encodePath(key);
  const custom = cfg.endpoint && !cfg.endpoint.includes("amazonaws.com");
  if (custom && cfg.endpoint) {
    const url = new URL(cfg.endpoint);
    return {
      host: url.host,
      origin: `${url.protocol}//${url.host}`,
      uri: `/${encodePath(cfg.bucket)}/${path}`,
    };
  }
  const host = `${cfg.bucket}.s3.${cfg.region}.amazonaws.com`;
  return { host, origin: `https://${host}`, uri: `/${path}` };
}

/** Query-string SigV4 PUT/GET URL. No AWS SDK. */
export function SignS3Url(
  method: "PUT" | "GET",
  key: string,
  cfg: S3SignConfig,
  expires: number
): string {
  const iso = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = iso.slice(0, 8);
  const loc = objectTarget(cfg, key);
  const credential = `${cfg.accessKey}/${date}/${cfg.region}/s3/aws4_request`;
  const query = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": credential,
    "X-Amz-Date": iso,
    "X-Amz-Expires": String(expires),
    "X-Amz-SignedHeaders": "host",
  };
  const canonical = [
    method,
    loc.uri,
    canonicalQuery(query),
    `host:${loc.host}\n`,
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");
  const toSign = `AWS4-HMAC-SHA256\n${iso}\n${date}/${cfg.region}/s3/aws4_request\n${sha256Hex(canonical)}`;
  const kSigning = hmac(hmac(hmac(hmac(`AWS4${cfg.secretKey}`, date), cfg.region), "s3"), "aws4_request");
  const signature = createHmac("sha256", kSigning).update(toSign, "utf8").digest("hex");
  return `${loc.origin}${loc.uri}?${canonicalQuery(query)}&X-Amz-Signature=${signature}`;
}

export function PublicS3Url(key: string, cfg: S3SignConfig, baseUrl: string): string {
  if (baseUrl) return `${baseUrl.replace(/\/+$/, "")}/${key}`;
  const loc = objectTarget(cfg, key);
  return `${loc.origin}${loc.uri}`;
}
