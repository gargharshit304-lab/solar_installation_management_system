import dotenv from 'dotenv';
dotenv.config();
import { db } from './pg';

export async function migratePartF() {
  console.log('Running Part F database migrations (Product editing & Employee career management)...');

  // 1. Enhance products table
  await db.query(`
    ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS brand character varying(100),
      ADD COLUMN IF NOT EXISTS model character varying(100),
      ADD COLUMN IF NOT EXISTS description text,
      ADD COLUMN IF NOT EXISTS standard_cost numeric(12, 2),
      ADD COLUMN IF NOT EXISTS tax_rate numeric(5, 2) DEFAULT 18.00,
      ADD COLUMN IF NOT EXISTS reorder_threshold integer DEFAULT 15,
      ADD COLUMN IF NOT EXISTS maximum_stock_threshold integer DEFAULT 500,
      ADD COLUMN IF NOT EXISTS status character varying(30) DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS location_bin character varying(50) DEFAULT 'MAIN-A1',
      ADD COLUMN IF NOT EXISTS preferred_warehouse_id uuid,
      ADD COLUMN IF NOT EXISTS preferred_warehouse_name character varying(150) DEFAULT 'Central Warehouse',
      ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
  `);
  console.log('✓ Enhanced products table with brand, model, description, standard_cost, tax_rate, etc.');

  // Set default standard_cost where null
  await db.query(`
    UPDATE products 
    SET standard_cost = unit_cost * 0.95 
    WHERE standard_cost IS NULL AND unit_cost IS NOT NULL;
  `);

  // 2. Create product_price_history table
  await db.query(`
    CREATE TABLE IF NOT EXISTS product_price_history (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      product_sku character varying(100),
      product_name character varying(200),
      previous_unit_cost numeric(12, 2),
      new_unit_cost numeric(12, 2),
      previous_selling_price numeric(12, 2),
      new_selling_price numeric(12, 2),
      previous_standard_cost numeric(12, 2),
      new_standard_cost numeric(12, 2),
      changed_by_id character varying(100),
      changed_by_name character varying(200),
      reason text,
      notes text,
      effective_date timestamp with time zone DEFAULT now(),
      created_at timestamp with time zone DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_product_price_history_product_id ON product_price_history (product_id);
    CREATE INDEX IF NOT EXISTS idx_product_price_history_created_at ON product_price_history (created_at DESC);
  `);
  console.log('✓ Created product_price_history table and indexes');

  // 3. Enhance employees table
  await db.query(`
    ALTER TABLE employees
      ADD COLUMN IF NOT EXISTS team character varying(100),
      ADD COLUMN IF NOT EXISTS reporting_manager_id uuid,
      ADD COLUMN IF NOT EXISTS reporting_manager_name character varying(150),
      ADD COLUMN IF NOT EXISTS work_location character varying(100) DEFAULT 'Pune Central HQ',
      ADD COLUMN IF NOT EXISTS employment_type character varying(50) DEFAULT 'full_time',
      ADD COLUMN IF NOT EXISTS address text,
      ADD COLUMN IF NOT EXISTS emergency_contact_name character varying(150),
      ADD COLUMN IF NOT EXISTS emergency_contact_relation character varying(50),
      ADD COLUMN IF NOT EXISTS emergency_contact_phone character varying(30),
      ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
  `);
  console.log('✓ Enhanced employees table with team, reporting manager, address, emergency contact, etc.');

  // 4. Create employee_career_history table
  await db.query(`
    CREATE TABLE IF NOT EXISTS employee_career_history (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      event_type character varying(50) NOT NULL,
      previous_designation character varying(150),
      new_designation character varying(150),
      previous_department character varying(100),
      new_department character varying(100),
      previous_team character varying(100),
      new_team character varying(100),
      previous_role_id character varying(50),
      new_role_id character varying(50),
      previous_hourly_rate numeric(10, 2),
      new_hourly_rate numeric(10, 2),
      reporting_manager_id character varying(100),
      reporting_manager_name character varying(150),
      effective_date date NOT NULL DEFAULT CURRENT_DATE,
      authorized_by_id character varying(100),
      authorized_by_name character varying(150),
      reason text,
      notes text,
      created_at timestamp with time zone DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_employee_career_history_employee_id ON employee_career_history (employee_id);
    CREATE INDEX IF NOT EXISTS idx_employee_career_history_created_at ON employee_career_history (created_at DESC);
  `);
  console.log('✓ Created employee_career_history table and indexes');

  // 5. Seed initial onboarding events for existing employees if empty
  const careerCountRes = await db.query('SELECT COUNT(*) FROM employee_career_history');
  if (parseInt(careerCountRes.rows[0].count, 10) === 0) {
    console.log('Seeding initial hire events for existing employees...');
    await db.query(`
      INSERT INTO employee_career_history (
        employee_id, event_type, new_designation, new_department, new_role_id,
        new_hourly_rate, effective_date, authorized_by_name, reason, notes
      )
      SELECT 
        id, 'hire', designation, department, role_id,
        hourly_rate, hire_date, 'System Initialization', 'Initial Onboarding Record', 'SolarOS System Employment Baseline'
      FROM employees
      LIMIT 20;
    `);
    console.log('✓ Seeded initial career records for baseline employees');
  }

  console.log('Part F migrations completed successfully.');
}

if (process.argv[1]?.includes('migrate_part_f_history')) {
  migratePartF()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
