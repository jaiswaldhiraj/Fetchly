import app from './app';
import { config } from './config';
import { getDatabase } from './config/database';
import { getRedisClient } from './config/redis';

async function bootstrap(): Promise<void> {
  // Initialize database
  getDatabase();

  // Try to connect Redis (non-blocking)
  getRedisClient().catch(() => {
    // Redis is optional
  });

  const server = app.listen(config.port, () => {
    console.log(`
╔═══════════════════════════════════════╗
║          FetchLy Backend API          ║
╠═══════════════════════════════════════╣
║  Port    : ${config.port}                       ║
║  Env     : ${config.nodeEnv.padEnd(10)}              ║
║  DB      : SQLite                     ║
╚═══════════════════════════════════════╝
    `);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM received — shutting down gracefully');
    server.close(() => {
      console.log('[Server] HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    server.close(() => process.exit(0));
  });
}

bootstrap().catch((err) => {
  console.error('[Bootstrap] Fatal error:', err);
  process.exit(1);
});
