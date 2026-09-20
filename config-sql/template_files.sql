CREATE TABLE IF NOT EXISTS template_files (
  id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  lang VARCHAR(255) NOT NULL DEFAULT 'en-US',
  channel VARCHAR(32) NOT NULL DEFAULT 'email',
  subject VARCHAR(255) NULL,
  template TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by VARCHAR(127) NOT NULL DEFAULT 'System',
  created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by VARCHAR(127) NOT NULL DEFAULT 'System',
  updated_on TIMESTAMPTZ NULL DEFAULT now(),

  CONSTRAINT template_files_pkey PRIMARY KEY (id),
  CONSTRAINT template_files_uq_name_lang UNIQUE (name, lang)
);

CREATE INDEX IF NOT EXISTS template_files_lang_idx ON template_files (lang);
CREATE INDEX IF NOT EXISTS template_files_channel_idx ON template_files (channel);
CREATE INDEX IF NOT EXISTS template_files_active_idx ON template_files (active);

-- OTP email (en-US): message above, OTP centered, message below
INSERT INTO template_files (id, name, lang, channel, subject, template, active, created_by, created_on, updated_by, updated_on)
VALUES (
  'otp-email_en-US',
  'otp-email',
  'en-US',
  'email',
  'Your one-time password',
  $otp_email_en$
<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
  <div style="text-align:center;margin:0 0 24px">
    <img src="{{#if data.logoUrl}}{{data.logoUrl}}{{else}}https://www.w3.org/Icons/w3c_home.png{{/if}}" alt="Logo" width="72" height="48" style="display:inline-block;border:0;max-width:160px;height:auto" />
  </div>
  <p style="margin:0 0 16px;font-size:16px;line-height:1.5">{{#if data.messageAbove}}{{data.messageAbove}}{{else}}{{#if data.smsStartMessage}}{{data.smsStartMessage}}{{else}}Your one-time password is:{{/if}}{{/if}}</p>
  <p style="margin:24px 0;text-align:center;font-size:32px;font-weight:700;letter-spacing:8px;line-height:1.2">{{data.otp}}</p>
  <p style="margin:16px 0 0;font-size:14px;line-height:1.5;color:#555">{{#if data.messageBelow}}{{data.messageBelow}}{{else}}{{#if data.smsEndMessage}}{{data.smsEndMessage}}{{else}}Do not share this code with anyone. It expires soon.{{/if}}{{/if}}</p>
</div>
$otp_email_en$,
  TRUE,
  'System',
  now(),
  'System',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- OTP SMS / plain text (en-US): above + OTP + below
INSERT INTO template_files (id, name, lang, channel, subject, template, active, created_by, created_on, updated_by, updated_on)
VALUES (
  'otp-sms_en-US',
  'otp-sms',
  'en-US',
  'sms',
  NULL,
  '{{#if data.messageAbove}}{{data.messageAbove}}{{else}}{{#if data.smsStartMessage}}{{data.smsStartMessage}}{{else}}Your OTP is{{/if}}{{/if}} {{data.otp}} {{#if data.messageBelow}}{{data.messageBelow}}{{else}}{{#if data.smsEndMessage}}{{data.smsEndMessage}}{{else}}Do not share this code.{{/if}}{{/if}}',
  TRUE,
  'System',
  now(),
  'System',
  now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO template_files (id, name, lang, channel, subject, template, active, created_by, created_on, updated_by, updated_on)
VALUES (
  'reset-password-success_en-US',
  'reset-password-success',
  'en-US',
  'email',
  'Your password was reset',
  $reset_password_success_en$
<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
  <div style="text-align:center;margin:0 0 24px">
    <img src="{{#if data.logoUrl}}{{data.logoUrl}}{{else}}https://www.w3.org/Icons/w3c_home.png{{/if}}" alt="Logo" width="72" height="48" style="display:inline-block;border:0;max-width:160px;height:auto" />
  </div>
  <p style="margin:0 0 16px;font-size:16px;line-height:1.5">{{#if data.messageAbove}}{{data.messageAbove}}{{else}}Your password was reset successfully.{{/if}}</p>
  <p style="margin:24px 0;text-align:center;font-size:22px;font-weight:700;line-height:1.2">Password updated</p>
  <p style="margin:16px 0 0;font-size:14px;line-height:1.5;color:#555">{{#if data.messageBelow}}{{data.messageBelow}}{{else}}If you did not change your password, contact support immediately.{{/if}}</p>
</div>
$reset_password_success_en$,
  TRUE,
  'System',
  now(),
  'System',
  now()
)
ON CONFLICT (id) DO NOTHING;
