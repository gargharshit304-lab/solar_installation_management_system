import { UserProfile, UserRole } from '../types';

/**
 * Client-side session metadata.
 *
 * Authentication material (access/refresh tokens) is held ONLY in HttpOnly
 * cookies set by the server. It must never be written to localStorage or
 * readable cookies, because any script on the page could exfiltrate it.
 * `token` and `refreshToken` are retained as empty strings solely for
 * backwards-compatible call signatures; they are never populated.
 */
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

interface StoredSessionMetadata {
  userId: string;
  email: string;
  role: UserRole;
  issuedAt: number;
  expiresAt: number;
  rememberMe: boolean;
}

/**
 * Persists non-sensitive session metadata for UX (instant route restoration).
 * The server-side HttpOnly cookie remains the only authentication authority.
 */
export function persistSession(session: AuthSession): void {
  try {
    const metadata: StoredSessionMetadata = {
      userId: session.userId,
      email: session.email,
      role: session.role,
      issuedAt: session.issuedAt,
      expiresAt: session.expiresAt,
      rememberMe: session.rememberMe
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(metadata));
    // Remove any bearer tokens persisted by older builds.
    localStorage.removeItem('solaros_auth_token');
  } catch (e) {
    console.warn('Failed to persist session metadata:', e);
  }
}

/**
 * Retrieves stored session metadata. Returns null when absent or expired.
 */
export function retrieveStoredSession(): AuthSession | null {
  try {
    const data = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!data) return null;

    const stored = JSON.parse(data) as Partial<StoredSessionMetadata>;
    if (!stored || !stored.userId || !stored.expiresAt) {
      clearStoredSession();
      return null;
    }
    if (Date.now() >= stored.expiresAt) {
      clearStoredSession();
      return null;
    }

    return {
      token: '',
      refreshToken: '',
      userId: stored.userId,
      email: stored.email || '',
      role: stored.role as UserRole,
      issuedAt: stored.issuedAt || 0,
      expiresAt: stored.expiresAt,
      rememberMe: Boolean(stored.rememberMe)
    };
  } catch (e) {
    clearStoredSession();
    return null;
  }
}

/**
 * Clears local session metadata.
 */
export function clearStoredSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem('solaros_auth_token');
  } catch (e) {
    console.warn('Failed to clear session storage:', e);
  }
}

/**
 * Builds session metadata after the server has authenticated the user.
 * Tokens stay in HttpOnly cookies; nothing secret is returned here.
 */
export function generateAuthSession(user: UserProfile, rememberMe = false): AuthSession {
  const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const now = Date.now();

  return {
    token: '',
    refreshToken: '',
    userId: user.id,
    email: user.email,
    role: user.role,
    issuedAt: now,
    expiresAt: now + durationMs,
    rememberMe
  };
}
