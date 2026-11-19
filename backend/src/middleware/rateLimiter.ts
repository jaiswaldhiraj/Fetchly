import rateLimit from 'express-rate-limit';
import { config } from '../config';
import type { Request, Response } from 'express';

export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many requests. Please try again later.',
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP. Please wait before retrying.',
      retryAfter: Math.ceil(config.rateLimitWindowMs / 1000),
    });
  },
});

export const strictRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMITED',
    message: 'Too many download requests. Please wait a moment.',
  },
});
