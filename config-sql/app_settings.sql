CREATE TABLE IF NOT EXISTS app_settings (
  id VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  code VARCHAR(100) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT false,
  name VARCHAR(255) NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by VARCHAR(255) NOT NULL DEFAULT 'System',
  updated_by VARCHAR(255) NOT NULL DEFAULT 'System',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT app_settings_pkey PRIMARY KEY (id),
  CONSTRAINT app_settings_type_code_unique UNIQUE (type, code),
  CONSTRAINT app_settings_id_check CHECK (id = type || '_' || code)
);

CREATE INDEX IF NOT EXISTS app_settings_type_idx ON app_settings (type);
CREATE INDEX IF NOT EXISTS app_settings_active_idx ON app_settings (active);
CREATE INDEX IF NOT EXISTS app_settings_is_public_idx ON app_settings (is_public);

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('integration_smtp', 'integration', 'smtp', 'SMTP Settings', false,
'{"enabled":true,"service":"","host":"","port":587,"username":"","password":"","encryption":"tls","secure":false,"from_email":"","from_name":"","reply_to":""}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('integration_s3_public', 'integration', 's3_public', 'S3 Public Bucket Settings', false,
'{"enabled":true,"bucket":"","region":"us-east-1","access_key":"","secret_key":"","endpoint":"","base_url":"","folder":"","expires":300,"acl":"public-read"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('integration_s3_private', 'integration', 's3_private', 'S3 Private Bucket Settings', false,
'{"enabled":true,"bucket":"","region":"us-east-1","access_key":"","secret_key":"","endpoint":"","base_url":"","folder":"","expires":300,"acl":"private"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('integration_google_map', 'integration', 'google_map', 'Google Map Settings', false,
'{"enabled":false,"api_key":"","default_latitude":"","default_longitude":"","zoom":12}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('branding_company', 'branding', 'company', 'Company Branding', true,
'{"app_name":"YourAppName","company_name":"YourBrandName","logo_url":"https://www.w3.org/Icons/w3c_home.png","favicon_url":"https://www.w3.org/favicon.ico","footer_logo_url":"https://www.w3.org/Icons/w3c_home.png","primary_color":"#2563EB","secondary_color":"#64748B"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('contact_details', 'contact', 'details', 'Contact Details', true,
'{"email":"","support_email":"","phone":"","whatsapp":"","address":"","city":"","state":"","country":"","pincode":"","website":""}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('social_links', 'social', 'links', 'Social Network Links', true,
'{"facebook":"","instagram":"","linkedin":"","twitter":"","youtube":"","telegram":"","whatsapp":"","pinterest":""}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('legal_copyright', 'legal', 'copyright', 'Copyright Settings', true,
'{"copyright_text":"Copyright © 2026. All rights reserved.","company_name":"","terms_url":"","privacy_url":"","refund_url":"","shipping_url":"","cookie_policy_url":""}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('auth_google', 'auth', 'google', 'Google Login Settings', false,
'{"enabled":false,"client_id":"","client_secret":"","redirect_url":"","scopes":["email","profile"]}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('auth_apple', 'auth', 'apple', 'Apple Login Settings', false,
'{"enabled":false,"client_id":"","team_id":"","key_id":"","private_key":"","redirect_url":""}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('auth_facebook', 'auth', 'facebook', 'Facebook Login Settings', false,
'{"enabled":false,"app_id":"","app_secret":"","redirect_url":"","scopes":["email","public_profile"]}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('auth_linkedin', 'auth', 'linkedin', 'LinkedIn Login Settings', false,
'{"enabled":false,"client_id":"","client_secret":"","redirect_url":"","scopes":["openid","profile","email"]}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('payment_stripe', 'payment', 'stripe', 'Stripe Payment Settings', false,
'{"enabled":false,"mode":"test","publishable_key":"","secret_key":"","webhook_secret":"","currency":"USD"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('payment_razorpay', 'payment', 'razorpay', 'Razorpay Payment Settings', false,
'{"enabled":false,"mode":"test","key_id":"","key_secret":"","webhook_secret":"","currency":"INR"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('payment_paypal', 'payment', 'paypal', 'PayPal Payment Settings', false,
'{"enabled":false,"mode":"sandbox","client_id":"","client_secret":"","currency":"USD"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('payment_cashfree', 'payment', 'cashfree', 'Cashfree Payment Settings', false,
'{"enabled":false,"mode":"sandbox","app_id":"","secret_key":"","webhook_secret":"","currency":"INR"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('notification_sms', 'notification', 'sms', 'SMS Settings', false,
'{"enabled":false,"provider":"","api_key":"","sender_id":"","template_id":""}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('notification_whatsapp', 'notification', 'whatsapp', 'WhatsApp Settings', false,
'{"enabled":false,"provider":"","phone_number_id":"","access_token":"","business_account_id":""}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('notification_push', 'notification', 'push', 'Push Notification Settings', false,
'{"enabled":false,"firebase_server_key":"","firebase_project_id":"","vapid_key":""}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('security_recaptcha', 'security', 'recaptcha', 'Google reCAPTCHA Settings', false,
'{"enabled":false,"site_key":"","secret_key":"","version":"v2"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('analytics_google', 'analytics', 'google', 'Google Analytics Settings', false,
'{"enabled":false,"measurement_id":"","tag_manager_id":""}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('analytics_facebook_pixel', 'analytics', 'facebook_pixel', 'Facebook Pixel Settings', false,
'{"enabled":false,"pixel_id":"","access_token":""}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('seo_default', 'seo', 'default', 'Default SEO Settings', true,
'{"meta_title":"","meta_description":"","meta_keywords":"","og_image":"","canonical_url":""}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('system_maintenance', 'system', 'maintenance', 'Maintenance Mode', false,
'{"enabled":false,"message":"We are currently under maintenance.","allowed_ips":[]}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, type, code, name, is_public, data)
VALUES ('system_app', 'system', 'app', 'Application Settings', true,
'{"timezone":"Asia/Kolkata","date_format":"YYYY-MM-DD","time_format":"HH:mm","currency":"INR","language":"en"}'::jsonb)
ON CONFLICT (id) DO NOTHING;