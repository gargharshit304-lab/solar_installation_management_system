import { prisma } from '../../db/prisma';
import { verifyPassword, hashPassword, hashPasswordSync } from '../../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/tokens';
import { AppError } from '../../utils/response';
import { auditService } from '../audit/audit.service';
import { INITIAL_SYSTEM_USERS } from '../../db/seed';
import { env } from '../../config/env';
import crypto from 'crypto';

// Development-only fallback. Disabled by default and never enabled in production.
const allowDevFallback = env.NODE_ENV !== 'production' && env.DEV_AUTH_FALLBACK;

// In-memory fallback profiles & sessions for offline development only.
// There is deliberately no built-in password: the fallback is only usable when
// the operator supplies DEV_FALLBACK_PASSWORD. Otherwise the hash is empty and
// every fallback login is rejected.
const devFallbackPasswordHash = allowDevFallback && env.DEV_FALLBACK_PASSWORD
  ? hashPasswordSync(env.DEV_FALLBACK_PASSWORD)
  : '';
let inMemoryUsers: any[] = INITIAL_SYSTEM_USERS.map(u => ({
  ...u,
  passwordHash: devFallbackPasswordHash
}));
const inMemorySessions: any[] = [];
const inMemoryResetTokens: any[] = [];

// A real bcrypt hash of an unguessable random value, used only to equalize
// login timing for accounts that do not exist.
const DUMMY_PASSWORD_HASH = hashPasswordSync(crypto.randomBytes(32).toString('hex'));

// In-flight brute-force protection. Keyed by normalized email and applied to
// unknown accounts too, so the response never reveals whether the email exists.
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;

function recordFailedLogin(key: string): void {
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record || record.lockedUntil < now && record.count >= MAX_LOGIN_ATTEMPTS) {
    loginAttempts.set(key, { count: 1, lockedUntil: 0 });
    return;
  }
  const count = record.count + 1;
  loginAttempts.set(key, {
    count,
    lockedUntil: count >= MAX_LOGIN_ATTEMPTS ? now + LOGIN_LOCKOUT_MS : 0
  });
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export class AuthService {
  async getUserById(id: string): Promise<any> {
    try {
      const user = await prisma.profile.findUnique({ where: { id } });
      if (user) return user;
    } catch {
      // Fall through to (optional) development fallback
    }
    if (!allowDevFallback) return null;
    return inMemoryUsers.find(u => u.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<any> {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const user = await prisma.profile.findUnique({ where: { email: cleanEmail } });
      if (user) return user;
    } catch {
      // Fall through to (optional) development fallback
    }
    if (!allowDevFallback) return null;
    return inMemoryUsers.find(u => u.email.toLowerCase() === cleanEmail) || null;
  }

  async login(params: {
    email: string;
    password: string;
    rememberMe?: boolean;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ user: any; accessToken: string; refreshToken: string; expiresAt: number }> {
    const attemptKey = params.email.trim().toLowerCase();
    const attempt = loginAttempts.get(attemptKey);
    if (attempt && attempt.lockedUntil > Date.now()) {
      throw new AppError(429, 'ACCOUNT_LOCKED', 'Too many failed login attempts. Please try again later.');
    }

    const user = await this.getUserByEmail(params.email);

    // Always perform one bcrypt comparison, even for unknown or inactive
    // accounts, so response timing does not reveal which emails exist.
    const passwordMatch = await verifyPassword(
      params.password,
      user?.passwordHash || DUMMY_PASSWORD_HASH
    );

    // Use a single generic error for unknown accounts and bad passwords to
    // prevent account enumeration. Deactivated accounts are rejected the same way.
    if (!user || !user.isActive || !passwordMatch) {
      recordFailedLogin(attemptKey);
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email address or password.');
    }

<<<<<<< HEAD
    if (!user.isActive) {
      throw new AppError(403, 'ACCOUNT_DEACTIVATED', 'This employee account has been deactivated. Contact administration.');
    }

    // Verify password with bcrypt
    const passwordMatch = await verifyPassword(params.password, user.passwordHash);
    if (!passwordMatch) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email address or password.');
    }
=======
    loginAttempts.delete(attemptKey);
>>>>>>> b2c2306c5ef5e15a46b91a0ea638cc1a9d802d69

    // Generate tokens
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.roleId || user.role,
      roleTitle: user.roleTitle,
      department: user.department,
      name: user.fullName || user.name
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const durationDays = params.rememberMe ? 30 : 1;
    const expiresAt = Date.now() + durationDays * 86400000;
    const refreshTokenHash = hashToken(refreshToken);

    // Record session (only the hash of the refresh token is persisted)
    try {
      await prisma.session.create({
        data: {
          profileId: user.id,
          refreshToken: refreshTokenHash,
          userAgent: params.userAgent,
          ipAddress: params.ipAddress,
          expiresAt: new Date(expiresAt)
        }
      });
      await prisma.profile.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });
    } catch (err) {
      if (!allowDevFallback) throw err;
      inMemorySessions.push({
        id: `sess-${Date.now()}`,
        profileId: user.id,
        refreshToken: refreshTokenHash,
        isRevoked: false,
        expiresAt: new Date(expiresAt)
      });
    }

    // Audit Log
    await auditService.record({
      actorId: user.id,
      actorName: user.fullName || user.name,
      actorRole: user.roleId || user.role,
      department: user.department || 'Executive Management',
      action: 'AUTH_LOGIN',
      entity: 'Session',
      entityId: user.id,
      result: 'SUCCESS',
      ipAddress: params.ipAddress,
      reason: `Successful authentication via credentials (RememberMe: ${!!params.rememberMe})`
    });

    return {
      user: {
        id: user.id,
        name: user.fullName || user.name,
        email: user.email,
        role: user.roleId || user.role,
        roleTitle: user.roleTitle,
        department: user.department,
        avatar: user.avatarUrl || user.avatar,
        isActive: user.isActive,
        emailVerified: user.emailVerified
      },
      accessToken,
      refreshToken,
      expiresAt
    };
  }

  async refreshSession(refreshToken: string, ipAddress?: string): Promise<{ accessToken: string; refreshToken: string; expiresAt: number; user: any }> {
    const verified = verifyRefreshToken(refreshToken);
    if (!verified) {
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Session refresh token is invalid or expired.');
    }

    const user = await this.getUserById(verified.sub);
    if (!user || !user.isActive) {
      throw new AppError(401, 'ACCOUNT_INACTIVE', 'User account is inactive or not found.');
    }

    // Check if session is revoked (refresh tokens are stored hashed)
    const refreshTokenHash = hashToken(refreshToken);
    let sessionValid = true;
    try {
      const dbSession = await prisma.session.findUnique({ where: { refreshToken: refreshTokenHash } });
      if (!dbSession || dbSession.isRevoked || new Date() > dbSession.expiresAt) {
        sessionValid = false;
      }
    } catch {
      if (!allowDevFallback) throw new AppError(503, 'DATABASE_UNAVAILABLE', 'Session store is temporarily unavailable.');
      const memSession = inMemorySessions.find(s => s.refreshToken === refreshTokenHash);
      if (!memSession || memSession.isRevoked || new Date() > memSession.expiresAt) {
        sessionValid = false;
      }
    }

    if (!sessionValid) {
      throw new AppError(401, 'SESSION_REVOKED', 'Session has been revoked or expired.');
    }

    // Rotate tokens
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.roleId || user.role,
      roleTitle: user.roleTitle,
      department: user.department,
      name: user.fullName || user.name
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);
    const expiresAt = Date.now() + 86400000;

    // Invalidate old session and store new (hashed)
    const newRefreshTokenHash = hashToken(newRefreshToken);
    try {
      await prisma.session.update({
        where: { refreshToken: refreshTokenHash },
        data: { isRevoked: true }
      });
      await prisma.session.create({
        data: {
          profileId: user.id,
          refreshToken: newRefreshTokenHash,
          ipAddress,
          expiresAt: new Date(expiresAt)
        }
      });
    } catch (err) {
      if (!allowDevFallback) throw err;
      const old = inMemorySessions.find(s => s.refreshToken === refreshTokenHash);
      if (old) old.isRevoked = true;
      inMemorySessions.push({
        id: `sess-${Date.now()}`,
        profileId: user.id,
        refreshToken: newRefreshTokenHash,
        isRevoked: false,
        expiresAt: new Date(expiresAt)
      });
    }

    return {
      user: {
        id: user.id,
        name: user.fullName || user.name,
        email: user.email,
        role: user.roleId || user.role,
        roleTitle: user.roleTitle,
        department: user.department,
        avatar: user.avatarUrl || user.avatar
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt
    };
  }

  async logout(refreshToken?: string, userId?: string, ipAddress?: string): Promise<void> {
    if (refreshToken) {
      const refreshTokenHash = hashToken(refreshToken);
      try {
        await prisma.session.updateMany({
          where: { refreshToken: refreshTokenHash },
          data: { isRevoked: true }
        });
      } catch {
        const mem = inMemorySessions.find(s => s.refreshToken === refreshTokenHash);
        if (mem) mem.isRevoked = true;
      }
    }

    if (userId) {
      const user = await this.getUserById(userId);
      if (user) {
        await auditService.record({
          actorId: user.id,
          actorName: user.fullName || user.name,
          actorRole: user.roleId || user.role,
          action: 'AUTH_LOGOUT',
          entity: 'Session',
          ipAddress,
          reason: 'Explicit user logout'
        });
      }
    }
  }

  async requestPasswordReset(email: string): Promise<{ resetToken: string }> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      // Return simulated success to prevent account enumeration
      return { resetToken: 'token_dispatched_if_account_exists' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    try {
      await prisma.passwordResetToken.create({
        data: {
          profileId: user.id,
          token: resetTokenHash,
          expiresAt
        }
      });
    } catch (err) {
      if (!allowDevFallback) throw err;
      inMemoryResetTokens.push({
        profileId: user.id,
        token: resetTokenHash,
        expiresAt,
        used: false
      });
    }

    await auditService.record({
      actorId: user.id,
      actorName: user.fullName || user.name,
      actorRole: user.roleId || user.role,
      action: 'PASSWORD_RESET_REQUEST',
      entity: 'Profile',
      entityId: user.id,
      reason: 'Password reset link generated'
    });

    return { resetToken };
  }

  async resetPassword(token: string, newPass: string): Promise<void> {
    const tokenHash = hashToken(token);
    let record: any = null;
    try {
      record = await prisma.passwordResetToken.findUnique({ where: { token: tokenHash } });
    } catch {
      if (!allowDevFallback) throw new AppError(503, 'DATABASE_UNAVAILABLE', 'Password reset is temporarily unavailable.');
      record = inMemoryResetTokens.find(r => r.token === tokenHash && !r.used);
    }

    if (!record || record.used || new Date() > record.expiresAt) {
      throw new AppError(400, 'INVALID_RESET_TOKEN', 'Password reset token is invalid or has expired.');
    }

    const newHash = await hashPassword(newPass);

    try {
      await prisma.profile.update({
        where: { id: record.profileId },
        data: { passwordHash: newHash }
      });
      await prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { used: true }
      });
      // Invalidate all active sessions for security
      await prisma.session.updateMany({
        where: { profileId: record.profileId },
        data: { isRevoked: true }
      });
    } catch (err) {
      if (!allowDevFallback) throw err;
      const user = inMemoryUsers.find(u => u.id === record.profileId);
      if (user) user.passwordHash = newHash;
      record.used = true;
    }

    await auditService.record({
      actorId: record.profileId,
      actorName: 'System User',
      actorRole: 'Security',
      action: 'PASSWORD_RESET_COMPLETED',
      entity: 'Profile',
      entityId: record.profileId,
      reason: 'Password successfully changed and previous sessions revoked'
    });
  }

  // Helper for admin to deactivate/activate account
  async setAccountActiveStatus(userId: string, active: boolean, actor: any): Promise<any> {
    try {
      const updated = await prisma.profile.update({
        where: { id: userId },
        data: { isActive: active }
      });
      if (!active) {
        // Revoke all sessions immediately on deactivation
        await prisma.session.updateMany({
          where: { profileId: userId },
          data: { isRevoked: true }
        });
      }
      await auditService.record({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: active ? 'ACCOUNT_ACTIVATED' : 'ACCOUNT_DEACTIVATED',
        entity: 'Profile',
        entityId: userId,
        newState: { isActive: active },
        reason: `Administrator action by ${actor.name}`
      });
      return updated;
    } catch (err) {
      if (!allowDevFallback) throw err;
      const user = inMemoryUsers.find(u => u.id === userId);
      if (!user) throw new AppError(404, 'NOT_FOUND', 'User profile not found.');
      user.isActive = active;
      return user;
    }
  }
}

export const authService = new AuthService();
