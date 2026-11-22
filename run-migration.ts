import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Never embed database credentials in source. Provide DATABASE_URL via the
// environment (or a local .env file that is gitignored).
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL must be set before running the migration script.');
}

async function runMigration() {
  console.log('Connecting to database...');
  
  const pool = new pg.Pool({
    connectionString: DATABASE_URL,
    // Verify the server certificate unless explicitly opted out for a local
    // self-signed development database.
    ssl: process.env.DATABASE_SSL_NO_VERIFY === 'true'
      ? { rejectUnauthorized: false }
      : { rejectUnauthorized: true },
    connectionTimeoutMillis: 30000,
  });

  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      console.log('✓ Database connection successful');
    } finally {
      client.release();
    }

    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter, log: ['warn', 'error'] });

    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ Prisma connection successful');

    // Try to run a simple query to verify tables exist
    const tables = await prisma.$queryRaw<Array<{table_name: string}>>`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    console.log('\nExisting tables:');
    tables.forEach(t => console.log('  -', t.table_name));

    await prisma.$disconnect();
    await pool.end();
  } catch (err: any) {
    console.error('✗ Migration failed:', err.message);
    console.error('Code:', err.code);
    if (err.detail) console.error('Detail:', err.detail);
    process.exit(1);
  }
}

runMigration();