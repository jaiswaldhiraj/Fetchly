import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try loading .env from current directory, backend directory, or repo root
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend/.env'),
  path.resolve(__dirname, '../../.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  adminApiKey: process.env.ADMIN_API_KEY || 'change-this-secret-key',

  // Database
  databaseUrl: process.env.DATABASE_URL || './data/fetchly.db',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),

  // Tools
  ytdlpPath: process.env.YTDLP_PATH || 'yt-dlp',
  ffmpegPath: process.env.FFMPEG_PATH || 'ffmpeg',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Cookies (bypasses age verification, login walls, and platform bot gates)
  cookiesFromBrowser: process.env.COOKIES_FROM_BROWSER || '',
  cookiesPath: process.env.COOKIES_PATH || '',

  // Proxy (optional: socks5://... or http://... to bypass ISP SNI blocks)
  proxyUrl: process.env.PROXY_URL || process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '',

  // Cache TTL (seconds)
  cacheTtl: 300, // 5 minutes
};
