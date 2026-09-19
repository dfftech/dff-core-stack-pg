CREATE TABLE IF NOT EXISTS query_reports (
  id VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  query TEXT NOT NULL,
  params JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by VARCHAR(127) NOT NULL DEFAULT 'System',
  created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by VARCHAR(127) NOT NULL DEFAULT 'System',
  updated_on TIMESTAMPTZ NULL DEFAULT now(),

  CONSTRAINT query_reports_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS query_reports_type_idx ON query_reports (type);
CREATE INDEX IF NOT EXISTS query_reports_name_idx ON query_reports (name);

-- persona is passed dynamically via {{params.persona}}

INSERT INTO query_reports (id, type, display_name, name, query, params, created_by, created_on, updated_by, updated_on)
VALUES (
  'PROFILE_REPORT',
  'profile',
  'Profiles Report',
  'profile_report',
  'SELECT id, name, email, mobile, tel_code AS "telCode", persona, active, is_email_verified AS "isEmailVerified", is_mobile_verified AS "isMobileVerified", roles, created_at AS "createdAt", updated_at AS "updatedAt" FROM profiles WHERE persona = ''{{params.persona}}'' AND is_archived = false ORDER BY updated_at DESC',
  '{"persona":""}'::jsonb,
  'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO query_reports (id, type, display_name, name, query, params, created_by, created_on, updated_by, updated_on)
VALUES (
  'PROFILE_SUMMARY_BY_PERSONA',
  'profile',
  'Profile Summary By Persona',
  'profile_summary_by_persona',
  'SELECT persona, COUNT(*) AS total, COUNT(*) FILTER (WHERE active = true) AS "activeCount", COUNT(*) FILTER (WHERE active = false) AS "inactiveCount" FROM profiles WHERE is_archived = false GROUP BY persona ORDER BY persona',
  '{}'::jsonb,
  'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;
