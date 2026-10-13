import type { RequestBodyType } from "dff-util";

export type AppSettingDto = {
  id?: string;
  type: string;
  code: string;
  name?: string;
  active?: boolean;
  isPublic?: boolean;
  data?: RequestBodyType;
};
