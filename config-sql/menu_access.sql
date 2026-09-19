CREATE TABLE IF NOT EXISTS menu_access (
  id VARCHAR(255) NOT NULL,
  menu_role_id VARCHAR(255) NOT NULL,
  menu_link_id VARCHAR(255) NOT NULL,
  "read" BOOLEAN NOT NULL,
  "create" BOOLEAN NOT NULL,
  "update" BOOLEAN NOT NULL,
  "delete" BOOLEAN NOT NULL,
  persona VARCHAR(255) NOT NULL,
  created_by VARCHAR(255) NOT NULL DEFAULT 'System',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by VARCHAR(255) NOT NULL DEFAULT 'System',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT menu_access_pkey PRIMARY KEY (id),
  CONSTRAINT fk_menu_access_role_id_menu_roles
    FOREIGN KEY (menu_role_id) REFERENCES menu_roles (id) ON DELETE CASCADE,
  CONSTRAINT fk_menu_access_menu_link_id_menu_links
    FOREIGN KEY (menu_link_id) REFERENCES menu_links (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_menu_access_menu_role_id ON menu_access (menu_role_id);
CREATE INDEX IF NOT EXISTS idx_menu_access_menu_link_id ON menu_access (menu_link_id);
CREATE INDEX IF NOT EXISTS menu_access_persona_idx ON menu_access (persona);

INSERT INTO menu_access (id, created_at, created_by, updated_at, updated_by, persona, menu_role_id, menu_link_id, "read", "create", "update", "delete")
VALUES
(
  'ADMIN_ADMIN_ADMIN_DASHBOARD',
  now(),
  'System',
  now(),
  'System',
  'admin',
  'ADMIN_ADMIN',
  'ADMIN_DASHBOARD',
  TRUE,
  TRUE,
  TRUE,
  TRUE
),
(
  'ADMIN_ADMIN_ADMIN_SETTINGS_MENU_MANAGEMENT',
  now(),
  'System',
  now(),
  'System',
  'admin',
  'ADMIN_ADMIN',
  'ADMIN_SETTINGS_MENU_MANAGEMENT',
  TRUE,
  TRUE,
  TRUE,
  TRUE
),
(
  'ADMIN_ADMIN_ADMIN_SETTINGS_MENU_ACCESS',
  now(),
  'System',
  now(),
  'System',
  'admin',
  'ADMIN_ADMIN',
  'ADMIN_SETTINGS_MENU_ACCESS',
  TRUE,
  TRUE,
  TRUE,
  TRUE
),
(
  'ADMIN_ADMIN_ADMIN_ADMINISTRATOR_PROFILES',
  now(),
  'System',
  now(),
  'System',
  'admin',
  'ADMIN_ADMIN',
  'ADMIN_ADMINISTRATOR_PROFILES',
  TRUE,
  TRUE,
  TRUE,
  TRUE
)
ON CONFLICT (id) DO NOTHING;
