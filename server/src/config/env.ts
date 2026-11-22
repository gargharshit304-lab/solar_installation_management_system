import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const requiredSecret = (name: string) =>
  z.string().min(32, `${name} must be at least 32 characters long`);

const envSchema = z.object({
  PORT: z.string().default('5000').transform(val => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_URL_TEST: z.string().optional(),
  DATABASE_SSL: z.enum(['true', 'false']).default('true').transform(val => val === 'true'),
  // Explicit opt-out only for local self-signed databases. Never enable in production.
  DATABASE_SSL_NO_VERIFY: z.enum(['true', 'false']).default('false').transform(val => val === 'true'),

  // Secrets must be provided explicitly; insecure defaults are never used.
  JWT_ACCESS_SECRET: requiredSecret('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: requiredSecret('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('1d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  JWT_ISSUER: z.string().default('solaros.sunpowersolutions.in'),
  JWT_AUDIENCE: z.string().default('solaros.api'),
  COOKIE_SECRET: requiredSecret('COOKIE_SECRET'),

  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  TRUST_PROXY: z.enum(['true', 'false']).default('false').transform(val => val === 'true'),
  BODY_LIMIT: z.string().default('1mb'),

  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(val => parseInt(val, 10)),
  RATE_LIMIT_MAX: z.string().default('100').transform(val => parseInt(val, 10)),
  AUTH_RATE_LIMIT_MAX: z.string().default('15').transform(val => parseInt(val, 10)),

  // Development-only auth fallback when PostgreSQL is unreachable.
  // When enabled, DEV_FALLBACK_PASSWORD is required so no built-in password exists.
  DEV_AUTH_FALLBACK: z.enum(['true', 'false']).default('false').transform(val => val === 'true'),
  DEV_FALLBACK_PASSWORD: z.string().min(12).optional(),

  // Optional password applied to seeded demo accounts. When absent, seeded
  // accounts receive an unusable random password and must be reset.
  SEED_ADMIN_PASSWORD: z.string().min(12).optional(),

  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_JWKS_URL: z.string().url().optional(),
  SUPABASE_JWT_ISSUER: z.string().optional(),
  SUPABASE_JWT_AUDIENCE: z.string().default('authenticated'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Environment configuration validation error:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
