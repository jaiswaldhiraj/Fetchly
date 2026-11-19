import type { Request, Response, NextFunction } from 'express';
import { analyzeUrl } from '../services/ytdlp.service';
import { extractWithBrowser, browserResultToMediaInfo } from '../services/browser.service';
import { cacheGet, cacheSet, makeCacheKey } from '../services/cache.service';
import { HttpError } from '../middleware/errorHandler';
import type { MediaInfo } from '../types';

// ─────────────────────────────────────────────────────────
//  POST /api/analyze
//  Strategy: try yt-dlp first → fall back to Playwright browser extraction
// ─────────────────────────────────────────────────────────
export async function analyze(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { url } = req.body as { url: string };

    // Check cache first
    const cacheKey = makeCacheKey('analyze', encodeURIComponent(url));
    const cached = await cacheGet<MediaInfo>(cacheKey);

    if (cached) {
      res.json({ ...cached, cached: true });
      return;
    }

    let info: MediaInfo;
    let usedFallback = false;

    // ── Strategy 1: yt-dlp ──────────────────────────────
    try {
      info = await analyzeUrl(url);
    } catch (ytdlpErr) {
      const errMsg = (ytdlpErr as Error).message || '';
      console.warn(`[Analyze] yt-dlp failed: ${errMsg.slice(0, 120)} — trying browser fallback`);

      // Only use browser fallback for network/connection/bot-detection errors
      // Not for "video deleted" or "unsupported URL" errors
      const isNetworkBlock =
        errMsg.includes('410') ||
        errMsg.includes('403') ||
        errMsg.includes('ConnectionReset') ||
        errMsg.includes('SSL') ||
        errMsg.includes('HTTP Error') ||
        errMsg.includes('Unable to download webpage') ||
        errMsg.includes('Cloudflare');

      if (!isNetworkBlock) {
        // Re-throw if it's not a network block (unsupported URL, deleted video, etc.)
        throw ytdlpErr;
      }

      // ── Strategy 2: Playwright browser fallback ──────
      console.log(`[Analyze] Using Playwright browser extraction for: ${url}`);
      const browserResult = await extractWithBrowser(url, 30000);

      if (!browserResult.formats || browserResult.formats.length === 0) {
        throw new Error('Could not extract any video streams from this page. The video may require login or is behind a CAPTCHA.');
      }

      info = browserResultToMediaInfo(browserResult);
      usedFallback = true;
    }

    // Cache result
    await cacheSet(cacheKey, info);

    res.json({ ...info, ...(usedFallback ? { extractedBy: 'browser' } : {}) });
  } catch (err) {
    const message = (err as Error).message || 'Failed to analyze URL';

    if (message.includes('Unsupported URL') || message.includes('no suitable')) {
      next(new HttpError('This URL is not supported or the content is unavailable.', 422, 'UNSUPPORTED_URL'));
    } else if (message.includes('Private video') || message.includes('Sign in') || message.includes('account')) {
      next(new HttpError('This content requires authentication, is private, or requires age verification.', 403, 'PRIVATE_CONTENT'));
    } else if (message.includes('CAPTCHA') || message.includes('login')) {
      next(new HttpError(message, 403, 'BROWSER_BLOCKED'));
    } else if (message.includes('410') || message.includes('Gone')) {
      next(new HttpError('This video has been deleted or permanently removed (HTTP 410 Gone).', 410, 'CONTENT_REMOVED'));
    } else if (message.includes('not found') || message.includes('404')) {
      next(new HttpError('Content not found. The URL may be invalid or has been deleted.', 404, 'NOT_FOUND'));
    } else if (message.includes('Geo-restricted') || message.includes('blocked in your country') || message.includes('region')) {
      next(new HttpError('This video is not accessible in your region due to geographical restrictions.', 403, 'GEO_BLOCKED'));
    } else {
      next(new HttpError(message, 500, 'ANALYZE_ERROR'));
    }
  }
}
