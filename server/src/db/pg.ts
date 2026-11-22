import pg from 'pg';
import { env } from '../config/env';

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  // Validate the database TLS certificate by default. Disabling verification
  // is possible only through an explicit opt-out for local development.
  ssl: env.DATABASE_SSL_NO_VERIFY
    ? { rejectUnauthorized: false }
    : { rejectUnauthorized: true },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10
});

export const db = {
  query: <T extends pg.QueryResultRow = pg.QueryResultRow>(text: string, params?: unknown[]) =>
    pool.query<T>(text, params),

  withTransaction: async <T>(work: (client: pg.PoolClient) => Promise<T>): Promise<T> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  health: async () => {
    const started = Date.now();
    await pool.query('SELECT 1');
    return { connected: true, latencyMs: Date.now() - started };
  },

  pool
};
