import type { Request, Response, NextFunction } from 'express';

// ─────────────────────────────────────────────────────────
//  Global Error Handler Middleware
// ─────────────────────────────────────────────────────────

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const isDev = process.env.NODE_ENV === 'development';

  console.error(`[Error] ${req.method} ${req.path} — ${err.message}`);
  if (isDev) console.error(err.stack);

  res.status(statusCode).json({
    error: err.code || 'INTERNAL_ERROR',
    message: err.message || 'An unexpected error occurred.',
    ...(isDev && { stack: err.stack }),
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found.`,
  });
}

export class HttpError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 500, code = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'HttpError';
  }
}
