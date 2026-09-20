import { eq } from "drizzle-orm";
import {
  AppCodeByType,
  ConstKeys,
  ConstMessages,
  EncodeBase64,
  JwtEncode,
  toViewMapper,
} from "dff-util";
import type { RequestBodyType, ResponseType, SearchType } from "../../utils/app-types";
import { env, logger, session_user } from "../../utils/app-util";
import ProfileHashService from "../profile-hash/profile-hash.service";
import ProfileService from "../profile/profile.service";
import { profileEntity } from "../profile/profile.entity";
import OtpService from "../otp/otp.service";
import MailService from "../mail/mail.service";
import AppSettingService from "../app-setting/app-setting.service";
import { settingText } from "../../utils/app-settings";
import type {
  AuthProfile,
  ForgotPasswordDto,
  GoogleSigninRequestDto,
  ResetPasswordDto,
  SendOtpDto,
  SigninDto,
  SignupDto,
  VerificationOtpDto,
  VerifyAccountDto,
} from "./auth.dto";
import { AuthProps } from "./auth.dto";
import { authEntity } from "./auth.entity";

const DEFAULT_PIC =
  "https://www.pikpng.com/pngl/m/168-1685824_png-file-transparent-background-person-icon-clipart.png";

export default class AuthService {
  static Db() {
    return ProfileService.Db();
  }

  static EntityService() {
    return authEntity;
  }

  static async EntityByIdService(id: string): Promise<ResponseType> {
    return ProfileService.EntityByIdService(id);
  }

  static async SaveService(dto: SignupDto): Promise<ResponseType> {
    const data = await this.SignupService(dto);
    return { data };
  }

  static async SearchService(input: SearchType): Promise<ResponseType> {
    return ProfileService.SearchService(input);
  }

  static GetIdType(userid: string): "email" | "mobile" | "id" {
    if (userid.includes("@")) return "email";
    if (userid.length > 10 && !isNaN(Number(userid))) return "mobile";
    return "id";
  }

  static async FindProfileByUserid(userid: string): Promise<AuthProfile | null> {
    const idType = this.GetIdType(userid);
    if (idType === "email") return ProfileService.FindByEmailService(userid) as Promise<AuthProfile | null>;
    if (idType === "mobile") return ProfileService.FindByMobileService(userid) as Promise<AuthProfile | null>;
    const res = await ProfileService.EntityByIdService(userid);
    return (res.data as AuthProfile) ?? null;
  }

  static async generateJwtToken(profile: AuthProfile): Promise<string> {
    const log = logger();
    const secret = env("API_JWT_SECRET") || "c79cfbf323c17885fe6962b6d8cc150841fe555d1440642b966cae9df1a76af16cf02db292cab8f2faed884338c8ae2be87f9ddcdf0ea1a5049386af7565b2f3";
    const key = env("API_JWT_KEY") || "X7q#m9$Lp2@zW4v&K1!nB8*jR5%tY6^a";
    if (!secret || secret === "-") throw new Error("JWT configuration not available");
    try {
      return JwtEncode(
        {
          id: profile.id,
          email: profile.email,
          mobile: profile.mobile,
          name: profile.name,
          persona: profile.persona,
          roles: profile.roles,
          key,
        },
        secret
      );
    } catch {
      log.error("Failed to generate JWT token", { userId: profile.id });
      throw new Error("Authentication failed");
    }
  }

  static async SigninService(dto: SigninDto) {
    const log = logger();
    log.info("Signin attempt", { userid: dto.userid, provider: dto.provider });

    if (dto.provider?.toLowerCase() === "google") {
      if (!dto.token?.trim()) throw new Error("Google ID token is required");
      return this.GoogleSignInWithCredential({
        userid: dto.userid,
        token: dto.token,
        persona: dto.persona,
      });
    }

    if (!dto.password?.trim()) throw new Error(ConstMessages.INVALID_CREDENTIALS);

    const profile = await this.FindProfileByUserid(dto.userid);
    if (!profile) throw new Error(AuthProps.USER_NOT_FOUND);
    if (!profile.active) throw new Error(AuthProps.USER_NOT_ACTIVE);

    const ok = await ProfileHashService.VerifyPasswordService(profile.id, dto.password);
    if (!ok) throw new Error(ConstMessages.INVALID_CREDENTIALS);

    const token = await this.generateJwtToken(profile);
    log.info("Signin successful", { userid: dto.userid });
    return toViewMapper({ ...profile, token });
  }

  static async SignupService(dto: SignupDto) {
    const log = logger();
    log.info("Signup attempt", { userid: dto.userid, persona: dto.persona });

    const existing = await this.FindProfileByUserid(dto.userid);
    if (existing?.active) throw new Error(AuthProps.USER_ALREADY_EXISTS);

    const idType = this.GetIdType(dto.userid);
    const profileId = existing?.id || dto.id || AppCodeByType(dto.name);
    const saved = await ProfileService.SaveService({
      id: profileId,
      name: dto.name || existing?.name || "-",
      nameLang: { "en-US": dto.name || "-" },
      email: idType === "email" ? dto.userid : dto.email || existing?.email || "-",
      mobile: idType === "mobile" ? dto.userid : dto.mobile || existing?.mobile || "-",
      telCode: dto.telCode || "-",
      pic: dto.pic || DEFAULT_PIC,
      persona: dto.persona || "user",
      roles: ["user"],
      active: false,
      isEmailVerified: false,
      isMobileVerified: false,
      password: dto.password,
      provider: dto.provider || "password",
    });

    const profile = saved.data as AuthProfile;
    const otpRes = await this.issueOtp(dto.userid, profile.name, {
      lang: dto.lang?.[0],
      templateId: "otp-email",
    });
    log.info("User created", { id: profile.id, otpId: otpRes?.id });
    return {
      message: AuthProps.SIGNUP_SUCCESSFULLY,
      otpId: otpRes?.id,
      uid: dto.userid,
      id: profile.id,
      active: false,
    };
  }

  static async SendAuthMail(
    to: string,
    templateId: string,
    lang: string | undefined,
    data: RequestBodyType
  ) {
    if (this.GetIdType(to) !== "email") return;
    const log = logger();
    try {
      const branding = await AppSettingService.DataByIdService("branding_company");
      const logoUrl = settingText(branding, "logo_url");
      const sent = await MailService.SendService({
        templateId,
        lang: lang || "en-US",
        to,
        data: {
          ...(logoUrl ? { logoUrl } : {}),
          ...data,
        },
      });
      if (sent.error) log.error(`Auth mail not sent (${templateId})`, { to, error: sent.error });
    } catch (error) {
      log.error(`Auth mail failed (${templateId}): ${error}`);
    }
  }

  static async issueOtp(
    uid: string,
    _name?: string,
    options?: { lang?: string; templateId?: string }
  ) {
    const otpRes = await OtpService.CreateOtpService({ uid });
    if (otpRes?.otp) {
      await this.SendAuthMail(uid, options?.templateId || "otp-email", options?.lang, {
        otp: otpRes.otp,
      });
    }
    return otpRes;
  }

  static async ForgotPasswordService(dto: ForgotPasswordDto) {
    const profile = await this.FindProfileByUserid(dto.userid);
    if (!profile) throw new Error(AuthProps.USER_NOT_FOUND);
    const otpRes = await this.issueOtp(dto.userid, profile.name, {
      lang: dto.lang,
      templateId: "otp-email",
    });
    return { otpId: otpRes?.id, uid: dto.userid, message: ConstKeys.EMAIL_SENT };
  }

  static async ResetPasswordService(dto: ResetPasswordDto) {
    const otpRecord = await OtpService.GetOtpService(dto.otpId);
    if (!otpRecord || !otpRecord.is_verified) throw new Error(AuthProps.REVERIFY_OTP);

    const profile = await this.FindProfileByUserid(dto.userid);
    if (!profile) throw new Error(AuthProps.USER_NOT_FOUND);

    await ProfileHashService.SaveService({
      id: profile.id,
      provider: "password",
      password: dto.password,
    });
    await this.SendAuthMail(dto.userid, "reset-password-success", undefined, {});
    return { message: AuthProps.PASSWORD_RESET_SUCCESSFUL };
  }

  static async VerifyAccountService(dto: VerifyAccountDto) {
    const otpRecord = await OtpService.GetOtpService(dto.otpId);
    if (!otpRecord || !otpRecord.is_verified) throw new Error(AuthProps.REVERIFY_OTP);

    const profile = await this.FindProfileByUserid(dto.userid);
    if (!profile) throw new Error(AuthProps.USER_NOT_FOUND);

    const idType = this.GetIdType(dto.userid);
    await ProfileService.SaveService({
      id: profile.id,
      name: profile.name,
      persona: profile.persona,
      email: profile.email,
      mobile: profile.mobile,
      active: true,
      isEmailVerified: idType === "email" ? true : profile.isEmailVerified,
      isMobileVerified: idType === "mobile" ? true : profile.isMobileVerified,
    });
    return { message: "Account verified successfully", verificationType: idType };
  }

  static async VerifyOtpService(dto: VerificationOtpDto) {
    const verifyResult = await OtpService.VerifyOtpService({
      id: dto.otpId,
      uid: dto.uid,
      otp: dto.otp,
    });
    if (!verifyResult.verified) throw new Error(verifyResult.message);

    const profile = await this.FindProfileByUserid(dto.uid);
    if (!profile) throw new Error(AuthProps.USER_NOT_FOUND);

    const idType = this.GetIdType(dto.uid);
    await ProfileService.SaveService({
      id: profile.id,
      name: profile.name,
      persona: profile.persona,
      email: profile.email,
      mobile: profile.mobile,
      active: true,
      isEmailVerified: idType === "email" ? true : profile.isEmailVerified,
      isMobileVerified: idType === "mobile" ? true : profile.isMobileVerified,
    });

    if (dto.navigate) {
      const token = await this.generateJwtToken({ ...profile, active: true });
      return { message: AuthProps.OTP_VERIFIED, uid: dto.uid, otpId: dto.otpId, token, active: true };
    }
    return toViewMapper({ message: AuthProps.OTP_VERIFIED, uid: dto.uid, otpId: dto.otpId, active: true });
  }

  static async SendOtpService(dto: SendOtpDto) {
    const profile = await this.FindProfileByUserid(dto.userid);
    if (!profile) throw new Error(AuthProps.USER_NOT_FOUND);
    const otpRes = await this.issueOtp(dto.userid, profile.name, {
      lang: dto.lang,
      templateId: "otp-email",
    });
    return { message: AuthProps.OTP_SENT, otpId: otpRes?.id, uid: dto.userid };
  }

  static decodeGoogleToken(token: string): { email: string; name?: string; picture?: string } {
    const parts = token.split(".");
    if (parts.length < 2) throw new Error("Invalid Google ID token");
    const json = Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const payload = JSON.parse(json) as { email?: string; name?: string; picture?: string };
    if (!payload.email) throw new Error("Google token missing email");
    return { email: payload.email, name: payload.name, picture: payload.picture };
  }

  static async GoogleSignInWithCredential(dto: GoogleSigninRequestDto) {
    const log = logger();
    let payload: { email: string; name?: string; picture?: string };
    try {
      payload = this.decodeGoogleToken(dto.token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Google sign in failed: ${message}`);
    }
    if (payload.email.toLowerCase() !== dto.userid.toLowerCase()) {
      throw new Error(ConstMessages.INVALID_CREDENTIALS);
    }
    return this.GoogleSigninService({
      email: payload.email,
      name: payload.name || payload.email,
      pic: payload.picture,
      persona: dto.persona || "user",
    });
  }

  static async GoogleSigninService(dto: {
    email: string;
    name: string;
    pic?: string;
    persona: string;
  }) {
    const log = logger();
    let user = await ProfileService.FindByEmailService(dto.email) as AuthProfile | null;
    if (user && !user.active) throw new Error(AuthProps.USER_NOT_ACTIVE);

    if (!user) {
      const saved = await ProfileService.SaveService({
        name: dto.name || dto.email,
        nameLang: { "en-US": dto.name || dto.email },
        email: dto.email,
        mobile: "-",
        telCode: "-",
        pic: dto.pic || DEFAULT_PIC,
        persona: dto.persona,
        roles: ["user"],
        active: true,
        isEmailVerified: true,
        isMobileVerified: false,
        password: EncodeBase64(dto.email),
        provider: "google",
      });
      user = saved.data as AuthProfile;
    }

    const token = await this.generateJwtToken(user);
    log.info("Google signin successful", { email: dto.email });
    return toViewMapper({ ...user, token, provider: "google" });
  }

  static async AccountDeleteService(userid: string) {
    const currentUser = session_user();
    const roles: string[] = currentUser?.roles || [];
    const isAdmin = ["admin", "SUPER_ADMIN", "ADMIN"].some((r) => roles.includes(r));
    if (!isAdmin && currentUser?.id !== userid) throw { message: ConstKeys.UNAUTHORIZED };

    const profile = await this.FindProfileByUserid(userid);
    if (!profile) throw new Error(AuthProps.USER_NOT_FOUND);

    await this.Db()
      .update(profileEntity)
      .set({
        email: `${profile.email}_${profile.id}_deleted`,
        mobile: `${profile.mobile}_${profile.id}_deleted`,
        active: false,
        roles: ["none"],
        updated_at: new Date(),
        updated_by: currentUser?.id ?? "System",
      })
      .where(eq(profileEntity.id, profile.id));

    return { message: ConstKeys.DELETED_SUCCESSFULLY };
  }
}
