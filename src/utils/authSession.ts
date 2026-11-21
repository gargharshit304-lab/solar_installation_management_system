import { UserProfile, UserRole } from '../types';

export interface AuthSession {
  token: string;
  refreshToken: string;
  userId: string;
  email: string;
  role: UserRole;
  issuedAt: number;
  expiresAt: number;
  rememberMe: boolean;
}

const SESSION_STORAGE_KEY = 'solaros_auth_session';
const COOKIE_NAME = 'solaros_session_token';
const SIGNATURE_SECRET = 'solaros_secret_key_sunpower_solutions_2026';

// Base64URL encoding/decoding utilities
function base64UrlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let output = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      throw new Error('Illegal base64url string!');
  }
  return decodeURIComponent(escape(atob(output)));
}

// Simple deterministic cryptographic signature simulation for JWT format
function generateSignature(headerAndPayload: string): string {
  let hash = 0;
  const combined = headerAndPayload + ':' + SIGNATURE_SECRET;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return base64UrlEncode(Math.abs(hash).toString(16) + 's0lar0ss1gn');
}

/**
 * Creates a signed JWT-format session token
 */
export function createSessionToken(userId: string, email: string, role: UserRole, durationMs: number): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Date.now();
  const payload = {
    sub: userId,
    email,
    role,
    iat: now,
    exp: now + durationMs,
    iss: 'solaros.sunpowersolutions.in'
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = generateSignature(`${encodedHeader}.${encodedPayload}`);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verifies a JWT-format token's format, signature, and expiration
 */
export function verifySessionToken(token: string): { valid: boolean; payload: any | null; reason?: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, payload: null, reason: 'Malformed token structure' };
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = generateSignature(`${encodedHeader}.${encodedPayload}`);

    if (signature !== expectedSignature) {
      return { valid: false, payload: null, reason: 'Invalid cryptographic signature' };
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload.exp || Date.now() >= payload.exp) {
      return { valid: false, payload: null, reason: 'Token expired' };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, payload: null, reason: err.message || 'Verification failed' };
  }
}

/**
 * Persists session into localStorage and synchronization cookie
 */
export function persistSession(session: AuthSession): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

    // Also set a session cookie for direct browser navigation and multi-tab sync
    const maxAgeSeconds = Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000));
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(session.token)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
  } catch (e) {
    console.warn('Failed to persist session to browser storage:', e);
  }
}

/**
 * Retrieves the stored session from localStorage or cookie
 */
export function retrieveStoredSession(): AuthSession | null {
  try {
    const data = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!data) return null;

    const session: AuthSession = JSON.parse(data);
    if (!session || !session.token || !session.userId) {
      clearStoredSession();
      return null;
    }

    return session;
  } catch (e) {
    clearStoredSession();
    return null;
  }
}

/**
 * Completely clears and revokes session from browser storage and cookies
 */
export function clearStoredSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  } catch (e) {
    console.warn('Failed to clear session storage:', e);
  }
}

/**
 * Generates a full AuthSession object
 */
export function generateAuthSession(user: UserProfile, rememberMe = false): AuthSession {
  // Session duration: 30 days if rememberMe, otherwise 24 hours
  const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const now = Date.now();
  const token = createSessionToken(user.id, user.email, user.role, durationMs);
  const refreshToken = base64UrlEncode(`ref_${user.id}_${now}_${Math.random().toString(36).substring(2)}`);

  return {
    token,
    refreshToken,
    userId: user.id,
    email: user.email,
    role: user.role,
    issuedAt: now,
    expiresAt: now + durationMs,
    rememberMe
  };
}
