CREATE TABLE IF NOT EXISTS products (
  id                       VARCHAR(255) PRIMARY KEY,
  code                     VARCHAR(100) NOT NULL,
  name_lang                JSONB NOT NULL DEFAULT '{}'::jsonb,
  description_lang         JSONB NOT NULL DEFAULT '{}'::jsonb,
  summary_lang             JSONB NOT NULL DEFAULT '{}'::jsonb,
  category_code            VARCHAR(100),
  department_code          VARCHAR(100),
  department_name_lang     JSONB NOT NULL DEFAULT '{}'::jsonb,
  variant                  JSONB NOT NULL DEFAULT '{}'::jsonb,
  active                   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by               VARCHAR(255) NOT NULL DEFAULT 'System',
  updated_by               VARCHAR(255) NOT NULL DEFAULT 'System',
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_code ON products (code);
CREATE INDEX IF NOT EXISTS idx_products_category_code ON products (category_code);
CREATE INDEX IF NOT EXISTS idx_products_department_code ON products (department_code);
