import type { Query } from "encore.dev/api";

export type SssUrlRequest = {
  fileName: Query<string>;
};
