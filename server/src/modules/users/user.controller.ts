import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { sendSuccess } from '../../utils/response';

export class UserController {
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      sendSuccess(res, users);
    } catch (err) {
      next(err);
    }
  }

  async setStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { active } = req.body;
      const updated = await userService.setUserStatus(userId, active, req.user);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
