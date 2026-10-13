import type { SearchType } from "dff-util";

export type ProfileAddressDto = {
  id?: string;
  profileId: string;
  addressId: string;
};

export type ProfileAddressSearchDto = SearchType & {
  profileId?: string;
  addressId?: string;
};
