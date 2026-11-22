import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });
import { db } from './pg';

async function main() {
  console.log('Optimizing pagination and search indexes in Supabase PostgreSQL...');

  const queries = [
    // 1. Customers pagination & filtering indexes
    `CREATE INDEX IF NOT EXISTS idx_customers_pagination ON customers (deleted_at, lead_status, city, created_at);`,
    `CREATE INDEX IF NOT EXISTS idx_customers_search ON customers (LOWER(full_name), LOWER(phone), LOWER(customer_code));`,

    // 2. Orders pagination & filtering indexes
    `CREATE INDEX IF NOT EXISTS idx_orders_pagination ON orders (deleted_at, order_status, payment_status, order_date);`,
    `CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders (customer_id);`,

    // 3. Employees search & pagination
    `CREATE INDEX IF NOT EXISTS idx_employees_department ON employees (department);`,
    `CREATE INDEX IF NOT EXISTS idx_employees_code ON employees (employee_code);`,

    // 4. Audit logs chronological index
    `CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp DESC);`
  ];

  for (const q of queries) {
    try {
      await db.query(q);
      console.log(`Executed: ${q.slice(0, 70)}...`);
    } catch (err: any) {
      console.warn(`Index query notice: ${err.message}`);
    }
  }

  console.log('PostgreSQL index optimization completed successfully.');
  process.exit(0);
}

main().catch(err => {
  console.error('Index migration failed:', err);
  process.exit(1);
});
