import { api } from "encore.dev/api";
import type { ResponseType } from "dff-util";
import type { SssUrlRequest } from "./sss.dto";
import SssService from "./sss.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

export const SssUrl = api<SssUrlRequest, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/sss-url",
  },
  async (input) => {
    try {
      const data = await SssService.UrlService(input);
      return { data, status: "LOADED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to sss url: ${error}`);
      throw error;
    }
  }
);
