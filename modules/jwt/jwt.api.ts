import type { ResponseType } from "dff-util";
import { api } from "encore.dev/api";
import { AppError } from "../../utils/app-error";
import { logger, token } from "../../utils/app-util";
import type {
  GenerateTokenRequest,
  GenerateTokenResponse,
  RegenerateTokenResponse,
  VerifyTokenRequest,
  VerifyTokenResponse,
} from "./jwt.dto";
import JwtService from "./jwt.service";

export const GenerateToken = api<GenerateTokenRequest, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/jwt-generate",
  },
  async (input) => {
    try {
      const expiresIn = input.expiresIn ?? JwtService.ExpiresIn();
      const token = JwtService.GenerateToken(input, expiresIn);
      const createdAt = new Date().toISOString();
      const data: GenerateTokenResponse = {
        token,
        currentTime: new Date().toISOString(),
        createdAt,
        expiresAt: JwtService.ExpiresAt(expiresIn),
        regenerationExpiresAt: JwtService.MaxExpiresAt(createdAt),
      };
      return { data, status: "LOADED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to generate jwt token: ${error}`);
      throw error;
    }
  }
);

export const VerifyToken = api<VerifyTokenRequest, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/jwt-verify",
  },
  async (input) => {
    try {
      let data: VerifyTokenResponse;
      try {
        const session = JwtService.VerifyToken(input.token);
        data = {
          valid: true,
          session,
          currentTime: new Date().toISOString(),
          createdAt: session.createdAt,
          expiresAt: session.exp ? new Date(session.exp * 1000).toISOString() : undefined,
          regenerationExpiresAt: JwtService.MaxExpiresAt(session.createdAt),
        };
      } catch {
        // Signature/claims may still be decodable even though verification
        // failed (e.g. expired token or max session age exceeded). Surface
        // the expiry info when possible instead of just `null`/`false`.
        let createdAt: string | undefined;
        let expiresAt: string | undefined;
        let regenerationExpiresAt: string | undefined;
        try {
          const session = JwtService.DecodeToken(input.token);
          createdAt = session.createdAt;
          expiresAt = session.exp ? new Date(session.exp * 1000).toISOString() : undefined;
          regenerationExpiresAt = session.createdAt ? JwtService.MaxExpiresAt(session.createdAt) : undefined;
        } catch {
          // Token is malformed and cannot be decoded at all.
        }
        data = { valid: false, session: null, currentTime: new Date().toISOString(), createdAt, expiresAt, regenerationExpiresAt };
      }
      return { data, status: "LOADED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to verify jwt token: ${error}`);
      throw error;
    }
  }
);

export const RegenerateToken = api<void, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/jwt-regenerate",
  },
  async () => {
    try {
      const jwtToken = token();
      const newToken = JwtService.RegenerateToken(jwtToken);
      const session = JwtService.DecodeToken(newToken);
      const expiresIn = JwtService.ExpiresIn();
      const data: RegenerateTokenResponse = {
        token: newToken,
        currentTime: new Date().toISOString(),
        createdAt: session.createdAt,
        expiresAt: JwtService.ExpiresAt(expiresIn),
        regenerationExpiresAt: JwtService.MaxExpiresAt(session.createdAt),
      };
      return { data, status: "LOADED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to regenerate jwt token: ${error}`);
      throw error;
    }
  }
);
