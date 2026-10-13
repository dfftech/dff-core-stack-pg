import type { SearchType } from "dff-util";

export type AddressDto = {
  id?: string;
  address: string;
  area?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  type: string;
  lat?: number;
  lng?: number;
};

export type AddressSearchDto = SearchType & {
  type?: string;
  zipCode?: string;
  area?: string;
  city?: string;
  state?: string;
  country?: string;
};
