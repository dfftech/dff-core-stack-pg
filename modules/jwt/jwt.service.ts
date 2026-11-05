import { JwtDecode, JwtEncode, JwtValid, JwtVerify, type SessionInfo } from 'dff-util';
import { env, tenant_id } from '../../utils/app-util';

const DEFAULT_EXPIRES_IN = 900;
const DEFAULT_MAX_EXPIRES_IN = 36000;

export default class JwtService {
  /**
   * Resolve the configured JWT secret from env (`API_JWT_SECRET`).
   * Throws if not configured.
   */
  static Secret(): string {
    const secret = env('API_JWT_SECRET') || 'API_JWT_SECRET';
    if (!secret || secret === '-') throw new Error('JWT configuration not available');
    return secret;
  }

  /**
   * Resolve the configured JWT key from env (`API_JWT_KEY`), with the same
   * fallback used across the codebase when unset.
   */
  static Key(): string {
    return env('API_JWT_KEY') || 'API_JWT_KEY';
  }

  /**
   * Resolve the configured token expiresIn in seconds (`API_JWT_EXPIRES_IN`),
   * defaults to 900 seconds when unset.
   */
  static ExpiresIn(): number {
    const value = Number(env('API_JWT_EXPIRES_IN'));
    return value > 0 ? value : DEFAULT_EXPIRES_IN;
  }

  /**
   * Resolve the configured max token age in seconds (`API_JWT_MAX_EXPIRES_IN`),
   * defaults to 36000 seconds when unset.
   */
  static MaxExpiresIn(): number {
    const value = Number(env('API_JWT_MAX_EXPIRES_IN'));
    return value > 0 ? value : DEFAULT_MAX_EXPIRES_IN;
  }

  /**
   * Build a SessionInfo payload from partial session fields, filling in
   * `key` and `createdAt` automatically.
   */
  static BuildSession(session: Partial<SessionInfo> & Pick<SessionInfo, 'id' | 'roles'>): SessionInfo {
    return {
      key: this.Key(),
      createdAt: session.createdAt ||  new Date().toISOString(),
      tenant: tenant_id(),
      ...session,
    };
  }

  /**
   * Generate a signed JWT token for the given session, expiresIn in seconds
   * (defaults to `API_JWT_EXPIRES_IN` env, or 900 seconds when unset).
   */
  static GenerateToken(session: Partial<SessionInfo> & Pick<SessionInfo, 'id' | 'roles'>, expiresIn?: number): string {
    return JwtEncode(this.BuildSession(session), this.Secret(), expiresIn ?? this.ExpiresIn());
  }

  /**
   * Verify a JWT token's signature against the configured secret, and ensure
   * it is not older than the configured max age (`API_JWT_MAX_EXPIRES_IN`,
   * defaults to 36000 seconds). Throws if `createdAt` is missing or the
   * session has exceeded the max age.
   */
  static VerifyToken(token: string): SessionInfo {
    const session = JwtVerify(token, this.Secret()) as SessionInfo;
    if (!session.createdAt) throw new Error('Invalid session: createdAt is missing');
    const createdAt = new Date(session.createdAt).getTime();
    if (Number.isNaN(createdAt)) throw new Error('Invalid session: createdAt is malformed');
    const expiresAt = createdAt + this.MaxExpiresIn() * 1000;
    if (Date.now() > expiresAt) throw new Error('Session expired: exceeded max token age');
    return session;
  }

  /** Decode a JWT token without verifying its signature. */
  static DecodeToken(token: string): SessionInfo {
    return JwtDecode(token) as SessionInfo;
  }

  /** Check whether a JWT token is expired or otherwise invalid. */
  static IsValid(token: string): boolean {
    return JwtValid(token);
  }

  /**
   * Compute the ISO timestamp a token signed just now (or at `createdAt`)
   * will expire at, given `expiresIn` seconds.
   */
  static ExpiresAt(expiresIn: number, createdAt?: string): string {
    const base = createdAt ? new Date(createdAt).getTime() : Date.now();
    return new Date(base + expiresIn * 1000).toISOString();
  }

  /**
   * Compute the ISO timestamp a session is no longer eligible for
   * regeneration (`createdAt` + `API_JWT_MAX_EXPIRES_IN`).
   */
  static MaxExpiresAt(createdAt: string): string {
    return new Date(new Date(createdAt).getTime() + this.MaxExpiresIn() * 1000).toISOString();
  }

  /**
   * Regenerate a token for an expired (or still valid) session. Decodes the
   * given token (ignoring its `exp`, since it may already have expired) and
   * checks the session is still within the max age (`MaxExpiresIn`). If so,
   * issues a fresh token with the original `createdAt` preserved; otherwise
   * throws.
   */
  static RegenerateToken(token: string, expiresIn?: number): string {
    const session = this.DecodeToken(token);
    if (!session.createdAt) throw new Error('Invalid session: createdAt is missing');
    const createdAt = new Date(session.createdAt).getTime();
    if (Number.isNaN(createdAt)) throw new Error('Invalid session: createdAt is malformed');
    const expiresAt = createdAt + this.MaxExpiresIn() * 1000;
    if (Date.now() > expiresAt) throw new Error('Session expired: exceeded max token age');
    return this.GenerateToken(session, expiresIn);
  }
}
