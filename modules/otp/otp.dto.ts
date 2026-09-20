export type OtpDto = {
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
