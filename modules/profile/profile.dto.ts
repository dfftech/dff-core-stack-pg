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

/** Search profiles (not archived) whose `roles` array contains roleId. Returns all matches, no pagination. */
export type ProfileRoleSearchDto = {
  roleId: string;
};

/** Add or remove a single role id from a profile's `roles` array. */
export type ProfileRoleDto = {
  profileId: string;
  roleId: string;
};
