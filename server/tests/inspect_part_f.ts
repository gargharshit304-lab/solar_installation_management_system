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
  try {
    const prodCount = await client.query('SELECT COUNT(*) FROM products');
    console.log('Product count in PostgreSQL:', prodCount.rows[0].count);

    const prods = await client.query('SELECT id, sku, name, category, unit_cost, selling_price FROM products LIMIT 5');
    console.log('Sample products:', prods.rows);

    const empCount = await client.query('SELECT COUNT(*) FROM employees');
    console.log('Employee count in PostgreSQL:', empCount.rows[0].count);

    const emps = await client.query('SELECT id, employee_code, first_name, last_name, department, designation, role_id, hourly_rate FROM employees LIMIT 5');
    console.log('Sample employees:', emps.rows);

    // Check if order items store snapshot price
    const orderItems = await client.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'order_items\'');
    console.log('order_items columns:', orderItems.rows.map(r => r.column_name));

    // Check quotations items
    const quoteItems = await client.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'quotation_items\'');
    console.log('quotation_items columns:', quoteItems.rows.map(r => r.column_name));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
