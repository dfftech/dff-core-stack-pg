import type { RequestBodyType } from "../../utils/app-types";

export type AppSettingDto = {
  id?: string;
  type: string;
  code: string;
  name?: string;
  active?: boolean;
  isPublic?: boolean;
  data?: RequestBodyType;
};
