-- SolarOS Enterprise Migration: Seed Batch & Demo Tracking Columns
-- Safe, idempotent migration to support enterprise demo data isolation and clean rollback

DO $$ 
DECLARE 
  tbl TEXT;
  tbls TEXT[] := ARRAY[
    'roles', 'profiles', 'employees', 'customers', 'customer_sites', 
    'enquiries', 'quotations', 'quotation_items', 'orders', 'order_items', 
    'site_surveys', 'survey_assignments', 'installations', 'installation_technicians',
    'warehouses', 'storage_locations', 'suppliers', 'inventory_stock',
    'product_serial_numbers', 'dispatches', 'dispatch_items', 'invoices', 
    'payments', 'expenses', 'warranty_records', 'service_tickets', 
    'notifications', 'activities', 'operational_delegations'
  ];
BEGIN 
  FOREACH tbl IN ARRAY tbls LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;', tbl);
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS seed_batch_id VARCHAR(50);', tbl);
      EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (seed_batch_id) WHERE seed_batch_id IS NOT NULL;', 'idx_' || tbl || '_seed_batch', tbl);
    END IF;
  END LOOP;
END $$;
