CREATE TABLE IF NOT EXISTS translation (
  id VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  key VARCHAR(255) NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by VARCHAR(127) NOT NULL DEFAULT 'System',
  created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by VARCHAR(127) NOT NULL DEFAULT 'System',
  updated_on TIMESTAMPTZ NULL DEFAULT now(),

  CONSTRAINT translation_pkey PRIMARY KEY (id),
  CONSTRAINT translation_type_key_unique UNIQUE (type, key),
  CONSTRAINT translation_id_check CHECK (id = type || '_' || key),
  CONSTRAINT translation_key_check CHECK (key NOT LIKE '%.%'),
  CONSTRAINT translation_type_dot_check CHECK (type NOT LIKE '%.%')
);

CREATE INDEX IF NOT EXISTS translation_type_idx ON translation (type);
CREATE INDEX IF NOT EXISTS translation_key_idx ON translation (key);
CREATE INDEX IF NOT EXISTS translation_active_idx ON translation (active);

INSERT INTO translation (id, type, key, data, active, created_by, created_on, updated_by, updated_on)
VALUES (
  'app_name',
  'app',
  'name',
  '{"en-US":"YourAppName","en-CA":"YourAppName","hi-IN":"आपका ऐप"}'::jsonb,
  TRUE,
  'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO translation (id, type, key, data, active, created_by, created_on, updated_by, updated_on)
VALUES (
  'auth_signIn',
  'auth',
  'signIn',
  '{"en-US":"Sign in","en-CA":"Sign in","hi-IN":"साइन इन"}'::jsonb,
  TRUE,
  'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO translation (id, type, key, data, active, created_by, created_on, updated_by, updated_on)
VALUES (
  'auth_signUp',
  'auth',
  'signUp',
  '{"en-US":"Sign up","en-CA":"Sign up","hi-IN":"साइन अप"}'::jsonb,
  TRUE,
  'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO translation (id, type, key, data, active, created_by, created_on, updated_by, updated_on)
VALUES (
  'auth_forgotPassword',
  'auth',
  'forgotPassword',
  '{"en-US":"Forgot password","en-CA":"Forgot password","hi-IN":"पासवर्ड भूल गए"}'::jsonb,
  TRUE,
  'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO translation (id, type, key, data, active, created_by, created_on, updated_by, updated_on)
VALUES (
  'auth_sendOtp',
  'auth',
  'sendOtp',
  '{"en-US":"Send OTP","en-CA":"Send OTP","hi-IN":"ओटीपी भेजें"}'::jsonb,
  TRUE,
  'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO translation (id, type, key, data, active, created_by, created_on, updated_by, updated_on)
VALUES (
  'auth_resetPasswordSuccess',
  'auth',
  'resetPasswordSuccess',
  '{"en-US":"Your password was reset successfully","en-CA":"Your password was reset successfully","hi-IN":"आपका पासवर्ड सफलतापूर्वक रीसेट हो गया है"}'::jsonb,
  TRUE,
  'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO translation (id, type, key, data, active, created_by, created_on, updated_by, updated_on)
VALUES (
  'setting_language',
  'setting',
  'language',
  '{"en-US":"Language","en-CA":"Language","hi-IN":"भाषा"}'::jsonb,
  TRUE,
  'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO translation (id, type, key, data, active, created_by, created_on, updated_by, updated_on)
VALUES (
  'common_save',
  'common',
  'save',
  '{"en-US":"Save","en-CA":"Save","hi-IN":"सहेजें"}'::jsonb,
  TRUE,
  'System', now(), 'System', now()
)
ON CONFLICT (id) DO NOTHING;
