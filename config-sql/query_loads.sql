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

-- app_constants: pass type=persona&active=true (omitted keys are ignored)
INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'CONSTANT_PUBLIC',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE ({{params.type}} IS NULL OR type = {{params.type}}) AND ({{params.active}} IS NULL OR active = {{params.active}}::boolean) ORDER BY code',
  '{"type":"","active":""}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'CONSTANT_PRIVATE',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_constants WHERE ({{params.type}} IS NULL OR type = {{params.type}}) AND ({{params.active}} IS NULL OR active = {{params.active}}::boolean) ORDER BY code',
  '{"type":"","active":""}'::jsonb,
  TRUE, FALSE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

-- app_settings: pass type=branding&active=true; public rows vs private rows
INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SETTING_PUBLIC',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_settings WHERE ({{params.type}} IS NULL OR type = {{params.type}}) AND ({{params.active}} IS NULL OR active = {{params.active}}::boolean) AND is_public = true ORDER BY code',
  '{"type":"","active":""}'::jsonb,
  TRUE, TRUE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'SETTING_PRIVATE',
  'SELECT code AS key, name AS label, (NOT active) AS disabled, data AS lang FROM app_settings WHERE ({{params.type}} IS NULL OR type = {{params.type}}) AND ({{params.active}} IS NULL OR active = {{params.active}}::boolean) AND is_public = false ORDER BY code',
  '{"type":"","active":""}'::jsonb,
  TRUE, FALSE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

-- profiles — persona / active passed via query string
INSERT INTO query_loads (id, query, params, use_cache, is_public, created_by, created_on, updated_by, updated_on)
VALUES (
  'PROFILE',
  'SELECT id AS key, name AS label, (NOT active) AS disabled, name_lang AS lang, email, persona FROM profiles WHERE ({{params.persona}} IS NULL OR persona = {{params.persona}}) AND is_archived = false AND ({{params.active}} IS NULL OR active = {{params.active}}::boolean) ORDER BY name',
  '{"persona":"","active":""}'::jsonb,
  TRUE, FALSE, 'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;
