import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function inspect() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const cols = await pool.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'auth' AND table_name = 'users'
    ORDER BY ordinal_position;
  `);
  console.log('AUTH.USERS COLUMNS:');
  for (const c of cols.rows) {
    console.log(`- ${c.column_name}: ${c.data_type} (nullable: ${c.is_nullable}, default: ${c.column_default})`);
  }
  await pool.end();
}
inspect().catch(console.error);
