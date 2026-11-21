import { app } from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
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
