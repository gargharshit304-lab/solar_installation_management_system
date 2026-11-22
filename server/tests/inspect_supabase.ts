import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';

async function main() {
  console.log('Connecting to PostgreSQL using DATABASE_URL...');
  console.log('Target host:', process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL.replace('postgresql://', 'http://')).host : 'NONE');
  
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected successfully to Supabase PostgreSQL!');

    // Check all tables in public schema
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n--- Existing Tables in public schema ---');
    for (const row of tablesRes.rows) {
      const countRes = await client.query(`SELECT count(*) FROM "${row.table_name}"`);
      console.log(`- ${row.table_name}: ${countRes.rows[0].count} rows`);
    }

    // Check columns and foreign keys for employee and customer tables if any
    const fkRes = await client.query(`
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';
    `);

    console.log('\n--- Foreign Keys in public schema ---');
    for (const row of fkRes.rows) {
      console.log(`- ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
    }

    client.release();
    await pool.end();
  } catch (err: any) {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  }
}

main();
