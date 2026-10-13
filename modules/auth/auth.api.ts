import { api } from "encore.dev/api";
import type { ResponseType, SearchType } from "dff-util";
import type {
  ForgotPasswordDto,
  GoogleSigninRequestDto,
  ResetPasswordDto,
  SendOtpDto,
  SigninDto,
  SignupDto,
  VerificationOtpDto,
  VerifyAccountDto,
} from "./auth.dto";
import AuthService from "./auth.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

export const SaveAuth = api<SignupDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/auth-save",
  },
  async (input: SignupDto) => {
    try {
      const data = await AuthService.SaveService(input);
      return { data, status: "SAVED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to save auth: ${error}`);
      throw error;
    }
  }
);

export const SearchAuths = api<SearchType, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/auth-search",
  },
  async (input: SearchType) => {
    try {
      const page = await AuthService.SearchService(input);
      return { ...page, status: "LISTED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to search auths: ${error}`);
      throw error;
    }
  }
);

export const EntityByIdAuth = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/auth-entity/:id",
  },
  async (params: { id: string }) => {
    try {
      const data = await AuthService.EntityByIdService(params.id);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to entity by id auth: ${error}`);
      throw error;
    }
  }
);

export const Signin = api<SigninDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/auth-signin",
  },
  async (body: SigninDto) => {
    try {
      const data = await AuthService.SigninService(body);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to signin: ${error}`);
      throw error;
    }
  }
);

export const Signup = api<SignupDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/auth-signup",
  },
  async (body: SignupDto) => {
    try {
      const data = await AuthService.SignupService(body);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to signup: ${error}`);
      throw error;
    }
  }
);

export const GoogleSignin = api<GoogleSigninRequestDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/auth-google-signin",
  },
  async (body: GoogleSigninRequestDto) => {
    try {
      const data = await AuthService.GoogleSignInWithCredential(body);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to google signin: ${error}`);
      throw error;
    }
  }
);

export const ForgotPassword = api<ForgotPasswordDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/auth-forgot-password",
  },
  async (body: ForgotPasswordDto) => {
    try {
      const data = await AuthService.ForgotPasswordService(body);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to forgot password: ${error}`);
      throw error;
    }
  }
);

export const VerifyOtp = api<VerificationOtpDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/auth-verify-otp",
  },
  async (body: VerificationOtpDto) => {
    try {
      const data = await AuthService.VerifyOtpService(body);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to verify otp: ${error}`);
      throw error;
    }
  }
);

export const ResetPassword = api<ResetPasswordDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/auth-reset-password",
  },
  async (body: ResetPasswordDto) => {
    try {
      const data = await AuthService.ResetPasswordService(body);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to reset password: ${error}`);
      throw error;
    }
  }
);

export const VerifyAccount = api<VerifyAccountDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/auth-verify-account",
  },
  async (body: VerifyAccountDto) => {
    try {
      const data = await AuthService.VerifyAccountService(body);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to verify account: ${error}`);
      throw error;
    }
  }
);

export const SendOtp = api<SendOtpDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/auth-send-otp",
  },
  async (body: SendOtpDto) => {
    try {
      const data = await AuthService.SendOtpService(body);
      return { data };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to send otp: ${error}`);
      throw error;
    }
  }
);
