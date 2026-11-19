import type { Request, Response } from 'express';
import os from 'os';
import {
  getDownloadsToday,
  getHistoryCount,
  getTopPlatforms,
} from '../services/history.service';

// ─────────────────────────────────────────────────────────
//  GET /api/admin/stats
// ─────────────────────────────────────────────────────────
export function adminStats(_req: Request, res: Response): void {
  const downloadsToday = getDownloadsToday();
  const downloadsTotal = getHistoryCount();
  const topPlatforms = getTopPlatforms(5);

  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memUsagePercent = Math.round(((totalMem - freeMem) / totalMem) * 100);

  res.json({
    downloadsToday,
    downloadsTotal,
    activeUsers: 0, // Would require session tracking
    topPlatforms,
    serverStatus: {
      uptime: Math.floor(process.uptime()),
      memoryUsage: memUsagePercent,
      platform: os.platform(),
      nodeVersion: process.version,
    },
  });
}
