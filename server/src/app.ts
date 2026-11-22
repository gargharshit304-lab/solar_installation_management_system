import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { env } from './config/env';
import { requestIdMiddleware } from './middleware/requestId.middleware';
import { generalRateLimiter } from './middleware/rateLimiter';
import { csrfProtection } from './middleware/csrf.middleware';
import { requireAuth } from './middleware/auth.middleware';
import { requireRole } from './middleware/rbac.middleware';
import { errorHandler } from './middleware/error.middleware';
import { AppError } from './utils/response';

import { healthRoutes } from './modules/health/health.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/users/user.routes';
import { rbacRoutes } from './modules/rbac/rbac.routes';
import { auditRoutes } from './modules/audit/audit.routes';
import { inventoryRoutes } from './modules/inventory/inventory.routes';
import { customerRoutes } from './modules/customers/customer.routes';
import { surveyRoutes } from './modules/surveys/survey.routes';
import { installationRoutes } from './modules/installations/installation.routes';
import { dispatchRoutes } from './modules/dispatch/dispatch.routes';
import { financeRoutes } from './modules/finance/finance.routes';
import { employeeRoutes } from './modules/employees/employee.routes';
import openApiSpec from './docs/openapi.json';

export const app = express();

// 0. Do not advertise the framework.
app.disable('x-powered-by');

// 1. Security headers
app.use(helmet());

// 2. Trust proxy (configurable; disabled by default)
if (env.TRUST_PROXY) {
  app.set('trust proxy', 1);
}

// 3. Global Request ID Tracing
app.use(requestIdMiddleware);

// 4. CORS Configuration
// Only the configured client origin is trusted. Localhost origins are allowed
// in development builds only, never in production.
const allowedOrigins = Array.from(new Set([
  env.CLIENT_ORIGIN,
  ...(env.NODE_ENV === 'production'
    ? []
    : ['http://localhost:5173', 'http://127.0.0.1:5173'])
]));

app.use(cors({
<<<<<<< HEAD
  origin: [env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'],
=======
  origin: (origin, callback) => {
    // Same-origin/non-browser requests (no Origin header) are allowed.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new AppError(403, 'CORS_ORIGIN_DENIED', 'Origin is not allowed.'));
  },
>>>>>>> b2c2306c5ef5e15a46b91a0ea638cc1a9d802d69
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-CSRF-Token']
}));

// 5. Request Parsers
// Hard-cap the body size so a large/misconfigured limit cannot be used for
// memory-exhaustion denial of service.
function cappedBodyLimit(configured: string): string {
  const match = /^(\d+)\s*(kb|mb)$/i.exec(configured.trim());
  if (!match) return '256kb';
  const bytes = parseInt(match[1], 10) * (match[2].toLowerCase() === 'mb' ? 1024 * 1024 : 1024);
  return bytes > 1024 * 1024 ? '1mb' : configured.trim();
}
const bodyLimit = cappedBodyLimit(env.BODY_LIMIT);
app.use(cookieParser(env.COOKIE_SECRET));
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

// 6. Rate Limiting
app.use('/api/', generalRateLimiter);

// 7. CSRF protection for cookie-authenticated state changes
app.use(csrfProtection);

// 8. OpenAPI Documentation (owner-only)
app.get('/api/v1/docs/openapi.json', requireAuth, requireRole(['owner_admin']), (req, res) => {
  res.json(openApiSpec);
});

// 9. Core Application API Routes (v1)
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/rbac', rbacRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/surveys', surveyRoutes);
app.use('/api/v1/installations', installationRoutes);
app.use('/api/v1/dispatch', dispatchRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/employees', employeeRoutes);

// 10. 404 Catch-All Handler
app.use((req, res, next) => {
  next(new AppError(404, 'ROUTE_NOT_FOUND', `Cannot ${req.method} ${req.originalUrl}`));
});

// 11. Centralized Error Handler
app.use(errorHandler);
