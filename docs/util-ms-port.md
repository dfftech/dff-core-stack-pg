# util-ms port: mail, sss URL, templates

Port of send-mail, S3 signed upload URL, and templates from `util-ms` into this Encore + Drizzle app.

Out of scope: SMS send and OTP verification CRUD (`/load` is `/query-load` here). OTP **email/sms templates** are seeded.

## Config source: `app_settings`

Do **not** hardcode SMTP/S3 secrets. Mail and sss read:

| Setting id | Used by |
| --- | --- |
| `integration_smtp` | `POST /mail-send` (nodemailer) |
| `integration_s3_public` | `GET /sss-url?fileName=&type=` public upload + download |
| `integration_s3_private` | `GET /sss-url?fileName=&private=true&type=` signed upload + download (`type` mandatory; `provider` from tenant/branch headers → kebab-case folders) |

Fill rows in `app_settings` (query-load `SETTING_SMTP` / `SETTING_S3_PUBLIC` / `SETTING_S3_PRIVATE`). Env `CORE_MAIL_*` is only a fallback if SMTP username/password are empty.

SMTP `data`: `enabled`, `service`, `host`, `port`, `username`, `password`, `encryption`, `secure`, `from_email`, `from_name`, `reply_to`.

S3 `data`: `enabled`, `bucket`, `region`, `access_key`, `secret_key`, `endpoint`, `base_url`, `folder`, `expires` (seconds), `acl`.

## Templates (language-based)

Table `templates`: one row per **name + lang** (`lang.id`, default `en-US`).

| Column | Purpose |
| --- | --- |
| `id` | `{name}_{lang}` e.g. `otp-email_en-US` |
| `name` | Logical id used by APIs e.g. `otp-email` |
| `lang` | Locale e.g. `en-US` |
| `channel` | `email` or `sms` |
| `subject` | Email subject (may include `{{data.otp}}`) |
| `content` | Handlebars source |

Render passes `{ data: <payload> }` into `CallHbs`. Lookup: exact id → `{name}_{lang}` → `{name}_en-US`.

### OTP layout

OTP is **centered**. Optional `messageAbove` / `messageBelow` wrap it (aliases: `smsStartMessage` / `smsEndMessage`). If omitted, the language row supplies default copy.

Seeded email templates (send with `templateId` = **name**, plus `lang`):

| Use | templateId (`name`) | Row id | Data |
| --- | --- | --- | --- |
| Send OTP (signup, send-otp, forgot-password) | `otp-email` | `otp-email_en-US` | `otp`, optional `messageAbove` / `messageBelow` / `logoUrl` |
| Reset password success | `reset-password-success` | `reset-password-success_en-US` | optional `messageAbove` / `messageBelow` / `logoUrl` |
| Send OTP SMS (render only) | `otp-sms` | `otp-sms_en-US` | `otp`, optional above/below |

`POST /mail-send` examples:

```json
{ "templateId": "otp-email", "lang": "en-US", "to": "admin@example.com", "data": { "otp": "500827", "logoUrl": "https://www.w3.org/Icons/w3c_home.png" }, "attachments": ["https://www.w3.org/Icons/w3c_home.png"] }
```

```json
{ "templateId": "reset-password-success", "lang": "en-US", "to": "admin@example.com", "data": {} }
```

Passing only `{ "otp": "500827" }` works for OTP mails (defaults from the en-US template).

## Libraries

| Need | Use |
| --- | --- |
| Handlebars | `CallHbs` from `dff-util` |
| SMTP | nodemailer + `app_settings.integration_smtp` |
| Object URL | Encore `Bucket` (or AWS SigV4 when `access_key`/`bucket` are set) + `integration_s3_public` / `integration_s3_private` |

## Endpoints

Headers: `Authorization: Bearer <jwt>`, `x-tenant-id: <tenant>` (when multi-tenant).

### template

- `POST /template-save` `{ id?, name, lang?, channel?, subject?, template, active? }`
- `POST /template-search` body `{ limit, skip, searchTerm, lang, active }`
- `GET /template-entity/:id`
- `POST /template-render` `{ templateId, lang?, data }`

### mail

`POST /mail-send` `{ templateId, lang?, data, to, subject?, attachments }`. Subject falls back to the template row. SMTP comes from `integration_smtp`.

The **auth** module sends mail when `userid` is an email:

| Auth API | When | templateId |
| --- | --- | --- |
| `POST /auth-signup` | New account — send OTP to verify | `otp-email` |
| `POST /auth-send-otp` | Resend OTP (login / verify) | `otp-email` |
| `POST /auth-forgot-password` | User forgot password — same send-OTP mail, then verify OTP and reset | `otp-email` |
| `POST /auth-reset-password` | After OTP is verified — new password saved | `reset-password-success` |

### sss

Module: `modules/sss` (`sss.api.ts` / `sss.service.ts` / `sss.helper.ts` / `sss.bucket.ts` / `sss.dto.ts`).

- `GET /sss-url?fileName=&type=&private=` — `SssUrl` API → `SssService.UrlService`. `fileName` and `type` are **mandatory**; `private` is optional (default `false`).

**provider** is *not* a query param. `SssService.Provider()` builds it as `{tenant}-{branch}` from the `x-tenant-id` / `x-branch-id` headers (`tenant_id()` / `branch_id()` in `utils/app-util`); each part falls back to `admin` when the header is missing — e.g. no headers → `admin-admin`.

`GET /sss-url?fileName=&type=` — public (`integration_s3_public`). `GET /sss-url?fileName=&private=true&type=Profile Photos` — private (`integration_s3_private`); `provider` and `type` are converted with `toKebabCase` (dff-util) and added as folders. Public/private is decided only by `private`. Public download is `base_url` or Encore `publicUrl`. Private download is a signed GET. Key is `{setting folder}/{kebab-provider}/{kebab-type}/{name}-{uuid}{ext}`. Response `data`: `{ upload, download, key, access, provider, type }` — pass `provider`/`type` straight to `POST /upload-file-save`.

### upload-file

Module: `modules/upload-file` (`upload-file.api.ts` / `upload-file.service.ts` / `upload-file.entity.ts` / `upload-file.dto.ts`). Table `upload_files`.

FE flow: `GET /sss-url` (`type` mandatory) → PUT bytes to `data.upload` → `POST /upload-file-save` with the public `data.download` as `url` and the `data.provider` / `data.type` returned by sss.

- `POST /upload-file-save` `{ id?, name, url, status?, type, provider, active? }` — `type` and `provider` are **mandatory**. `id` defaults to `${provider}-${type}-${name}-${random}` (built via `UploadFileService.BuildId` / dff-util `AppRandomString`) when omitted.
- `GET /upload-file-entity/:id`
- `POST /upload-file-search` body `{ provider?, type?, status?, active?, limit, skip }`
- `POST /upload-file-status` `{ id, status }`
- `POST /upload-file-delete` `{ id }`

## REST Client

Requests are in `docs/rest/template.rest`, `docs/rest/mail.rest`, `docs/rest/sss.rest` and `docs/rest/upload-file.rest` using `{{hosturl}}`, `{{authToken}}` and `{{xTenantId}}`.
