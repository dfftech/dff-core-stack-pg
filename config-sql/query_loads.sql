CREATE TABLE IF NOT EXISTS query_loads (
  id VARCHAR(255) NOT NULL,
  query TEXT NOT NULL,
  params JSONB NOT NULL,
  use_cache BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_data BOOLEAN NOT NULL DEFAULT false,
  is_core BOOLEAN NOT NULL DEFAULT false,
  created_by VARCHAR(127) NOT NULL DEFAULT 'System',
  created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by VARCHAR(127) NOT NULL DEFAULT 'System',
  updated_on TIMESTAMPTZ NULL DEFAULT now(),

  CONSTRAINT query_loads_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS query_loads_is_public_idx ON query_loads (is_public);
CREATE INDEX IF NOT EXISTS query_loads_is_data_idx ON query_loads (is_data);
CREATE INDEX IF NOT EXISTS query_loads_is_core_idx ON query_loads (is_core);

-- ROLE from menu_roles
INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'ROLE',
  'SELECT id AS key, name AS label, (NOT active) AS disabled, name_lang AS lang, persona FROM menu_roles ORDER BY name',
  '{}'::jsonb,
  TRUE,
  TRUE,
  FALSE,
  'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

-- LANG from lang table
INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'LANG',
  'SELECT id AS key, name AS label, (NOT active) AS disabled, locale AS locale FROM lang ORDER BY name',
  '{}'::jsonb,
  TRUE,
  TRUE,
  TRUE,
  'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

-- app_constants by type
INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'PERSONA',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''persona'' ORDER BY code',
  '{"type":"persona"}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'LANGUAGE',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''language'' ORDER BY code',
  '{"type":"language"}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'ACTIVE_STATUS',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''active_status'' ORDER BY code',
  '{"type":"active_status"}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'WORKFLOW_STATUS',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''workflow_status'' ORDER BY code',
  '{"type":"workflow_status"}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'TRANSACTION_STATUS',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''transaction_status'' ORDER BY code',
  '{"type":"transaction_status"}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'ORDER_STATUS',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''order_status'' ORDER BY code',
  '{"type":"order_status"}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'PAYMENT_METHOD',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''payment_method'' ORDER BY code',
  '{"type":"payment_method"}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'PRIORITY',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''priority'' ORDER BY code',
  '{"type":"priority"}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'VISIBILITY',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''visibility'' ORDER BY code',
  '{"type":"visibility"}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'GENDER',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''gender'' ORDER BY code',
  '{"type":"gender"}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'VERIFICATION_STATUS',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''verification_status'' ORDER BY code',
  '{"type":"verification_status"}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'AUTH_PROVIDER',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''auth_provider'' ORDER BY code',
  '{"type":"auth_provider"}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'ADDRESS_TYPE',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''address_type'' ORDER BY code',
  '{"type":"address_type"}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'DEVICE_TYPE',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''device_type'' ORDER BY code',
  '{"type":"device_type"}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'DISCOUNT_TYPE',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''discount_type'' ORDER BY code',
  '{"type":"discount_type"}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'MEDIA_TYPE',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE type = ''media_type'' ORDER BY code',
  '{"type":"media_type"}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

-- app_settings where is_public = true (all)
INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SETTINGS_PUBLIC',
  'SELECT id AS key, name AS label, (NOT active) AS disabled, type, code, data FROM app_settings WHERE is_public = true ORDER BY type, code',
  '{"is_public":true}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

-- individual public settings
INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'BRANDING_COMPANY',
  'SELECT id AS key, name AS label, (NOT active) AS disabled, type, code, data FROM app_settings WHERE id = ''branding_company'' AND is_public = true',
  '{"id":"branding_company"}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'CONTACT_DETAILS',
  'SELECT id AS key, name AS label, (NOT active) AS disabled, type, code, data FROM app_settings WHERE id = ''contact_details'' AND is_public = true',
  '{"id":"contact_details"}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SOCIAL_LINKS',
  'SELECT id AS key, name AS label, (NOT active) AS disabled, type, code, data FROM app_settings WHERE id = ''social_links'' AND is_public = true',
  '{"id":"social_links"}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'LEGAL_COPYRIGHT',
  'SELECT id AS key, name AS label, (NOT active) AS disabled, type, code, data FROM app_settings WHERE id = ''legal_copyright'' AND is_public = true',
  '{"id":"legal_copyright"}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SEO_DEFAULT',
  'SELECT id AS key, name AS label, (NOT active) AS disabled, type, code, data FROM app_settings WHERE id = ''seo_default'' AND is_public = true',
  '{"id":"seo_default"}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SYSTEM_APP',
  'SELECT id AS key, name AS label, (NOT active) AS disabled, type, code, data FROM app_settings WHERE id = ''system_app'' AND is_public = true',
  '{"id":"system_app"}'::jsonb,
  TRUE, TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

-- profiles — persona passed dynamically via {{params.persona}}
INSERT INTO query_loads (id, query, params, use_cache, is_core, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'PROFILE',
  'SELECT id AS key, name AS label, (NOT active) AS disabled, name_lang AS lang, email, persona FROM profiles WHERE persona = ''{{params.persona}}'' AND is_archived = false ORDER BY name',
  '{"persona":""}'::jsonb,
  TRUE, TRUE, FALSE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;
