import { Request, Response, NextFunction } from 'express';
import { auditService } from './audit.service';
import { sendSuccess } from '../../utils/response';

export class AuditController {
  async getLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const entity = req.query.entity as string | undefined;
      const module = req.query.module as string | undefined;
      const action = req.query.action as string | undefined;
      const actorId = req.query.actorId as string | undefined;
      const department = req.query.department as string | undefined;
      const result = req.query.result as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const search = req.query.search as string | undefined;

      const { logs, total } = await auditService.getLogs({
        page,
        limit,
        entity,
        module,
        action,
        actorId,
        department,
        result,
        startDate,
        endDate,
        search
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
