CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by VARCHAR(255) NOT NULL DEFAULT 'System',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by VARCHAR(255) NOT NULL DEFAULT 'System',
  active BOOLEAN NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_lang JSONB NOT NULL,
  pic TEXT,
  email VARCHAR(255) NOT NULL,
  mobile VARCHAR(255) NOT NULL,
  tel_code VARCHAR(255) NOT NULL,
  persona VARCHAR(255) NOT NULL,
  is_email_verified BOOLEAN NOT NULL,
  is_mobile_verified BOOLEAN NOT NULL,
  roles VARCHAR[] NOT NULL,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_reason TEXT,
  archived_by VARCHAR(255),
  archived_at TIMESTAMPTZ,

  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);
CREATE INDEX IF NOT EXISTS profiles_mobile_idx ON profiles (mobile);
CREATE INDEX IF NOT EXISTS profiles_persona_idx ON profiles (persona);
CREATE INDEX IF NOT EXISTS profiles_active_idx ON profiles (active);

INSERT INTO profiles (
  id, created_at, created_by, updated_at, updated_by, active, name, name_lang,
  pic, email, mobile, tel_code, persona, is_email_verified, is_mobile_verified, roles
) VALUES (
  'SUPER_ADMIN',
  now(),
  'System',
  now(),
  'System',
  TRUE,
  'Admin User',
  '{"en-US":"admin"}'::jsonb,
  '-',
  'super@admin.com',
  '0000000000',
  '91',
  'admin',
  TRUE,
  FALSE,
  '{SUPER_ADMIN,ADMIN_ADMIN}'
)
ON CONFLICT (id) DO NOTHING;
