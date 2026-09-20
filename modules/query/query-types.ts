import type { Query } from "encore.dev/api";

export type LoadQueryRow = {
  id: string;
  query: string;
  params: Record<string, unknown> | null;
  is_core: boolean;
  is_public: boolean;
};

export type ReportQueryRow = {
  id: string;
  type: string;
  display_name: string;
  name: string;
  query: string;
  params: Record<string, unknown> | null;
};

export type ListQueryRow = {
  id: string;
  col: unknown;
  query: string;
  default_order: string;
  default_limit: number;
  params: Record<string, unknown> | null;
};

/** GET /query-load/:id and /query-report/:id */
export type QueryByIdRequest = {
  id: string;
  /** JSON object as string, e.g. {"persona":"admin"} */
  params?: Query<string>;
  /** Convenience query param (merged into params). */
  persona?: Query<string>;
};

/** GET /query-list/:id */
export type QueryListApiRequest = {
  id: string;
  params?: Query<string>;
  persona?: Query<string>;
  limit?: Query<number>;
  skip?: Query<number>;
  orderBy?: Query<string>;
};
