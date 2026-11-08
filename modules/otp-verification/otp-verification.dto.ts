export type OtpVerificationDto = {
  id?: string;
  uid: string;
  otp?: string;
  isVerified?: boolean;
};

export type VerifyOtpDto = {
  id: string;
  uid: string;
  otp: string;
};

/** View shape returned by `toViewMapper` for an OTP verification entity. */
export type OtpVerificationView = {
  id: string;
  uid: string;
  otp: string;
  isVerified: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
};
