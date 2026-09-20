# dff-core-stack-pg

Encore.ts + Drizzle (PostgreSQL) core stack. Utils come from **dff-util** (`CallHbs`, `CallLangText`, `LangCountryCode`, mappers). SQL in `config-sql/` is **insert-only** (complete `CREATE TABLE`, no `UPDATE` / `ALTER TABLE` in seed files).

Typical headers: `Authorization: Bearer <jwt>`, `x-tenant-id: <tenant>`.

Bruno collections live under `api/`.

---

## Run

```sh
export BASE_NAME=CORE
export CORE_DB_URL='postgresql://postgres:postgres@localhost:5432/public'
export CORE_LOG_MASK_KEYS='email,mobile,tel_code,telCode,phone,password,token,authorization,pic,secret'
echo $CORE_DB_URL
# SMTP / S3: fill app_settings rows (do not put secrets in git)
# integration_smtp, integration_s3_public, integration_s3_private
# Optional fallback if SMTP username/password are empty:
# export CORE_MAIL_SERVICE=outlook
# export CORE_MAIL_USER='noreply@example.com'
# export CORE_MAIL_PASS='...'
```

```sh
bun start
# or: encore run
```

Health (`:id` is the tenant):

```sh
curl -s http://localhost:4000/health/YOUR_TENANT_ID
```

Seed order is `config-sql/order.yaml`.

---

## App settings

CRUD:

- `POST /app-setting-save`
- `POST /app-setting-search`
- `GET /app-setting-entity/:id`

`id` is always `{type}_{code}` (e.g. `integration_smtp`). Fill `data` JSON; do not hardcode secrets in code.

| Setting id | Used by |
| --- | --- |
| `integration_smtp` | `POST /mail-send` (nodemailer) |
| `integration_s3_public` | `GET /sss-url?fileName=` |
| `integration_s3_private` | `GET /sss-url?fileName=&private=true` |
| `branding_company` | Auth emails (`logo_url`, app/company name) |

### SMTP (`integration_smtp` `data`)

Nodemailer uses: `host`, `port`, `username`, `password`, `secure`, `service` (only if `host` is empty), `from_email`, `from_name`. `encryption` of `ssl` (or port `465`) sets `secure`. Stored but unused by the helper: `enabled`, `require_tls`, `reply_to`.

### S3 (`integration_s3_public` / `integration_s3_private` `data`)

`enabled`, `bucket`, `region`, `access_key`, `secret_key`, `endpoint`, `base_url`, `folder`, `expires` (seconds), `acl` (`public-read` vs `private`).

If `bucket` + `access_key` + `secret_key` are set, URLs are AWS SigV4. Otherwise Encore buckets `sss-files` (public) and `sss-files-private` (private). Empty `endpoint` / `base_url` is fine: public download falls back to Encore `publicUrl` or virtual-hosted S3. For AWS Canada: `region` `ca-central-1`, `endpoint` `https://s3.ca-central-1.amazonaws.com`, `base_url` `https://{bucket}.s3.ca-central-1.amazonaws.com`.

---

## Query load (constants and settings)

`GET /query-load/:id` uses `RequestByIdType` + `RequestQueryType`. `GET /query-list/:id` also uses `SearchType` (`limit`, `skip`, `orderBy`, `searchTerm`, `active`, `filters`). Response is always `ResponseType`. Any other query string (`type`, `persona`, …) is substituted as `{{params.key}}` in the saved SQL. Omit a key to skip that filter. Public query-loads are allowed when session id is `System`.

| Id | Access | Table | Query params |
| --- | --- | --- | --- |
| `CONSTANT_PUBLIC` | public | `app_constants` | `type`, `active` |
| `CONSTANT_PRIVATE` | auth | `app_constants` | `type`, `active` |
| `SETTING_PUBLIC` | public | `app_settings` | `type`, `active` (and `is_public = true`) |
| `SETTING_PRIVATE` | auth | `app_settings` | `type`, `active` (and `is_public = false`) |
| `LANG` | public | `lang` | — |
| `ROLE` | auth | `menu_roles` | — |
| `PROFILE` | auth | `profiles` | `persona`, `active` |

Examples:

```
GET /query-load/CONSTANT_PUBLIC?type=persona&active=true
GET /query-load/CONSTANT_PRIVATE?type=gender&active=true
GET /query-load/SETTING_PUBLIC?type=branding&active=true
GET /query-load/SETTING_PRIVATE?type=integration&active=true
GET /query-load/PROFILE?persona=admin&active=true
GET /query-load/LANG
```

Also: `GET /query-report/:id`, `GET /query-list/:id`.

---

## Lang

Table `lang`. Save `{ "id": "en-US" }` and `LangCountryCode` fills name, country, dir, locale.

- `POST /lang-save`
- `POST /lang-search`
- `GET /lang-entity/:id`

Seeded locales include `en-US`, `en-CA`, `ar-SA`, `hi-IN`. Any locale known to dff-util can be saved.

---

## Translation

Table `translation`: one row per **type + key**. `id` is `{type}_{key}` (e.g. `auth_signIn`). `key` must not contain `.`. `type` is free (user-defined: `app`, `auth`, `setting`, `common`, …). `data` is a language map:

```json
{
  "type": "auth",
  "key": "signIn",
  "data": { "en-US": "Sign in", "hi-IN": "साइन इन" }
}
```

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/translation-save` | Create/update; merges `data` |
| POST | `/translation-search` | Paginated list; optional `type`, `lang`, `searchTerm` |
| GET | `/translation-entity/:id` | One row, e.g. `auth_signIn` |
| POST | `/translation-data` | Matching **entities as stored**; filter `type` and/or `lang` |
| POST | `/translation-lang` | App copy map (no `type` in the response) |
| POST | `/translation-text` | `CallLangText` `{ text, source, target }` |
| POST | `/translation-fill` | Fill missing locales from `source` (default `en-US`) |
| GET | `/translation-map/:lang` | Same merge as `/translation-lang` for one locale |

`/translation-lang` loads `common` first, then other types **overwrite the same key**. Missing locale values fall back to `en-US`:

```json
{
  "en-US": { "signIn": "Sign in", "save": "Save" },
  "hi-IN": { "signIn": "साइन इन", "save": "Save" }
}
```

Pass `{ "lang": "en-US" }` to return only that locale.

---

## Template files and mail

Table `template_files`: one row per **name + lang**. Render uses `CallHbs` with `{ data: payload }`. Lookup: id → `{name}_{lang}` → `{name}_en-US`.

| Method | Path |
| --- | --- |
| POST | `/template-file-save` |
| GET | `/template-file-search` |
| GET | `/template-file-entity/:id` |
| POST | `/template-file-render` `{ templateId, lang?, data }` |
| POST | `/mail-send` `{ templateId, lang?, data, to, subject?, attachments }` |

Seeded templates:

| Use | `templateId` | Row id |
| --- | --- | --- |
| Signup, send-otp, forgot-password | `otp-email` | `otp-email_en-US` |
| Reset password success | `reset-password-success` | `reset-password-success_en-US` |
| OTP SMS (render only) | `otp-sms` | `otp-sms_en-US` |

OTP email: optional `messageAbove` / `messageBelow` (or `smsStartMessage` / `smsEndMessage`); OTP is centered; `logoUrl` from branding when auth sends mail.

```json
{
  "templateId": "otp-email",
  "lang": "en-US",
  "to": "admin@example.com",
  "data": { "otp": "500827", "logoUrl": "https://www.w3.org/Icons/w3c_home.png" },
  "attachments": ["https://www.w3.org/Icons/w3c_home.png"]
}
```

---

## Auth (and mail)

Mail is sent when `userid` is an email. Mail errors are logged and do not fail the auth call.

| API | Template |
| --- | --- |
| `POST /auth-signup` | `otp-email` |
| `POST /auth-send-otp` | `otp-email` |
| `POST /auth-forgot-password` | `otp-email` |
| `POST /auth-reset-password` | `reset-password-success` |
| `POST /auth-signin` | — |
| `POST /auth-google-signin` | — |
| `POST /auth-verify-otp` | — |
| `POST /auth-verify-account` | — |

Also: `POST /auth-save`, `POST /auth-search`, `GET /auth-entity/:id`.

OTP CRUD: `POST /otp-save`, `POST /otp-search`, `GET /otp-entity/:id` (table `otp_verifications`).

---

## S3 / SSS

`GET /sss-url?fileName=jwt.png` — public (`integration_s3_public`).  
`GET /sss-url?fileName=jwt.png&private=true` — private (`integration_s3_private`).

| | Public | Private |
| --- | --- | --- |
| Upload | signed PUT | signed PUT |
| Download | `base_url` or Encore `publicUrl` | signed GET (`expires`) |

Object key: `{folder}/{name}-{uuid}{ext}` (folder often `local`).

---

## Bruno

Collections in `api/` (`{{baseUrl}}`, `{{token}}`, `{{xTenantId}}`):

`api/auth/`, `api/app-setting/`, `api/lang/`, `api/translation/`, `api/template-file/`, `api/mail/`, `api/sss/`, `api/otp/`, `api/query/`, `api/profile/`, `api/profile-hash/`.
