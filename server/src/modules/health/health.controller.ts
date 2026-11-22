import { Request, Response } from 'express';
import { checkDatabaseHealth } from '../../db/prisma';
import { sendSuccess } from '../../utils/response';

export class HealthController {
  async getHealth(req: Request, res: Response): Promise<void> {
    // Public liveness probe: expose no environment, memory or build details.
    sendSuccess(res, {
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  }

  async getDatabaseHealth(req: Request, res: Response): Promise<void> {
    const dbStatus = await checkDatabaseHealth();
    // Never return raw driver errors to an unauthenticated caller; they can
    // disclose hostnames, credentials in connection strings or schema layout.
    sendSuccess(res, {
      database: dbStatus.connected ? 'connected' : 'disconnected',
      latencyMs: dbStatus.latencyMs
    }, dbStatus.connected ? 200 : 503);
  }
}

export const healthController = new HealthController();
