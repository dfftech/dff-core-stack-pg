export type ProfileDto = {
  id?: string;
  name: string;
  nameLang?: Record<string, string>;
  pic?: string;
  email?: string;
  mobile?: string;
  telCode?: string;
  persona: string;
  isEmailVerified?: boolean;
  isMobileVerified?: boolean;
  roles?: string[];
  active?: boolean;
  /** Optional — stored in profile_hashes, not profiles. */
  password?: string;
  /** Optional — stored in profile_hashes, not profiles. */
  provider?: string;
  updatedAt?: Date | string;
};
