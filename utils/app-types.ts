import type { Query } from "encore.dev/api";

export type RequestQueryType = {
  id?: string;
  query?: Query<string>;
};

export type PubSubEventType = {
  name: string;
  raw: string | null;
};

export type PageType<T> = {
  data: T[];
  total: number;
  skip: number;
  limit: number;
};
