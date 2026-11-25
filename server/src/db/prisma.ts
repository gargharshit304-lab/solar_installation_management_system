import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { env } from '../config/env';

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __pgPool: pg.Pool | undefined;
}

export const pool = global.__pgPool || new pg.Pool({
  connectionString: env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  ssl: { rejectUnauthorized: false }
});

if (env.NODE_ENV !== 'production') {
  global.__pgPool = pool;
}

const adapter = new PrismaPg(pool);

export const prisma = global.__prismaClient || new PrismaClient({
  adapter,
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
});

if (env.NODE_ENV !== 'production') {
  global.__prismaClient = prisma;
}

/**
 * Health check utility to probe the database connection
 */
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  latencyMs?: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return {
        connected: true,
        latencyMs: Date.now() - start
      };
    } finally {
      client.release();
    }
  } catch (err: any) {
    return {
      connected: false,
      latencyMs: Date.now() - start,
      error: err.message || 'Database connection probe failed'
    };
  }
}
