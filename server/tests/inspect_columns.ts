import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  
  const tables = [
    'roles', 'profiles', 'employees', 'customers', 'customer_sites', 
    'enquiries', 'quotations', 'quotation_items', 'orders', 'order_items', 
    'site_surveys', 'survey_assignments', 'installations', 'installation_technicians',
    'products', 'product_serial_numbers', 'inventory_stock', 'warehouses', 'storage_locations', 'suppliers',
    'dispatches', 'dispatch_items', 'invoices', 'payments', 'expenses',
    'warranty_records', 'service_tickets', 'notifications', 'activities'
  ];

  for (const table of tables) {
    const colRes = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position;
    `, [table]);

    console.log(`\n=== TABLE: ${table} ===`);
    for (const col of colRes.rows) {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
    }
  }

  // Also inspect existing rows in roles and profiles
  const rolesRes = await client.query(`SELECT id, name, permissions FROM roles`);
  console.log('\n=== EXISTING ROLES IN DB ===');
  for (const r of rolesRes.rows) {
    console.log(`- ${r.id}: ${r.name}`);
  }

  const profilesRes = await client.query(`SELECT id, full_name, email, role_id, department FROM profiles`);
  console.log('\n=== EXISTING PROFILES IN DB ===');
  for (const p of profilesRes.rows) {
    console.log(`- ${p.id} | ${p.full_name} | ${p.email} | ${p.role_id} | ${p.department}`);
  }

  const empRes = await client.query(`SELECT id, employee_code, first_name, last_name, email, department, designation, role_id, profile_id FROM employees`);
  console.log('\n=== EXISTING EMPLOYEES IN DB ===');
  for (const e of empRes.rows) {
    console.log(`- ${e.id} | ${e.employee_code} | ${e.first_name} ${e.last_name} | ${e.email} | ${e.department} | ${e.designation} | ${e.role_id} | profile: ${e.profile_id}`);
  }

  client.release();
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
