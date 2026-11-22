import { app } from './app';
import { env } from './config/env';

console.log('[Index] Starting server...');

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('[Index] App imported, calling listen...');

const server = app.listen(env.PORT, () => {
  console.log('[Index] Server listening on port', env.PORT);
  console.log(`====================================================`);
  console.log(`☀️  SolarOS Enterprise Backend Server`);
  console.log(`    Company:     SunPower Solutions`);
  console.log(`    Environment: ${env.NODE_ENV}`);
  console.log(`    Port:        ${env.PORT}`);
  console.log(`    API Root:    http://localhost:${env.PORT}/api/v1`);
  console.log(`    Health:      http://localhost:${env.PORT}/api/v1/health`);
  console.log(`    OpenAPI Doc: http://localhost:${env.PORT}/api/v1/docs/openapi.json`);
  console.log(`====================================================`);
});

// Graceful Shutdown
const handleShutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down SolarOS backend gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));