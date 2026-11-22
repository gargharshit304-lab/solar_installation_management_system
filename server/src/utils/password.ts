import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Securely hashes a plain-text password using bcrypt with high cost factor
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

/**
 * Verifies a plain-text password against a stored bcrypt hash
 */
export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

/**
 * Synchronous variant used only for one-time module initialization.
 */
export function hashPasswordSync(plainText: string): string {
  return bcrypt.hashSync(plainText, SALT_ROUNDS);
}
