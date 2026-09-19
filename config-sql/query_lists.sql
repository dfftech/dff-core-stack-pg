CREATE TABLE IF NOT EXISTS query_lists (
  id VARCHAR(255) NOT NULL,
  col JSONB NOT NULL DEFAULT '{}'::jsonb,
  query TEXT NOT NULL,
  default_order VARCHAR(255) NOT NULL DEFAULT 'updated_at desc',
  default_limit INTEGER NOT NULL DEFAULT 10,
  params JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by VARCHAR(127) NOT NULL DEFAULT 'System',
  created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by VARCHAR(127) NOT NULL DEFAULT 'System',
  updated_on TIMESTAMPTZ NULL DEFAULT now(),

  CONSTRAINT query_lists_pkey PRIMARY KEY (id)
);

-- persona is passed dynamically via {{params.persona}}

INSERT INTO query_lists (id, col, query, default_order, default_limit, params, created_by, created_on, updated_by, updated_on)
VALUES (
  'PROFILE_LIST',
  '[
    {"key":"id","label":"ID"},
    {"key":"name","label":"Name"},
    {"key":"email","label":"Email"},
    {"key":"mobile","label":"Mobile"},
    {"key":"persona","label":"Persona"},
    {"key":"active","label":"Active"},
    {"key":"updatedAt","label":"Updated At"}
  ]'::jsonb,
  'SELECT id, name, email, mobile, tel_code AS "telCode", persona, active, is_email_verified AS "isEmailVerified", is_mobile_verified AS "isMobileVerified", roles, created_at AS "createdAt", updated_at AS "updatedAt" FROM profiles WHERE persona = ''{{params.persona}}'' AND is_archived = false',
  'updated_at desc',
  10,
  '{"persona":""}'::jsonb,
  'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;
