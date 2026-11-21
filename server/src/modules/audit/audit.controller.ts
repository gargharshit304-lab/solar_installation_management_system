import { Request, Response, NextFunction } from 'express';
import { auditService } from './audit.service';
import { sendSuccess } from '../../utils/response';

export class AuditController {
  async getLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const entity = req.query.entity as string | undefined;
      const action = req.query.action as string | undefined;
      const actorId = req.query.actorId as string | undefined;

      const { logs, total } = await auditService.getLogs({
        page,
        limit,
        entity,
        action,
        actorId
      });

      sendSuccess(res, logs, 200, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      });
    } catch (err) {
      next(err);
    }
  }
}

export const auditController = new AuditController();
