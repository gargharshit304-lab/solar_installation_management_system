import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import { env } from '../config/env';
import { UserRole } from '../config/constants';

export interface SupabaseJWTPayload extends JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
  role_title?: string;
  department?: string;
  name?: string;
  user_metadata?: {
    full_name?: string;
    role_title?: string;
    department?: string;
  };
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
}

const SUPABASE_JWKS_URL = 'https://gcsxtzfiylrjbxxtrrlq.supabase.co/auth/v1/.well-known/jwks.json';

const jwks = createRemoteJWKSet(new URL(SUPABASE_JWKS_URL));

export async function verifySupabaseToken(token: string): Promise<SupabaseJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: 'https://gcsxtzfiylrjbxxtrrlq.supabase.co/auth/v1',
      audience: 'authenticated',
    });
    return payload as unknown as SupabaseJWTPayload;
  } catch (err) {
    console.error('Supabase token verification failed:', err);
    return null;
  }
}

export function mapSupabasePayloadToTokenPayload(payload: SupabaseJWTPayload): {
  sub: string;
  email: string;
  role: UserRole;
  roleTitle?: string;
  department?: string;
  name: string;
} {
  const userMetadata = payload.user_metadata || {};
  const appMetadata = payload.app_metadata || {};

  return {
    sub: payload.sub,
    email: payload.email,
    role: (payload.role as UserRole) || ('sales_exec' as UserRole),
    roleTitle: payload.role_title || userMetadata.role_title,
    department: payload.department || userMetadata.department,
    name: payload.name || userMetadata.full_name || payload.email.split('@')[0],
  };
}