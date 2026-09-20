# util-ms port: mail, sss URL, template_files

Port of send-mail, S3 signed upload URL, and templates from `util-ms` into this Encore + Drizzle app.

Out of scope: SMS send and OTP verification CRUD (`/load` is `/query-load` here). OTP **email/sms templates** are seeded.

## Config source: `app_settings`

Do **not** hardcode SMTP/S3 secrets. Mail and sss read:

| Setting id | Used by |
| --- | --- |
| `integration_smtp` | `POST /mail-send` (nodemailer) |
| `integration_s3` | `GET /sss-url` (folder, base_url, expires) |

Fill rows in `app_settings` (query-load `SETTING_SMTP` / `SETTING_S3`). Env `CORE_MAIL_*` is only a fallback if SMTP username/password are empty.

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

Seeded:

- `otp-email` / `en-US` — HTML email
- `otp-sms` / `en-US` — plain text
- `forgot-password` / `en-US`

Add another language by inserting a row with the same `name` and a different `lang` (must exist in `lang`).

```json
{
  "templateId": "otp-email",
  "lang": "en-US",
  "data": {
    "otp": "500827",
    "logoUrl": "https://www.w3.org/Icons/w3c_home.png",
    "messageAbove": "Your one-time password is:",
    "messageBelow": "Do not share this code with anyone. It expires soon."
  },
  "to": "admin@example.com",
  "attachments": ["https://www.w3.org/Icons/w3c_home.png"]
}
```

Passing only `{ "otp": "500827" }` also works (defaults from the en-US template).

## Libraries

| Need | Use |
| --- | --- |
| Handlebars | `CallHbs` from `dff-util` |
| SMTP | nodemailer + `app_settings.integration_smtp` |
| Object URL | Encore `Bucket` + `app_settings.integration_s3` folder/base_url/expires |

## Endpoints

Headers: `Authorization: Bearer <jwt>`, `x-tenant-id: <tenant>` (when multi-tenant).

### template-file

- `POST /template-file-save` `{ id?, name, lang?, channel?, subject?, template, active? }`
- `GET /template-file-search` `limit`, `skip`, `searchTerm`, `lang`, `active`
- `GET /template-file-entity/:id`
- `POST /template-file-render` `{ templateId, lang?, data }`

### mail

`POST /mail-send` `{ templateId, lang?, data, to, subject?, attachments }`

Subject falls back to the template row. SMTP comes from `integration_smtp`.

### sss

`GET /sss-url?fileName=` — signed PUT (ttl from S3 `expires`, default 300) and download URL (`base_url` + key, else Encore `publicUrl`). Key is `{folder}/{name}-{uuid}{ext}`.

## Bruno

`api/template-file/`, `api/mail/`, `api/sss/` using `{{baseUrl}}`, `{{token}}`, `{{xTenantId}}`.
