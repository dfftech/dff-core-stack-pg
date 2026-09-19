import type { Query } from "encore.dev/api";

export type PubSubEventType = {
    name: string;
    raw: string | null;
}

export type RequestQueryType = {
  id?: string;
  query?: Query<string>;
};

export type ResponseType = {
  status?: string | number;
  data?: any;
  error?: any;
  total?: number;
  skip?: number;
  limit?: number;
  meta?: {
    requestId?: string | number;
    timestamp?: string | number;
    duration?: number;
  };
}

export type SearchType = {
  limit?: number;
  skip?: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
  searchTerm?: string;
  active?: boolean;
  filters?: string;
};

export type KeyValueType = {
  [key: string]: any;
}

export type JsonValueType = string | number | boolean | null | JsonValueType[] | { [key: string]: JsonValueType };
export type RequestBodyType = Record<string, JsonValueType>;
export type RequestByIdType = {
  id: string;
};
