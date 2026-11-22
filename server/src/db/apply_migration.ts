import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import pg from 'pg';

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  try {
    const sqlPath = path.resolve(process.cwd(), 'server/src/db/migrations/20261122_add_seed_batch_tracking.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    console.log('Applying migration: 20261122_add_seed_batch_tracking.sql...');
    await client.query(sql);
    console.log('✅ Migration applied successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
