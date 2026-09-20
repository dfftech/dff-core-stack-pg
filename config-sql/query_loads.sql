CREATE TABLE IF NOT EXISTS query_loads (
  id VARCHAR(255) NOT NULL,
  query TEXT NOT NULL,
  params JSONB NOT NULL,
  use_cache BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_data BOOLEAN NOT NULL DEFAULT false,
  created_by VARCHAR(127) NOT NULL DEFAULT 'System',
  created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by VARCHAR(127) NOT NULL DEFAULT 'System',
  updated_on TIMESTAMPTZ NULL DEFAULT now(),

  CONSTRAINT query_loads_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS query_loads_is_public_idx ON query_loads (is_public);
CREATE INDEX IF NOT EXISTS query_loads_is_data_idx ON query_loads (is_data);

-- ROLE from menu_roles
INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'ROLE',
  'SELECT id AS key, name AS label, (NOT active) AS disabled, name_lang AS lang, persona FROM menu_roles ORDER BY name',
  '{}'::jsonb,
  TRUE, FALSE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

-- LANG from lang table
INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'LANG',
  'SELECT id AS key, name AS label, (NOT active) AS disabled, locale AS locale FROM lang ORDER BY name',
  '{}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

-- app_constants by type (id prefix CONSTANT_)
INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'CONSTANT_PERSONA',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''persona'' ORDER BY code',
  '{"type":"persona"}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'CONSTANT_LANGUAGE',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''language'' ORDER BY code',
  '{"type":"language"}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'CONSTANT_ACTIVE_STATUS',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''active_status'' ORDER BY code',
  '{"type":"active_status"}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'CONSTANT_WORKFLOW_STATUS',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''workflow_status'' ORDER BY code',
  '{"type":"workflow_status"}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'CONSTANT_TRANSACTION_STATUS',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''transaction_status'' ORDER BY code',
  '{"type":"transaction_status"}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'CONSTANT_ORDER_STATUS',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''order_status'' ORDER BY code',
  '{"type":"order_status"}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'CONSTANT_PAYMENT_METHOD',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''payment_method'' ORDER BY code',
  '{"type":"payment_method"}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'CONSTANT_PRIORITY',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''priority'' ORDER BY code',
  '{"type":"priority"}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'CONSTANT_VISIBILITY',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''visibility'' ORDER BY code',
  '{"type":"visibility"}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'CONSTANT_GENDER',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''gender'' ORDER BY code',
  '{"type":"gender"}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'CONSTANT_VERIFICATION_STATUS',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''verification_status'' ORDER BY code',
  '{"type":"verification_status"}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'CONSTANT_AUTH_PROVIDER',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''auth_provider'' ORDER BY code',
  '{"type":"auth_provider"}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'CONSTANT_ADDRESS_TYPE',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''address_type'' ORDER BY code',
  '{"type":"address_type"}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'CONSTANT_DEVICE_TYPE',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''device_type'' ORDER BY code',
  '{"type":"device_type"}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'CONSTANT_DISCOUNT_TYPE',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''discount_type'' ORDER BY code',
  '{"type":"discount_type"}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'CONSTANT_MEDIA_TYPE',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''media_type'' ORDER BY code',
  '{"type":"media_type"}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

-- app_settings by type (same query shape as constants; id prefix SETTING_)
INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SETTING_INTEGRATION',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_settings WHERE type = ''integration'' ORDER BY code',
  '{"type":"integration"}'::jsonb,
  TRUE, FALSE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SETTING_BRANDING',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_settings WHERE type = ''branding'' ORDER BY code',
  '{"type":"branding"}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SETTING_CONTACT',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_settings WHERE type = ''contact'' ORDER BY code',
  '{"type":"contact"}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SETTING_SOCIAL',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_settings WHERE type = ''social'' ORDER BY code',
  '{"type":"social"}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SETTING_LEGAL',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_settings WHERE type = ''legal'' ORDER BY code',
  '{"type":"legal"}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SETTING_AUTH',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_settings WHERE type = ''auth'' ORDER BY code',
  '{"type":"auth"}'::jsonb,
  TRUE, FALSE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SETTING_PAYMENT',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_settings WHERE type = ''payment'' ORDER BY code',
  '{"type":"payment"}'::jsonb,
  TRUE, FALSE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SETTING_NOTIFICATION',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_settings WHERE type = ''notification'' ORDER BY code',
  '{"type":"notification"}'::jsonb,
  TRUE, FALSE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SETTING_SECURITY',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_settings WHERE type = ''security'' ORDER BY code',
  '{"type":"security"}'::jsonb,
  TRUE, FALSE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SETTING_ANALYTICS',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_settings WHERE type = ''analytics'' ORDER BY code',
  '{"type":"analytics"}'::jsonb,
  TRUE, FALSE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SETTING_SEO',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_settings WHERE type = ''seo'' ORDER BY code',
  '{"type":"seo"}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SETTING_SYSTEM',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_settings WHERE type = ''system'' ORDER BY code',
  '{"type":"system"}'::jsonb,
  TRUE, FALSE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

-- individual settings by id (smtp, s3, sms, …)
INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SETTING_SMTP',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_settings WHERE id = ''integration_smtp''',
  '{"id":"integration_smtp"}'::jsonb,
  TRUE, FALSE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SETTING_S3',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_settings WHERE id = ''integration_s3''',
  '{"id":"integration_s3"}'::jsonb,
  TRUE, FALSE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SETTING_GOOGLE_MAP',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_settings WHERE id = ''integration_google_map''',
  '{"id":"integration_google_map"}'::jsonb,
  TRUE, FALSE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SETTING_SMS',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_settings WHERE id = ''notification_sms''',
  '{"id":"notification_sms"}'::jsonb,
  TRUE, FALSE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SETTING_WHATSAPP',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_settings WHERE id = ''notification_whatsapp''',
  '{"id":"notification_whatsapp"}'::jsonb,
  TRUE, FALSE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SETTING_PUSH',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_settings WHERE id = ''notification_push''',
  '{"id":"notification_push"}'::jsonb,
  TRUE, FALSE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

-- profiles — persona passed dynamically via {{params.persona}}
INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'PROFILE',
  'SELECT id AS key, name AS label, (NOT active) AS disabled, name_lang AS lang, email, persona FROM profiles WHERE persona = ''{{params.persona}}'' AND is_archived = false ORDER BY name',
  '{"persona":""}'::jsonb,
  TRUE, FALSE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;
