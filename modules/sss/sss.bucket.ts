import { Bucket } from "encore.dev/storage/objects";

export const sssFiles = new Bucket("sss-files", {
  public: true,
  versioned: false,
});
