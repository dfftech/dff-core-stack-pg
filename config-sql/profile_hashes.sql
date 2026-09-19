CREATE TABLE IF NOT EXISTS profile_hashes (
  id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by VARCHAR(255) NOT NULL DEFAULT 'System',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by VARCHAR(255) NOT NULL DEFAULT 'System',
  provider VARCHAR(255) NOT NULL DEFAULT 'password',
  hash_data VARCHAR(255),
  hash_salt VARCHAR(255),

  CONSTRAINT profile_hashes_pkey PRIMARY KEY (id),
  CONSTRAINT fk_profile_hashes_id_profiles_id
    FOREIGN KEY (id) REFERENCES profiles (id)
);

INSERT INTO profile_hashes (id, created_at, created_by, updated_at, updated_by, provider, hash_data, hash_salt)
VALUES (
  'SUPER_ADMIN',
  now(),
  'System',
  now(),
  'System',
  'password',
  'c10d06a8c654fa5df52bc78359d9ff28',
  'f9a15480bfcb8f45ac0b5dfea46a25ab'
)
ON CONFLICT (id) DO NOTHING;
