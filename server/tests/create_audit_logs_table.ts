import dotenv from 'dotenv';
dotenv.config();
import { pool } from '../src/db/prisma';

async function main() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
        actor_name VARCHAR(150) NOT NULL,
        actor_role VARCHAR(50) NOT NULL,
        permission_used VARCHAR(100),
        action VARCHAR(100) NOT NULL,
        entity VARCHAR(50) NOT NULL,
        entity_id VARCHAR(50),
        previous_state JSONB,
        new_state JSONB,
        reason TEXT,
        ip_address VARCHAR(45),
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        is_demo BOOLEAN DEFAULT false,
        seed_batch_id VARCHAR(50)
      );
      CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
    `);
    console.log('✅ Created audit_logs table and indexes in Supabase PostgreSQL.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
