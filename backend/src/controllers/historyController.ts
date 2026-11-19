import type { Request, Response, NextFunction } from 'express';
import {
  getHistory,
  getHistoryCount,
  deleteHistoryEntry,
  clearHistory,
} from '../services/history.service';
import { HttpError } from '../middleware/errorHandler';

// ─────────────────────────────────────────────────────────
//  GET /api/history
// ─────────────────────────────────────────────────────────
export function history(req: Request, res: Response): void {
  const limit = Math.min(parseInt(req.query.limit as string || '50', 10), 200);
  const offset = parseInt(req.query.offset as string || '0', 10);

  const items = getHistory(limit, offset);
  const total = getHistoryCount();

  res.json({ items, total, limit, offset });
}

// ─────────────────────────────────────────────────────────
//  DELETE /api/history/:id
// ─────────────────────────────────────────────────────────
export function deleteHistory(req: Request, res: Response, next: NextFunction): void {
  const { id } = req.params;

  if (!id) {
    next(new HttpError('ID is required', 400, 'MISSING_ID'));
    return;
  }

  const deleted = deleteHistoryEntry(id);

  if (!deleted) {
    next(new HttpError('History entry not found', 404, 'NOT_FOUND'));
    return;
  }

  res.json({ success: true, id });
}

// ─────────────────────────────────────────────────────────
//  DELETE /api/history
// ─────────────────────────────────────────────────────────
export function clearAllHistory(_req: Request, res: Response): void {
  clearHistory();
  res.json({ success: true, message: 'History cleared.' });
}
