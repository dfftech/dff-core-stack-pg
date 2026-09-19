CREATE TABLE IF NOT EXISTS lang (
  id VARCHAR(255) NOT NULL,
  lang VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  dir VARCHAR(10) NOT NULL,
  locale VARCHAR(255) NOT NULL,
  active BOOLEAN NOT NULL,
  created_by VARCHAR(255) NOT NULL DEFAULT 'System',
  updated_by VARCHAR(255) NOT NULL DEFAULT 'System',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT lang_pkey PRIMARY KEY (id),
  CONSTRAINT lang_dir_check CHECK (dir IN ('ltr', 'rtl'))
);

CREATE INDEX IF NOT EXISTS lang_active_idx ON lang (active);
CREATE INDEX IF NOT EXISTS lang_locale_idx ON lang (locale);

INSERT INTO lang (id, lang, country, name, dir, locale, active, created_by, updated_by, created_at, updated_at)
VALUES (
  'en-US',
  'en',
  'US',
  'English',
  'ltr',
  'English',
  TRUE,
  'System',
  'System',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;
