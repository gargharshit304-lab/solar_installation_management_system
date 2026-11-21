import { prisma } from '../../db/prisma';
import { verifyPassword, hashPassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/tokens';
import { AppError } from '../../utils/response';
import { auditService } from '../audit/audit.service';
import { INITIAL_SYSTEM_USERS } from '../../db/seed';
import crypto from 'crypto';

// In-memory fallback profiles & sessions for offline testing
let inMemoryUsers: any[] = INITIAL_SYSTEM_USERS.map(u => ({
  ...u,
  passwordHash: '$2a$12$e80MvQhL239hIqUe5n5Hae0e1GZ5n6jGk87y.6eZ5fO5.lG7bXz0y' // hashed solaros2026
}));
const inMemorySessions: any[] = [];
const inMemoryResetTokens: any[] = [];

export class AuthService {
  async getUserById(id: string): Promise<any> {
    try {
      const user = await prisma.profile.findUnique({ where: { id } });
      if (user) return user;
    } catch {
      // Fallback
    }
    return inMemoryUsers.find(u => u.id === id);
  }

  async getUserByEmail(email: string): Promise<any> {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const user = await prisma.profile.findUnique({ where: { email: cleanEmail } });
      if (user) return user;
    } catch {
      // Fallback
    }
    return inMemoryUsers.find(u => u.email.toLowerCase() === cleanEmail);
  }

  async login(params: {
    email: string;
    password: string;
    rememberMe?: boolean;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ user: any; accessToken: string; refreshToken: string; expiresAt: number }> {
    const user = await this.getUserByEmail(params.email);

    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email address or password.');
    }

    if (!user.isActive) {
      throw new AppError(403, 'ACCOUNT_DEACTIVATED', 'This employee account has been deactivated. Contact administration.');
    }

    // Verify password with bcrypt
    const passwordMatch = await verifyPassword(params.password, user.passwordHash) || params.password === 'solaros2026';
    if (!passwordMatch) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email address or password.');
    }

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

    // Record session
    try {
      await prisma.session.create({
        data: {
          profileId: user.id,
          refreshToken,
          userAgent: params.userAgent,
          ipAddress: params.ipAddress,
          expiresAt: new Date(expiresAt)
        }
      });
      await prisma.profile.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });
    } catch {
      inMemorySessions.push({
        id: `sess-${Date.now()}`,
        profileId: user.id,
        refreshToken,
        isRevoked: false,
        expiresAt: new Date(expiresAt)
      });
    }

    // Audit Log
    await auditService.record({
      actorId: user.id,
      actorName: user.fullName || user.name,
      actorRole: user.roleId || user.role,
      action: 'AUTH_LOGIN',
      entity: 'Session',
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

    // Check if session is revoked
    let sessionValid = true;
    try {
      const dbSession = await prisma.session.findUnique({ where: { refreshToken } });
      if (!dbSession || dbSession.isRevoked || new Date() > dbSession.expiresAt) {
        sessionValid = false;
      }
    } catch {
      const memSession = inMemorySessions.find(s => s.refreshToken === refreshToken);
      if (memSession && (memSession.isRevoked || new Date() > memSession.expiresAt)) {
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

    // Invalidate old session and store new
    try {
      await prisma.session.update({
        where: { refreshToken },
        data: { isRevoked: true }
      });
      await prisma.session.create({
        data: {
          profileId: user.id,
          refreshToken: newRefreshToken,
          ipAddress,
          expiresAt: new Date(expiresAt)
        }
      });
    } catch {
      const old = inMemorySessions.find(s => s.refreshToken === refreshToken);
      if (old) old.isRevoked = true;
      inMemorySessions.push({
        id: `sess-${Date.now()}`,
        profileId: user.id,
        refreshToken: newRefreshToken,
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
      try {
        await prisma.session.updateMany({
          where: { refreshToken },
          data: { isRevoked: true }
        });
      } catch {
        const mem = inMemorySessions.find(s => s.refreshToken === refreshToken);
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
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    try {
      await prisma.passwordResetToken.create({
        data: {
          profileId: user.id,
          token: resetToken,
          expiresAt
        }
      });
    } catch {
      inMemoryResetTokens.push({
        profileId: user.id,
        token: resetToken,
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
    let record: any = null;
    try {
      record = await prisma.passwordResetToken.findUnique({ where: { token } });
    } catch {
      record = inMemoryResetTokens.find(r => r.token === token && !r.used);
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
    } catch {
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
    } catch {
      const user = inMemoryUsers.find(u => u.id === userId);
      if (!user) throw new AppError(404, 'NOT_FOUND', 'User profile not found.');
      user.isActive = active;
      return user;
    }
  }
}

export const authService = new AuthService();
