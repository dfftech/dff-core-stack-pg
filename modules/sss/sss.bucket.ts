import { Bucket } from "encore.dev/storage/objects";

export const sssPublicFiles = new Bucket("sss-files", {
  public: true,
  versioned: false,
});

export const sssPrivateFiles = new Bucket("sss-files-private", {
  public: false,
  versioned: false,
});
