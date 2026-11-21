import { Request, Response } from 'express';
import { checkDatabaseHealth } from '../../db/prisma';
import { sendSuccess } from '../../utils/response';

export class HealthController {
  async getHealth(req: Request, res: Response): Promise<void> {
    const memory = process.memoryUsage();
    sendSuccess(res, {
      status: 'healthy',
      system: 'SolarOS Enterprise Backend',
      company: 'SunPower Solutions',
      version: '1.0.0',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      memory: {
        rssMb: Math.round(memory.rss / (1024 * 1024)),
        heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024))
      }
    });
  }

  async getDatabaseHealth(req: Request, res: Response): Promise<void> {
    const dbStatus = await checkDatabaseHealth();
    sendSuccess(res, {
      database: dbStatus.connected ? 'connected' : 'disconnected',
      latencyMs: dbStatus.latencyMs,
      error: dbStatus.error,
      engine: 'PostgreSQL / Prisma ORM'
    }, dbStatus.connected ? 200 : 503);
  }
}

export const healthController = new HealthController();
