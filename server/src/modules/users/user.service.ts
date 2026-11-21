import { prisma } from '../../db/prisma';
import { INITIAL_SYSTEM_USERS } from '../../db/seed';
import { authService } from '../auth/auth.service';

let inMemoryUsers: any[] = [...INITIAL_SYSTEM_USERS];

export class UserService {
  async getAllUsers(): Promise<any[]> {
    try {
      const users = await prisma.profile.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          roleId: true,
          roleTitle: true,
          department: true,
          avatarUrl: true,
          isActive: true,
          emailVerified: true,
          lastLoginAt: true
        }
      });
      return users.map(u => ({
        id: u.id,
        name: u.fullName,
        email: u.email,
        phone: u.phone,
        role: u.roleId,
        roleTitle: u.roleTitle,
        department: u.department,
        avatar: u.avatarUrl,
        isActive: u.isActive,
        emailVerified: u.emailVerified,
        lastLoginAt: u.lastLoginAt
      }));
    } catch {
      return inMemoryUsers.map(u => ({
        id: u.id,
        name: u.fullName,
        email: u.email,
        phone: u.phone,
        role: u.roleId,
        roleTitle: u.roleTitle,
        department: u.department,
        avatar: u.avatarUrl,
        isActive: u.isActive,
        emailVerified: u.emailVerified
      }));
    }
  }

  async setUserStatus(userId: string, active: boolean, actor: any): Promise<any> {
    return authService.setAccountActiveStatus(userId, active, actor);
  }
}

export const userService = new UserService();
