CREATE TABLE IF NOT EXISTS menu_groups (
  id VARCHAR(255) NOT NULL,
  active BOOLEAN NOT NULL,
  icon VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_lang JSONB NOT NULL,
  priority INTEGER NOT NULL,
  persona VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by VARCHAR(255) NOT NULL DEFAULT 'System',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by VARCHAR(255) NOT NULL DEFAULT 'System',

  CONSTRAINT menu_groups_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS menu_groups_persona_idx ON menu_groups (persona);
CREATE INDEX IF NOT EXISTS menu_groups_active_idx ON menu_groups (active);

INSERT INTO menu_groups (id, active, icon, name, name_lang, priority, persona, updated_at, updated_by, created_at, created_by)
VALUES
(
  'ADMIN_ADMINISTRATOR',
  TRUE,
  'admin',
  'Administrator',
  '{"en-US":"Administrator"}'::jsonb,
  1,
  'admin',
  now(),
  'System',
  now(),
  'System'
),
(
  'ADMIN_SETTINGS',
  TRUE,
  'settings',
  'Settings',
  '{"en-US":"Settings"}'::jsonb,
  99,
  'admin',
  now(),
  'System',
  now(),
  'System'
)
ON CONFLICT (id) DO NOTHING;
