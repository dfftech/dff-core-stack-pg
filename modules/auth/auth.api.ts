import { api } from "encore.dev/api";
import type { ResponseType, SearchType } from "../../utils/app-types";
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

export const SaveAuth = api<SignupDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/auth-save",
  },
  async (input: SignupDto) => {
    return await AuthService.SaveService(input);
  }
);

export const SearchAuths = api<SearchType, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/auth-search",
  },
  async (input: SearchType) => {
    return await AuthService.SearchService(input);
  }
);

export const EntityByIdAuth = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/auth-entity/:id",
  },
  async (params: { id: string }) => {
    return await AuthService.EntityByIdService(params.id);
  }
);

export const Signin = api<SigninDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/auth-signin",
  },
  async (body: SigninDto) => {
    const data = await AuthService.SigninService(body);
    return { data };
  }
);

export const Signup = api<SignupDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/auth-signup",
  },
  async (body: SignupDto) => {
    const data = await AuthService.SignupService(body);
    return { data };
  }
);

export const GoogleSignin = api<GoogleSigninRequestDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/auth-google-signin",
  },
  async (body: GoogleSigninRequestDto) => {
    const data = await AuthService.GoogleSignInWithCredential(body);
    return { data };
  }
);

export const ForgotPassword = api<ForgotPasswordDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/auth-forgot-password",
  },
  async (body: ForgotPasswordDto) => {
    const data = await AuthService.ForgotPasswordService(body);
    return { data };
  }
);

export const VerifyOtp = api<VerificationOtpDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/auth-verify-otp",
  },
  async (body: VerificationOtpDto) => {
    const data = await AuthService.VerifyOtpService(body);
    return { data };
  }
);

export const ResetPassword = api<ResetPasswordDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/auth-reset-password",
  },
  async (body: ResetPasswordDto) => {
    const data = await AuthService.ResetPasswordService(body);
    return { data };
  }
);

export const VerifyAccount = api<VerifyAccountDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/auth-verify-account",
  },
  async (body: VerifyAccountDto) => {
    const data = await AuthService.VerifyAccountService(body);
    return { data };
  }
);

export const SendOtp = api<SendOtpDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/auth-send-otp",
  },
  async (body: SendOtpDto) => {
    const data = await AuthService.SendOtpService(body);
    return { data };
  }
);
