CREATE TABLE IF NOT EXISTS menu_roles (
  id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_lang JSONB NOT NULL,
  persona VARCHAR(255) NOT NULL,
  active BOOLEAN NOT NULL,
  created_by VARCHAR(255) NOT NULL DEFAULT 'System',
  updated_by VARCHAR(255) NOT NULL DEFAULT 'System',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT menu_roles_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS menu_roles_persona_idx ON menu_roles (persona);
CREATE INDEX IF NOT EXISTS menu_roles_active_idx ON menu_roles (active);

INSERT INTO menu_roles (id, name, name_lang, persona, active, created_by, updated_by, created_at, updated_at)
VALUES (
  'ADMIN_ADMIN',
  'Admin',
  '{"en-US":"Admin"}'::jsonb,
  'admin',
  TRUE,
  'System',
  'System',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;
