# util-ms port: mail, sss URL, template_files

Port of send-mail, S3 signed upload URL, and templates from `util-ms` into this Encore + Drizzle app.

Out of scope: SMS send and OTP verification CRUD (`/load` is `/query-load` here). OTP **email/sms templates** are seeded.

## Config source: `app_settings`

Do **not** hardcode SMTP/S3 secrets. Mail and sss read:

| Setting id | Used by |
| --- | --- |
| `integration_smtp` | `POST /mail-send` (nodemailer) |
| `integration_s3_public` | `GET /sss-url?fileName=` public upload + download |
| `integration_s3_private` | `GET /sss-url?fileName=&private=true` signed upload + download |

Fill rows in `app_settings` (query-load `SETTING_SMTP` / `SETTING_S3_PUBLIC` / `SETTING_S3_PRIVATE`). Env `CORE_MAIL_*` is only a fallback if SMTP username/password are empty.

SMTP `data`: `enabled`, `service`, `host`, `port`, `username`, `password`, `encryption`, `secure`, `from_email`, `from_name`, `reply_to`.

S3 `data`: `enabled`, `bucket`, `region`, `access_key`, `secret_key`, `endpoint`, `base_url`, `folder`, `expires` (seconds), `acl`.

## Templates (language-based)

Table `template_files`: one row per **name + lang** (`lang.id`, default `en-US`).

| Column | Purpose |
| --- | --- |
| `id` | `{name}_{lang}` e.g. `otp-email_en-US` |
| `name` | Logical id used by APIs e.g. `otp-email` |
| `lang` | Locale e.g. `en-US` |
| `channel` | `email` or `sms` |
| `subject` | Email subject (may include `{{data.otp}}`) |
| `template` | Handlebars source |

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

### template-file

- `POST /template-file-save` `{ id?, name, lang?, channel?, subject?, template, active? }`
- `GET /template-file-search` `limit`, `skip`, `searchTerm`, `lang`, `active`
- `GET /template-file-entity/:id`
- `POST /template-file-render` `{ templateId, lang?, data }`

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

`GET /sss-url?fileName=` — public (`integration_s3_public`). `GET /sss-url?fileName=&private=true` — private (`integration_s3_private`). Public download is `base_url` or Encore `publicUrl`. Private download is a signed GET. Key is `{folder}/{name}-{uuid}{ext}`.

## Bruno

`api/template-file/`, `api/mail/`, `api/sss/` using `{{baseUrl}}`, `{{token}}`, `{{xTenantId}}`.
