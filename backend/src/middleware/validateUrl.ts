import type { Request, Response, NextFunction } from 'express';

// ─────────────────────────────────────────────────────────
//  URL Validation Middleware
// ─────────────────────────────────────────────────────────

const BLOCKED_HOSTS = [
  'localhost',
  '0.0.0.0',
  '::1',
  '[::1]',
  '169.254.',
  '10.',
  '192.168.',
  '172.16.',
  '172.17.',
  '172.18.',
  '172.19.',
  '172.20.',
  '172.21.',
  '172.22.',
  '172.23.',
  '172.24.',
  '172.25.',
  '172.26.',
  '172.27.',
  '172.28.',
  '172.29.',
  '172.30.',
  '172.31.',
];

export function validateUrl(req: Request, res: Response, next: NextFunction): void {
  const rawUrl = (req.body?.url || req.query?.url) as string | undefined;

  if (!rawUrl || typeof rawUrl !== 'string') {
    res.status(400).json({
      error: 'INVALID_URL',
      message: 'A valid URL is required.',
    });
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    res.status(400).json({
      error: 'INVALID_URL',
      message: 'The provided string is not a valid URL.',
    });
    return;
  }

  // Only allow http/https
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    res.status(400).json({
      error: 'INVALID_PROTOCOL',
      message: 'Only HTTP and HTTPS URLs are supported.',
    });
    return;
  }

  // Block internal/private IPs (SSRF protection)
  const rawHost = parsed.hostname.toLowerCase();
  const cleanHost = rawHost.replace(/^\[|\]$/g, '');
  const isBlocked =
    BLOCKED_HOSTS.some((b) => rawHost === b || rawHost.startsWith(b) || cleanHost === b || cleanHost.startsWith(b)) ||
    cleanHost.startsWith('127.') ||
    cleanHost.startsWith('0.');

  if (isBlocked) {
    res.status(403).json({
      error: 'FORBIDDEN_HOST',
      message: 'This host is not allowed.',
    });
    return;
  }

  // Sanitize and attach parsed URL
  const trimmedUrl = rawUrl.trim();
  if (req.body) req.body.url = trimmedUrl;
  if (req.query) req.query.url = trimmedUrl;
  next();
}
