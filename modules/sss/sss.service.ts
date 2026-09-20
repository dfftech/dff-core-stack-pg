import { randomUUID } from "node:crypto";
import type { ResponseType } from "../../utils/app-types";
import { logger } from "../../utils/app-util";
import {
  SETTING_S3_PRIVATE,
  SETTING_S3_PUBLIC,
  settingNumber,
  settingText,
} from "../../utils/app-settings";
import AppSettingService from "../app-setting/app-setting.service";
import { sssPrivateFiles, sssPublicFiles } from "./sss.bucket";
import type { SssUrlRequest } from "./sss.dto";
import { PublicS3Url, SignS3Url, type S3SignConfig } from "./sss.helper";

export default class SssService {
  static UniqueKey(fileName: string, folder: string): string {
    const lastDot = fileName.lastIndexOf(".");
    const name = lastDot !== -1 ? fileName.substring(0, lastDot) : fileName;
    const ext = lastDot !== -1 ? fileName.substring(lastDot) : "";
    const unique = `${name}-${randomUUID()}${ext}`;
    const prefix = folder.replace(/^\/+|\/+$/g, "");
    return prefix ? `${prefix}/${unique}` : unique;
  }

  static SettingId(isPrivate: boolean): string {
    return isPrivate ? SETTING_S3_PRIVATE : SETTING_S3_PUBLIC;
  }

  static AwsConfig(s3: Record<string, unknown>): S3SignConfig | null {
    const bucket = settingText(s3, "bucket");
    const accessKey = settingText(s3, "access_key");
    const secretKey = settingText(s3, "secret_key");
    if (!bucket || !accessKey || !secretKey) return null;
    return {
      bucket,
      region: settingText(s3, "region") || "us-east-1",
      accessKey,
      secretKey,
      endpoint: settingText(s3, "endpoint") || undefined,
    };
  }

  static async EncoreUrls(key: string, isPrivate: boolean, baseUrl: string, ttl: number) {
    if (isPrivate) {
      const upload = await sssPrivateFiles.signedUploadUrl(key, { ttl });
      const download = await sssPrivateFiles.signedDownloadUrl(key, { ttl });
      return { upload: upload.url, download: download.url, key, access: "private" as const };
    }
    const upload = await sssPublicFiles.signedUploadUrl(key, { ttl });
    const download = baseUrl ? `${baseUrl}/${key}` : sssPublicFiles.publicUrl(key);
    return { upload: upload.url, download, key, access: "public" as const };
  }

  static AwsUrls(key: string, isPrivate: boolean, cfg: S3SignConfig, baseUrl: string, ttl: number) {
    const upload = SignS3Url("PUT", key, cfg, ttl);
    const download = isPrivate ? SignS3Url("GET", key, cfg, ttl) : PublicS3Url(key, cfg, baseUrl);
    return { upload, download, key, access: isPrivate ? "private" : "public" };
  }

  static async UrlService(input: SssUrlRequest): Promise<ResponseType> {
    const log = logger();
    try {
      const fileName = String(input.fileName || "").trim();
      if (!fileName) return { data: null, error: "INVALID_DATA" };
      const isPrivate = input.private === true;
      const s3 = await AppSettingService.DataByIdService(this.SettingId(isPrivate));
      if (s3.enabled === false) return { data: null, error: "S3_NOT_CONFIGURED" };
      const folder = settingText(s3, "folder");
      const baseUrl = settingText(s3, "base_url").replace(/\/+$/, "");
      const ttl = settingNumber(s3, "expires", 300);
      const key = this.UniqueKey(fileName, folder);
      const aws = this.AwsConfig(s3);
      const data = aws
        ? this.AwsUrls(key, isPrivate, aws, baseUrl, ttl)
        : await this.EncoreUrls(key, isPrivate, baseUrl, ttl);
      log.info(`Generated sss url for ${key}`, { access: data.access });
      return { data, status: "LOADED_SUCCESSFULLY" };
    } catch (error) {
      log.error(`Failed to generate sss url: ${error}`);
      throw error;
    }
  }
}
