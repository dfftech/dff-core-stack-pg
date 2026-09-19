CREATE TABLE IF NOT EXISTS otp_verifications (
  id VARCHAR(255) NOT NULL,
  is_verified BOOLEAN NOT NULL,
  otp VARCHAR(255) NOT NULL,
  uid VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by VARCHAR(255) NOT NULL DEFAULT 'System',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by VARCHAR(255) NOT NULL DEFAULT 'System',

  CONSTRAINT otp_verifications_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS otp_verifications_uid_idx ON otp_verifications (uid);
