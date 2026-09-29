import type { SearchType } from "../../utils/app-types";

export type ProfileAddressDto = {
  id?: string;
  profileId: string;
  addressId: string;
};

export type ProfileAddressSearchDto = SearchType & {
  profileId?: string;
  addressId?: string;
};
