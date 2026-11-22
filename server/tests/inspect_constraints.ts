import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function inspect() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const constraints = await pool.query(`
    SELECT conname, contype, pg_get_constraintdef(c.oid)
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    WHERE conrelid IN ('employees'::regclass, 'profiles'::regclass);
  `);
  console.log('CONSTRAINTS ON EMPLOYEES & PROFILES:');
  for (const c of constraints.rows) {
    console.log(`- ${c.conname} (${c.contype}): ${c.pg_get_constraintdef}`);
  }
  await pool.end();
}
inspect().catch(console.error);
