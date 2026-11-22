import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function inspectAuth() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    const res = await pool.query("SELECT id, email, created_at FROM auth.users LIMIT 5");
    console.log('AUTH USERS IN SUPABASE:', res.rows);
  } catch (err: any) {
    console.error('Error querying auth.users:', err.message);
  } finally {
    await pool.end();
  }
}
inspectAuth();
