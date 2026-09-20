export type SigninDto = {
  userid: string;
  password?: string;
  provider: string;
  persona?: string;
  token?: string;
};

export type SignupDto = {
  id?: string;
  userid: string;
  password: string;
  name: string;
  lang?: string[];
  persona: string;
  provider: string;
  email?: string;
  mobile?: string;
  telCode?: string;
  pic?: string;
};

export type ForgotPasswordDto = {
  userid: string;
  lang?: string;
};

export type ResetPasswordDto = {
  userid: string;
  otpId: string;
  password: string;
};

export type VerificationOtpDto = {
  otp: string;
  otpId: string;
  uid: string;
  navigate?: boolean;
};

export type VerifyAccountDto = {
  userid: string;
  otpId: string;
};

export type SendOtpDto = {
  userid: string;
  lang?: string;
};

export type GoogleSigninRequestDto = {
  userid: string;
  token: string;
  persona?: string;
};

export type AuthProfile = {
  id: string;
  name: string;
  nameLang?: Record<string, string>;
  email: string;
  mobile: string;
  persona: string;
  roles: string[];
  active: boolean;
  pic?: string;
  telCode?: string;
  isEmailVerified?: boolean;
  isMobileVerified?: boolean;
  provider?: string;
};

export const AuthProps = {
  SIGNUP_SUCCESSFULLY:
    "User created successfully. Please verify the OTP to activate your account.",
  USER_ALREADY_EXISTS: "User already exists.",
  USER_NOT_FOUND: "User not found",
  USER_NOT_ACTIVE: "User not active.",
  OTP_SENT: "OTP sent successfully.",
  OTP_VERIFIED: "OTP verified successfully.",
  PASSWORD_RESET_SUCCESSFUL: "Password reset successful.",
  REVERIFY_OTP: "Please reverify OTP.",
};
