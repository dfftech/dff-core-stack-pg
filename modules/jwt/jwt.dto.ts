import type { SessionInfo } from 'dff-util';

export type GenerateTokenRequest = Pick<SessionInfo, 'id' | 'roles'> &
  Partial<Omit<SessionInfo, 'id' | 'roles' | 'key' | 'createdAt'>> & {
    /** Token lifetime in seconds. Defaults to `API_JWT_EXPIRES_IN` env (900s) when unset. */
    expiresIn?: number;
  };

export type GenerateTokenResponse = {
  token: string;
  /** ISO timestamp of the server clock when this response was generated. */
  currentTime: string;
  /** ISO timestamp when the session was created. */
  createdAt: string;
  /** ISO timestamp when this token expires. */
  expiresAt: string;
  /** ISO timestamp when the session exceeds the max allowed age (`API_JWT_MAX_EXPIRES_IN`) and can no longer be regenerated. */
  regenerationExpiresAt: string;
};

export type VerifyTokenRequest = {
  token: string;
};

export type VerifyTokenResponse = {
  valid: boolean;
  session: SessionInfo | null;
  /** ISO timestamp of the server clock when this response was generated. */
  currentTime: string;
  /** ISO timestamp when the session was created, if decodable. */
  createdAt?: string;
  /** ISO timestamp when this token expires, if valid. */
  expiresAt?: string;
  /** ISO timestamp when the session exceeds the max allowed age (`API_JWT_MAX_EXPIRES_IN`), if valid. */
  regenerationExpiresAt?: string;
};

export type RegenerateTokenResponse = {
  token: string;
  /** ISO timestamp of the server clock when this response was generated. */
  currentTime: string;
  /** ISO timestamp when the session was created. */
  createdAt: string;
  /** ISO timestamp when this token expires. */
  expiresAt: string;
  /** ISO timestamp when the session exceeds the max allowed age (`API_JWT_MAX_EXPIRES_IN`) and can no longer be regenerated. */
  regenerationExpiresAt: string;
};
