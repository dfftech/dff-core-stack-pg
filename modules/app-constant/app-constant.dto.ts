import type { RequestBodyType } from "dff-util";

export type AppConstantDto = {
  id?: string;
  type: string;
  code: string;
  name?: string;
  active?: boolean;
  data?: RequestBodyType;
};
