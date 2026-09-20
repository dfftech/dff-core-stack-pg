export type LoadQueryRow = {
  id: string;
  query: string;
  params: Record<string, unknown> | null;
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
