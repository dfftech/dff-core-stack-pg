export type ProfileHashDto = {
  id: string;
  provider?: string;
  /** Base64-encoded plaintext password — hashed into hash_data / hash_salt. */
  password?: string;
  hashData?: string;
  hashSalt?: string;
  updatedAt?: Date | string;
};
