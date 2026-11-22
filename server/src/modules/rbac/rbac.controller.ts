import { Request, Response, NextFunction } from 'express';
import { rbacService } from './rbac.service';
import { sendSuccess } from '../../utils/response';

export class RbacController {
  async getRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roles = await rbacService.getRoleDefinitions();
      sendSuccess(res, roles);
    } catch (err) {
      next(err);
    }
  }

  async getVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const versionInfo = await rbacService.getRbacVersion();
      sendSuccess(res, versionInfo);
    } catch (err) {
      next(err);
    }
  }

  async updatePermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roleKey } = req.params;
      const { permissions } = req.body;
      const updatedRole = await rbacService.updateRolePermissions(String(roleKey), permissions, req.user);
      sendSuccess(res, updatedRole, 200);
    } catch (err) {
      next(err);
    }
  }

  async getDelegations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const delegations = await rbacService.getAllDelegations();
      sendSuccess(res, delegations);
    } catch (err) {
      next(err);
    }
  }

  async createDelegation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const delegation = await rbacService.createDelegation(req.body, req.user);
      sendSuccess(res, delegation, 201);
    } catch (err) {
      next(err);
    }
  }

  async revokeDelegation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const delegation = await rbacService.revokeDelegation(String(req.params.id), req.user);
      sendSuccess(res, delegation);
    } catch (err) {
      next(err);
    }
  }
}

export const rbacController = new RbacController();
