CREATE TABLE IF NOT EXISTS app_constants (
  id VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  code VARCHAR(100) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  name VARCHAR(255) NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by VARCHAR(255) NOT NULL DEFAULT 'System',
  updated_by VARCHAR(255) NOT NULL DEFAULT 'System',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT app_constants_pkey PRIMARY KEY (id),
  CONSTRAINT app_constants_type_code_unique UNIQUE (type, code),
  CONSTRAINT app_constants_id_check CHECK (id = type || '_' || code)
);

CREATE INDEX IF NOT EXISTS app_constants_type_idx ON app_constants (type);
CREATE INDEX IF NOT EXISTS app_constants_active_idx ON app_constants (active);

-- personas
INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('persona_admin', 'persona', 'admin', TRUE, 'admin', '{"en-US":"Admin"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('persona_user', 'persona', 'user', TRUE, 'user', '{"en-US":"User"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('persona_trader', 'persona', 'trader', TRUE, 'trader', '{"en-US":"Trader"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- languages
INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('language_en-US', 'language', 'en-US', TRUE, 'English', '{"en-US":"English"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- active status
INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('active_status_true', 'active_status', 'true', TRUE, 'active', '{"en-US":"Active"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('active_status_false', 'active_status', 'false', TRUE, 'inactive', '{"en-US":"Inactive"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- workflow status
INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('workflow_status_draft', 'workflow_status', 'draft', TRUE, 'draft', '{"en-US":"Draft"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('workflow_status_not_started', 'workflow_status', 'not_started', TRUE, 'not_started', '{"en-US":"Not Started"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('workflow_status_in_progress', 'workflow_status', 'in_progress', TRUE, 'in_progress', '{"en-US":"In Progress"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('workflow_status_approved', 'workflow_status', 'approved', TRUE, 'approved', '{"en-US":"Approved"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('workflow_status_rejected', 'workflow_status', 'rejected', TRUE, 'rejected', '{"en-US":"Rejected"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('workflow_status_completed', 'workflow_status', 'completed', TRUE, 'completed', '{"en-US":"Completed"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('workflow_status_cancelled', 'workflow_status', 'cancelled', TRUE, 'cancelled', '{"en-US":"Cancelled"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('workflow_status_on_hold', 'workflow_status', 'on_hold', TRUE, 'on_hold', '{"en-US":"On Hold"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- transaction status
INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('transaction_status_not_started', 'transaction_status', 'not_started', TRUE, 'not_started', '{"en-US":"Not Started"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('transaction_status_processing', 'transaction_status', 'processing', TRUE, 'processing', '{"en-US":"Processing"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('transaction_status_success', 'transaction_status', 'success', TRUE, 'success', '{"en-US":"Success"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('transaction_status_failed', 'transaction_status', 'failed', TRUE, 'failed', '{"en-US":"Failed"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('transaction_status_cancelled', 'transaction_status', 'cancelled', TRUE, 'cancelled', '{"en-US":"Cancelled"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('transaction_status_refunded', 'transaction_status', 'refunded', TRUE, 'refunded', '{"en-US":"Refunded"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('transaction_status_partially_refunded', 'transaction_status', 'partially_refunded', TRUE, 'partially_refunded', '{"en-US":"Partially Refunded"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- order status
INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('order_status_not_started', 'order_status', 'not_started', TRUE, 'not_started', '{"en-US":"Not Started"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('order_status_placed', 'order_status', 'placed', TRUE, 'placed', '{"en-US":"Placed"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('order_status_confirmed', 'order_status', 'confirmed', TRUE, 'confirmed', '{"en-US":"Confirmed"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('order_status_processing', 'order_status', 'processing', TRUE, 'processing', '{"en-US":"Processing"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('order_status_shipped', 'order_status', 'shipped', TRUE, 'shipped', '{"en-US":"Shipped"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('order_status_delivered', 'order_status', 'delivered', TRUE, 'delivered', '{"en-US":"Delivered"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('order_status_cancelled', 'order_status', 'cancelled', TRUE, 'cancelled', '{"en-US":"Cancelled"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('order_status_returned', 'order_status', 'returned', TRUE, 'returned', '{"en-US":"Returned"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- payment method
INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('payment_method_card', 'payment_method', 'card', TRUE, 'card', '{"en-US":"Card"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('payment_method_upi', 'payment_method', 'upi', TRUE, 'upi', '{"en-US":"UPI"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('payment_method_netbanking', 'payment_method', 'netbanking', TRUE, 'netbanking', '{"en-US":"Net Banking"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('payment_method_wallet', 'payment_method', 'wallet', TRUE, 'wallet', '{"en-US":"Wallet"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('payment_method_cash', 'payment_method', 'cash', TRUE, 'cash', '{"en-US":"Cash"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('payment_method_paypal', 'payment_method', 'paypal', TRUE, 'paypal', '{"en-US":"PayPal"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- priority
INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('priority_low', 'priority', 'low', TRUE, 'low', '{"en-US":"Low"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('priority_medium', 'priority', 'medium', TRUE, 'medium', '{"en-US":"Medium"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('priority_high', 'priority', 'high', TRUE, 'high', '{"en-US":"High"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('priority_urgent', 'priority', 'urgent', TRUE, 'urgent', '{"en-US":"Urgent"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- visibility
INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('visibility_public', 'visibility', 'public', TRUE, 'public', '{"en-US":"Public"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('visibility_private', 'visibility', 'private', TRUE, 'private', '{"en-US":"Private"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('visibility_internal', 'visibility', 'internal', TRUE, 'internal', '{"en-US":"Internal"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- gender
INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('gender_male', 'gender', 'male', TRUE, 'male', '{"en-US":"Male"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('gender_female', 'gender', 'female', TRUE, 'female', '{"en-US":"Female"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('gender_other', 'gender', 'other', TRUE, 'other', '{"en-US":"Other"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('gender_prefer_not_to_say', 'gender', 'prefer_not_to_say', TRUE, 'prefer_not_to_say', '{"en-US":"Prefer not to say"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- verification status
INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('verification_status_unverified', 'verification_status', 'unverified', TRUE, 'unverified', '{"en-US":"Unverified"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('verification_status_pending', 'verification_status', 'pending', TRUE, 'pending', '{"en-US":"Pending"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('verification_status_verified', 'verification_status', 'verified', TRUE, 'verified', '{"en-US":"Verified"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('verification_status_rejected', 'verification_status', 'rejected', TRUE, 'rejected', '{"en-US":"Rejected"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- auth provider
INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('auth_provider_password', 'auth_provider', 'password', TRUE, 'password', '{"en-US":"Password"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('auth_provider_google', 'auth_provider', 'google', TRUE, 'google', '{"en-US":"Google"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('auth_provider_apple', 'auth_provider', 'apple', TRUE, 'apple', '{"en-US":"Apple"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('auth_provider_mfa', 'auth_provider', 'mfa', TRUE, 'mfa', '{"en-US":"MFA"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('auth_provider_otp', 'auth_provider', 'otp', TRUE, 'otp', '{"en-US":"OTP"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('auth_provider_sso', 'auth_provider', 'sso', TRUE, 'sso', '{"en-US":"SSO"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('auth_provider_biometric', 'auth_provider', 'biometric', TRUE, 'biometric', '{"en-US":"Biometric"}'::jsonb)
ON CONFLICT (id) DO NOTHING;



-- address type
INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('address_type_home', 'address_type', 'home', TRUE, 'home', '{"en-US":"Home"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('address_type_work', 'address_type', 'work', TRUE, 'work', '{"en-US":"Work"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('address_type_billing', 'address_type', 'billing', TRUE, 'billing', '{"en-US":"Billing"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('address_type_shipping', 'address_type', 'shipping', TRUE, 'shipping', '{"en-US":"Shipping"}'::jsonb)
ON CONFLICT (id) DO NOTHING;



-- device type
INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('device_type_web', 'device_type', 'web', TRUE, 'web', '{"en-US":"Web"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('device_type_ios', 'device_type', 'ios', TRUE, 'ios', '{"en-US":"iOS"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('device_type_android', 'device_type', 'android', TRUE, 'android', '{"en-US":"Android"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- discount type
INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('discount_type_percentage', 'discount_type', 'percentage', TRUE, 'percentage', '{"en-US":"Percentage"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('discount_type_flat', 'discount_type', 'flat', TRUE, 'flat', '{"en-US":"Flat"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- media type
INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('media_type_image', 'media_type', 'image', TRUE, 'image', '{"en-US":"Image"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('media_type_video', 'media_type', 'video', TRUE, 'video', '{"en-US":"Video"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('media_type_document', 'media_type', 'document', TRUE, 'document', '{"en-US":"Document"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_constants (id, type, code, active, name, data)
VALUES ('media_type_audio', 'media_type', 'audio', TRUE, 'audio', '{"en-US":"Audio"}'::jsonb)
ON CONFLICT (id) DO NOTHING;


