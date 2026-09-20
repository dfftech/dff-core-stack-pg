import { randomUUID } from "node:crypto";
import type { ResponseType } from "../../utils/app-types";
import { logger } from "../../utils/app-util";
import {
  SETTING_S3,
  loadAppSetting,
  settingNumber,
  settingText,
} from "../../utils/app-settings";
import { sssFiles } from "./sss.bucket";
import type { SssUrlRequest } from "./sss.dto";

export default class SssService {
  static UniqueKey(fileName: string, folder: string): string {
    const lastDot = fileName.lastIndexOf(".");
    const name = lastDot !== -1 ? fileName.substring(0, lastDot) : fileName;
    const ext = lastDot !== -1 ? fileName.substring(lastDot) : "";
    const unique = `${name}-${randomUUID()}${ext}`;
    const prefix = folder.replace(/^\/+|\/+$/g, "");
    return prefix ? `${prefix}/${unique}` : unique;
  }

  static async UrlService(input: SssUrlRequest): Promise<ResponseType> {
    const log = logger();
    try {
      const fileName = String(input.fileName || "").trim();
      if (!fileName) return { data: null, error: "INVALID_DATA" };

      const s3 = await loadAppSetting(SETTING_S3);
      const folder = settingText(s3, "folder");
      const baseUrl = settingText(s3, "base_url").replace(/\/+$/, "");
      const ttl = settingNumber(s3, "expires", 3000);
      const key = this.UniqueKey(fileName, folder);
      const signed = await sssFiles.signedUploadUrl(key, { ttl });
      const download = baseUrl ? `${baseUrl}/${key}` : sssFiles.publicUrl(key);
      log.info(`Generated sss url for ${key}`);
      return {
        data: { upload: signed.url, download, key },
        status: "LOADED_SUCCESSFULLY",
      };
    } catch (error) {
      log.error(`Failed to generate sss url: ${error}`);
      throw error;
    }
  }
}
