-- SolarOS core reduction
-- Removes duplicate workflow/auth tables and adds compact tables needed by the frontend.

BEGIN;

DROP TABLE IF EXISTS warehouse_transfers CASCADE;
DROP TABLE IF EXISTS warehouse_tasks CASCADE;
DROP TABLE IF EXISTS stock_count_sessions CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS service_updates CASCADE;
DROP TABLE IF EXISTS enquiry_activities CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Supabase Auth bridge
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_auth_user_id_fkey'
      AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_auth_user_id_fkey
      FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE quotations
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS customer_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  site_label TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  pincode TEXT,
  property_type TEXT,
  sanctioned_load_kw NUMERIC(14,2),
  phase_type TEXT CHECK (phase_type IN ('single_phase','three_phase')),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS follow_up_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
  assigned_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT follow_up_priority_check CHECK (priority IN ('low','medium','high','urgent')),
  CONSTRAINT follow_up_status_check CHECK (status IN ('pending','completed','overdue','rescheduled'))
);

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  activity_type TEXT NOT NULL,
  actor_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  summary TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_entity
  ON activities(entity_type, entity_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_details
  ON activities USING GIN(details);

CREATE TABLE IF NOT EXISTS notification_reads (
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (notification_id, user_id)
);

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::JSONB,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  stage TEXT NOT NULL,
  planned_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT payment_milestone_stage_check CHECK (stage IN ('advance','dispatch_milestone','final_commissioning')),
  CONSTRAINT payment_milestone_status_check CHECK (status IN ('pending','partially_paid','paid','overdue','waived'))
);

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES payment_milestones(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS payment_stage TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS installation_time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID NOT NULL REFERENCES installations(id) ON DELETE RESTRICT,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  hourly_rate_snapshot NUMERIC(14,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT installation_time_order_check CHECK (ended_at IS NULL OR ended_at >= started_at)
);

ALTER TABLE stock_movements
  ADD COLUMN IF NOT EXISTS warehouse_id VARCHAR(50);

ALTER TABLE product_serial_numbers
  ADD COLUMN IF NOT EXISTS warehouse_id VARCHAR(50);

ALTER TABLE warranty_records
  ADD COLUMN IF NOT EXISTS serial_number_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'warranty_records_serial_number_id_fkey'
      AND conrelid = 'warranty_records'::regclass
  ) THEN
    ALTER TABLE warranty_records
      ADD CONSTRAINT warranty_records_serial_number_id_fkey
      FOREIGN KEY (serial_number_id) REFERENCES product_serial_numbers(id) ON DELETE RESTRICT;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS reservation_serial_numbers (
  reservation_id VARCHAR(50) NOT NULL REFERENCES stock_reservations(id) ON DELETE CASCADE,
  serial_number_id UUID NOT NULL REFERENCES product_serial_numbers(id) ON DELETE RESTRICT,
  PRIMARY KEY (reservation_id, serial_number_id)
);

CREATE TABLE IF NOT EXISTS dispatch_serial_numbers (
  dispatch_item_id UUID NOT NULL REFERENCES dispatch_items(id) ON DELETE CASCADE,
  serial_number_id UUID NOT NULL REFERENCES product_serial_numbers(id) ON DELETE RESTRICT,
  PRIMARY KEY (dispatch_item_id, serial_number_id)
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END $$;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid=c.relnamespace
    JOIN pg_attribute a ON a.attrelid=c.oid
    WHERE n.nspname='public' AND c.relkind='r'
      AND a.attname='updated_at'
      AND NOT EXISTS (
        SELECT 1 FROM pg_trigger t
        WHERE t.tgrelid=c.oid
          AND t.tgname='set_updated_at_trigger'
      )
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at_trigger BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION set_updated_at()', r.table_name);
  END LOOP;
END $$;

CREATE OR REPLACE VIEW v_order_balance AS
SELECT
  o.id,
  o.order_number,
  o.customer_id,
  o.total_order_value,
  COALESCE(SUM(p.amount) FILTER (WHERE p.amount IS NOT NULL), 0) AS advance_amount_paid,
  GREATEST(o.total_order_value - COALESCE(SUM(p.amount), 0), 0) AS outstanding_balance,
  CASE
    WHEN COALESCE(SUM(p.amount), 0) <= 0 THEN 'unpaid'
    WHEN COALESCE(SUM(p.amount), 0) >= o.total_order_value THEN 'fully_paid'
    ELSE 'partially_paid'
  END AS payment_status
FROM orders o
LEFT JOIN payments p ON p.order_id=o.id
WHERE o.deleted_at IS NULL
GROUP BY o.id, o.order_number, o.customer_id, o.total_order_value;

CREATE OR REPLACE VIEW v_project_profitability AS
SELECT
  o.id AS order_id,
  o.order_number,
  o.customer_id,
  o.total_order_value AS revenue,
  COALESCE(SUM(oi.quantity*oi.unit_price),0) AS equipment_cost,
  COALESCE((
    SELECT SUM(EXTRACT(EPOCH FROM (COALESCE(t.ended_at,NOW())-t.started_at))/3600*t.hourly_rate_snapshot)
    FROM installation_time_logs t
    JOIN installations i ON i.id=t.installation_id
    WHERE i.order_id=o.id
  ),0) AS labour_cost,
  COALESCE((
    SELECT SUM(e.amount) FROM expenses e
    WHERE e.related_order_id=o.id
  ),0) AS other_expenses,
  o.total_order_value
    - COALESCE(SUM(oi.quantity*oi.unit_price),0)
    - COALESCE((
      SELECT SUM(EXTRACT(EPOCH FROM (COALESCE(t.ended_at,NOW())-t.started_at))/3600*t.hourly_rate_snapshot)
      FROM installation_time_logs t
      JOIN installations i ON i.id=t.installation_id
      WHERE i.order_id=o.id
    ),0)
    - COALESCE((
      SELECT SUM(e.amount) FROM expenses e
      WHERE e.related_order_id=o.id
    ),0) AS project_profit
FROM orders o
LEFT JOIN order_items oi ON oi.order_id=o.id
WHERE o.deleted_at IS NULL
GROUP BY o.id,o.order_number,o.customer_id,o.total_order_value;

CREATE OR REPLACE VIEW v_low_stock AS
SELECT
  p.id AS product_id,
  p.sku,
  p.name,
  p.category,
  s.quantity_on_hand,
  s.quantity_reserved,
  p.minimum_stock_threshold,
  CASE
    WHEN s.quantity_on_hand <= 0 THEN 'out_of_stock'
    WHEN s.quantity_on_hand <= p.minimum_stock_threshold THEN 'low_stock'
    ELSE 'in_stock'
  END AS stock_status
FROM inventory_stock s
JOIN products p ON p.id=s.product_id;

INSERT INTO system_settings(key,value,description)
VALUES
  ('company','{"name":"SunPower Solutions Pvt Ltd","gstin":"27AABCS1429P1ZK","state":"Maharashtra","monthly_target":40}','Company configuration'),
  ('tax','{"intra_state_cgst":6.9,"intra_state_sgst":6.9,"inter_state_igst":13.8}','Tax configuration'),
  ('warranty','{"Solar Panels":240,"Inverters":24,"Batteries":24,"Charge Controllers":24}','Warranty months by category'),
  ('fault_codes','{"ERR-INV-04":"Grid Over-Voltage","ERR-EARTH-01":"Earthing Leakage","COMM-WIFI-FAIL":"Datalogger Offline","BAT-BMS-TRIP":"Battery BMS Trip"}','Fault code lookup')
ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value,description=EXCLUDED.description;

COMMIT;
