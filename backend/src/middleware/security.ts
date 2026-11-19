import helmet from 'helmet';
import type { Request, Response, NextFunction } from 'express';
import { config } from '../config';

// ─────────────────────────────────────────────────────────
//  Security Middleware
// ─────────────────────────────────────────────────────────

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

/**
 * Admin API key guard — attach to any admin route.
 */
export function requireAdminKey(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-admin-key'] || req.headers['admin-key'];

  if (!key || key !== config.adminApiKey) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Valid admin API key required.',
    });
    return;
  }

  next();
}

/**
 * Strip dangerous characters from string body fields (XSS prevention).
 */
export function sanitizeBody(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        // Remove script tags and common XSS vectors
        req.body[key] = req.body[key]
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      }
    }
  }
  next();
}
