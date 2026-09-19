CREATE TABLE IF NOT EXISTS menu_links (
  id VARCHAR(255) NOT NULL,
  active BOOLEAN NOT NULL,
  href VARCHAR(255) NOT NULL,
  icon VARCHAR(255) NOT NULL,
  menu_group_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  name_lang JSONB NOT NULL,
  priority INTEGER NOT NULL,
  persona VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by VARCHAR(255) NOT NULL DEFAULT 'System',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by VARCHAR(255) NOT NULL DEFAULT 'System',

  CONSTRAINT menu_links_pkey PRIMARY KEY (id),
  CONSTRAINT fk_menu_links_menu_group_id_menu_groups
    FOREIGN KEY (menu_group_id) REFERENCES menu_groups (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_menu_links_menu_group_id ON menu_links (menu_group_id);
CREATE INDEX IF NOT EXISTS menu_links_persona_idx ON menu_links (persona);
CREATE INDEX IF NOT EXISTS menu_links_active_idx ON menu_links (active);

INSERT INTO menu_links (id, created_at, created_by, updated_at, updated_by, active, href, icon, menu_group_id, name, name_lang, priority, persona)
VALUES
(
  'ADMIN_DASHBOARD',
  now(),
  'System',
  now(),
  'System',
  TRUE,
  '/dashboard',
  'dashboard',
  NULL,
  'Dashboard',
  '{"en-US":"Dashboard"}'::jsonb,
  1,
  'admin'
),
(
  'ADMIN_SETTINGS_MENU_MANAGEMENT',
  now(),
  'System',
  now(),
  'System',
  TRUE,
  '/menu-management',
  'menu',
  'ADMIN_SETTINGS',
  'Menu Management',
  '{"en-US":"Menu Management"}'::jsonb,
  11,
  'admin'
),
(
  'ADMIN_SETTINGS_MENU_ACCESS',
  now(),
  'System',
  now(),
  'System',
  TRUE,
  '/menu-access',
  'access',
  'ADMIN_SETTINGS',
  'Menu Access',
  '{"en-US":"Menu Access"}'::jsonb,
  12,
  'admin'
),
(
  'ADMIN_ADMINISTRATOR_PROFILES',
  now(),
  'System',
  now(),
  'System',
  TRUE,
  '/profiles',
  'users',
  'ADMIN_ADMINISTRATOR',
  'Profiles',
  '{"en-US":"Profiles"}'::jsonb,
  1,
  'admin'
)
ON CONFLICT (id) DO NOTHING;
