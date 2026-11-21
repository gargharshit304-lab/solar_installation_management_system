import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { requestIdMiddleware } from './middleware/requestId.middleware';
import { generalRateLimiter } from './middleware/rateLimiter';
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

// 1. Trust proxy in production
app.set('trust proxy', 1);

// 2. Global Request ID Tracing
app.use(requestIdMiddleware);

// 3. CORS Configuration
app.use(cors({
  origin: [env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id']
}));

// 4. Request Parsers
app.use(cookieParser(env.COOKIE_SECRET));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Rate Limiting
app.use('/api/', generalRateLimiter);

// 6. OpenAPI Documentation Route
app.get('/api/v1/docs/openapi.json', (req, res) => {
  res.json(openApiSpec);
});

// 7. Core Application API Routes (v1)
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

// 8. 404 Catch-All Handler
app.use((req, res, next) => {
  next(new AppError(404, 'ROUTE_NOT_FOUND', `Cannot ${req.method} ${req.originalUrl}`));
});

// 9. Centralized Error Handler
app.use(errorHandler);
