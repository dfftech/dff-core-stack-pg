CREATE TABLE IF NOT EXISTS mappings (
  id            VARCHAR(255) PRIMARY KEY,
  type          VARCHAR(100) NOT NULL,
  entity_field  VARCHAR(255) NOT NULL,
  input_field   VARCHAR(255),
  is_required   BOOLEAN NOT NULL DEFAULT FALSE,
  compute       TEXT[],
  ai_summary    TEXT,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_by    VARCHAR(255) NOT NULL DEFAULT 'System',
  updated_by    VARCHAR(255) NOT NULL DEFAULT 'System',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mappings_type ON mappings (type);
CREATE INDEX IF NOT EXISTS idx_mappings_type_active ON mappings (type, active);
