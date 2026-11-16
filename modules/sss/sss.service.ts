import { toKebabCase } from 'dff-util';
import { randomUUID } from 'node:crypto';
import { AppError } from '../../utils/app-error';
import { SETTING_S3_PRIVATE, SETTING_S3_PUBLIC, settingNumber, settingText } from '../../utils/app-settings';
import { branch_id, env, logger, tenant_id } from '../../utils/app-util';
import AppSettingService from '../app-setting/app-setting.service';
import { sssPrivateFiles, sssPublicFiles } from './sss.bucket';
import type { SssUrlRequest } from './sss.dto';
import { PublicS3Url, SignS3Url, type S3SignConfig } from './sss.helper';

const DEFAULT_PROVIDER = 'admin';

export default class SssService {
  static UniqueKey(fileName: string, folder: string): string {
    const lastDot = fileName.lastIndexOf('.');
    const name = lastDot !== -1 ? fileName.substring(0, lastDot) : fileName;
    const ext = lastDot !== -1 ? fileName.substring(lastDot) : '';
    const unique = `${name}-${randomUUID()}${ext}`;
    const prefix = folder.replace(/^\/+|\/+$/g, '');
    return prefix ? `${prefix}/${unique}` : unique;
  }

  static SettingId(isPrivate: boolean): string {
    return isPrivate ? SETTING_S3_PRIVATE : SETTING_S3_PUBLIC;
  }

  static Provider(): string {
    const branch = String(branch_id() || '').trim();
    if (branch) return branch;
    const tenant = String(tenant_id() || '').trim();
    if (tenant) return tenant;
    return DEFAULT_PROVIDER;
  }

  /** Env prefix per access level: S3_PUBLIC_* or S3_PRIVATE_*. */
  static EnvScope(isPrivate: boolean): string {
    return isPrivate ? 'S3_PRIVATE' : 'S3_PUBLIC';
  }

  static AwsConfig(s3: Record<string, unknown>, isPrivate: boolean): S3SignConfig | null {
    const scope = this.EnvScope(isPrivate);
    const bucket = settingText(s3, 'bucket') || env(`${scope}_BUCKET`) || '';
    const accessKey = settingText(s3, 'access_key') || env('S3_ACCESS_KEY') || '';
    const secretKey = settingText(s3, 'secret_key') || env('S3_SECRET_KEY') || '';
    if (!bucket || !accessKey || !secretKey) return null;
    return {
      bucket,
      region: settingText(s3, 'region') || env('S3_REGION') || 'us-east-1',
      accessKey,
      secretKey,
      endpoint: settingText(s3, 'endpoint') || env('S3_ENDPOINT') || undefined,
    };
  }

  static async EncoreUrls(key: string, isPrivate: boolean, baseUrl: string, ttl: number) {
    if (isPrivate) {
      const upload = await sssPrivateFiles.signedUploadUrl(key, { ttl });
      const download = await sssPrivateFiles.signedDownloadUrl(key, { ttl });
      return { upload: upload.url, download: download.url, key, access: 'private' as const };
    }
    const upload = await sssPublicFiles.signedUploadUrl(key, { ttl });
    const download = baseUrl ? `${baseUrl}/${key}` : sssPublicFiles.publicUrl(key);
    return { upload: upload.url, download, key, access: 'public' as const };
  }

  static AwsUrls(key: string, isPrivate: boolean, cfg: S3SignConfig, baseUrl: string, ttl: number) {
    const upload = SignS3Url('PUT', key, cfg, ttl);
    const download = isPrivate ? SignS3Url('GET', key, cfg, ttl) : PublicS3Url(key, cfg, baseUrl);
    return { upload, download, key, access: isPrivate ? 'private' : 'public' };
  }

  /** Root folder from setting or env; the value `<tenant>` becomes the request's tenant id. */
  static RootFolder(s3: Record<string, unknown>): string {
    const folder = settingText(s3, 'folder') || env('S3_FOLDER') || '';
    return folder === '<tenant>' ? String(tenant_id() || '').trim() : folder;
  }

  static async UrlService(input: SssUrlRequest) {
    const log = logger();
    try {
      const fileName = String(input.fileName || '').trim();
      if (!fileName) throw new AppError('INVALID_DATA');
      const type = String(input.type ?? '').trim();
      if (!type) throw new AppError('INVALID_TYPE');
      const provider = this.Provider();
      const providerFolder = toKebabCase(provider);
      const typeFolder = toKebabCase(type);
      const isPrivate = input.private === true;
      const s3 = await AppSettingService.DataByIdService(this.SettingId(isPrivate));
      if (s3.enabled === false) throw new AppError('S3_NOT_CONFIGURED');
      const folder = [this.RootFolder(s3), providerFolder, typeFolder]
        .map((p) => p.replace(/^\/+|\/+$/g, ''))
        .filter(Boolean)
        .join('/');
      const baseUrl = (settingText(s3, 'base_url') || env('S3_BASE_URL') || '').replace(/\/+$/, '');
      const ttl = settingNumber(s3, 'expires', Number(env('S3_EXPIRES')) || 300);
      const key = this.UniqueKey(fileName, folder);
      const aws = this.AwsConfig(s3, isPrivate);
      const data = aws
        ? this.AwsUrls(key, isPrivate, aws, baseUrl, ttl)
        : await this.EncoreUrls(key, isPrivate, baseUrl, ttl);
      log.info(`Generated sss url for ${key}`, { access: data.access, provider, type });
      return { ...data, provider, type };
    } catch (error) {
      log.error(`Failed to generate sss url: ${error}`);
      throw error;
    }
  }
}
