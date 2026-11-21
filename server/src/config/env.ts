import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform(val => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/solaros?schema=public'),
  DATABASE_URL_TEST: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().default('solaros_access_secret_sunpower_solutions_2026_super_secure_key'),
  JWT_REFRESH_SECRET: z.string().default('solaros_refresh_secret_sunpower_solutions_2026_super_secure_key'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('1d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  COOKIE_SECRET: z.string().default('solaros_cookie_secret_sunpower_solutions_2026'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(val => parseInt(val, 10)),
  RATE_LIMIT_MAX: z.string().default('100').transform(val => parseInt(val, 10)),
  AUTH_RATE_LIMIT_MAX: z.string().default('15').transform(val => parseInt(val, 10)),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Environment configuration validation error:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
