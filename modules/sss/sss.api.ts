import { api } from "encore.dev/api";
import type { ResponseType } from "../../utils/app-types";
import type { SssUrlRequest } from "./sss.dto";
import SssService from "./sss.service";

export const SssUrl = api<SssUrlRequest, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/sss-url",
  },
  async (input) => {
    return SssService.UrlService(input);
  }
);
