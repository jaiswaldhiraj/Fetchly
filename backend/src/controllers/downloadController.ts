import type { Request, Response, NextFunction } from 'express';
import https from 'https';
import http from 'http';
import { createDownloadProcess, createAudioProcess, getCommonYtdlpArgs, spawnYtdlp } from '../services/ytdlp.service';
import { addToHistory } from '../services/history.service';
import { HttpError } from '../middleware/errorHandler';
import type { DownloadRequest, AudioRequest } from '../types';

// ─────────────────────────────────────────────────────────
//  Helper: stream a direct URL (browser-extracted) to response
// ─────────────────────────────────────────────────────────
function streamDirectUrl(
  directUrl: string,
  sourceUrl: string,
  res: Response,
  onDone: () => void,
  onError: (msg: string) => void
): void {
  const parsed = new URL(directUrl);
  const lib = parsed.protocol === 'https:' ? https : http;

  const origin = new URL(sourceUrl);
  const referer = `${origin.protocol}//${origin.hostname}/`;

  const options = {
    hostname: parsed.hostname,
    path: parsed.pathname + parsed.search,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Referer': referer,
      'Origin': referer.replace(/\/$/, ''),
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Range': 'bytes=0-',
    },
  };

  lib.get(options, (proxyRes) => {
    // Handle redirects
    if (proxyRes.statusCode && [301, 302, 303, 307, 308].includes(proxyRes.statusCode) && proxyRes.headers.location) {
      streamDirectUrl(proxyRes.headers.location, sourceUrl, res, onDone, onError);
      return;
    }

    if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
      onError(`Remote CDN returned HTTP ${proxyRes.statusCode}`);
      return;
    }

    // Forward content headers
    const ct = proxyRes.headers['content-type'] || 'video/mp4';
    let cl = proxyRes.headers['content-length'];
    const cr = proxyRes.headers['content-range'];
    if (cr && !cl) {
      const parts = cr.split('/');
      if (parts[1]) cl = parts[1];
    }

    res.setHeader('Content-Type', ct);
    if (cl) res.setHeader('Content-Length', cl);
    if (cr) res.setHeader('Content-Range', cr);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('X-Accel-Buffering', 'no');

    const statusCode = proxyRes.statusCode || 200;
    res.status(statusCode === 206 ? 206 : 200);

    proxyRes.pipe(res);
    proxyRes.on('end', onDone);
  }).on('error', (err) => {
    onError(err.message);
  });
}

// ─────────────────────────────────────────────────────────
//  Helper: use yt-dlp to stream a direct-URL (HLS/DASH/mp4)
//  with yt-dlp's internal downloader (handles HLS muxing etc.)
// ─────────────────────────────────────────────────────────
function streamViaYtdlp(
  directUrl: string,
  sourceUrl: string,
  res: Response,
  safeFilename: string,
  next: (err: Error) => void,
  onDone: () => void,
  req?: Request
): void {
  const args = [
    '-f', 'best',
    '--no-playlist',
    '--no-progress',
    ...getCommonYtdlpArgs(sourceUrl),
    '-o', '-',
    directUrl,
  ];

  const proc = spawnYtdlp(args);
  let stderr = '';

  if (req) {
    req.on('close', () => {
      proc.kill('SIGTERM');
    });
  }

  proc.stdout.pipe(res);
  proc.stderr.on('data', (chunk: Buffer) => {
    const msg = chunk.toString();
    stderr += msg;
    console.log('[Stream stderr]', msg.slice(0, 200));
  });
  proc.on('error', (err) => {
    proc.stdout.unpipe(res);
    if (!res.headersSent) next(new HttpError('Stream failed: ' + err.message, 500, 'DOWNLOAD_ERROR') as Error);
    else res.end();
  });
  proc.on('close', (code) => {
    if (code === 0) { onDone(); }
    else {
      proc.stdout.unpipe(res);
      if (!res.headersSent) next(new HttpError(stderr || `Stream failed (exit ${code})`, 500, 'DOWNLOAD_ERROR') as Error);
      else res.end();
    }
  });
}

// ─────────────────────────────────────────────────────────
//  GET/POST /api/download  — stream video download
// ─────────────────────────────────────────────────────────
export async function download(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { url, formatId, filename, directUrl, streamType } = {
    ...req.query,
    ...req.body,
  } as DownloadRequest & { directUrl?: string; streamType?: string };

  if (!formatId) {
    next(new HttpError('formatId is required', 400, 'MISSING_FORMAT'));
    return;
  }

  try {
    const safeFilename = (filename || 'download').replace(/[^a-zA-Z0-9._-]/g, '_');
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.mp4"`);
    res.setHeader('X-Accel-Buffering', 'no');

    const historyEntry = {
      url,
      title: safeFilename,
      thumbnail: null as null,
      type: 'video' as const,
      format: 'mp4',
      quality: formatId,
      filesize: null as null,
      status: 'completed' as const,
    };

    // ── Browser-extracted direct URL path ───────────────
    if (directUrl && formatId.startsWith('browser_')) {
      console.log(`[Download] Browser-extracted stream (${streamType}): ${directUrl.slice(0, 80)}`);

      if (streamType === 'm3u8' || streamType === 'mpd' || directUrl.includes('.m3u8')) {
        // Use yt-dlp to handle HLS/DASH segment downloading and muxing
        streamViaYtdlp(directUrl, url, res, safeFilename, (err) => next(err), () => {
          addToHistory(historyEntry);
        }, req);
      } else {
        // Direct MP4: proxy stream with proper browser headers
        streamDirectUrl(
          directUrl, url, res,
          () => { addToHistory(historyEntry); },
          (errMsg) => {
            console.error('[Download] Direct stream failed, trying yt-dlp fallback:', errMsg);
            streamViaYtdlp(directUrl, url, res, safeFilename, (err) => next(err), () => {
              addToHistory(historyEntry);
            }, req);
          }
        );
      }
      return;
    }

    // ── Standard yt-dlp path ────────────────────────────
    const proc = createDownloadProcess(url, formatId);
    let stderr = '';

    proc.stdout.pipe(res);
    proc.stderr.on('data', (chunk: Buffer) => {
      const msg = chunk.toString();
      stderr += msg;
      console.log('[Download stderr]', msg.slice(0, 200));
    });
    proc.on('error', (err) => {
      console.error('[Download] Process error:', err.message);
      proc.stdout.unpipe(res);
      if (!res.headersSent) next(new HttpError('Download failed: ' + err.message, 500, 'DOWNLOAD_ERROR'));
      else res.end();
    });
    proc.on('close', (code) => {
      if (code === 0) {
        addToHistory(historyEntry);
      } else {
        console.error(`[Download] yt-dlp exited with code ${code}: ${stderr}`);
        proc.stdout.unpipe(res);
        if (!res.headersSent) next(new HttpError(stderr || `Download failed (exit ${code})`, 500, 'DOWNLOAD_ERROR'));
        else res.end();
      }
    });
    req.on('close', () => { proc.kill('SIGTERM'); });

  } catch (err) {
    next(new HttpError((err as Error).message, 500, 'DOWNLOAD_ERROR'));
  }
}

// ─────────────────────────────────────────────────────────
//  GET/POST /api/audio  — stream audio download
// ─────────────────────────────────────────────────────────
export async function audio(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { url, format = 'mp3', quality = '320' } = { ...req.query, ...req.body } as AudioRequest;

  const mimeTypes: Record<string, string> = {
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    aac: 'audio/aac',
    wav: 'audio/wav',
    flac: 'audio/flac',
    opus: 'audio/ogg',
  };

  try {
    res.setHeader('Content-Type', mimeTypes[format] || 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="audio.${format}"`);
    res.setHeader('X-Accel-Buffering', 'no');

    const proc = createAudioProcess(url, format, quality);
    let stderr = '';

    proc.stdout.pipe(res);
    proc.stderr.on('data', (chunk: Buffer) => {
      const msg = chunk.toString();
      stderr += msg;
      console.log('[Audio stderr]', msg.slice(0, 200));
    });
    proc.on('error', (err) => {
      proc.stdout.unpipe(res);
      if (!res.headersSent) next(new HttpError('Audio download failed: ' + err.message, 500, 'AUDIO_ERROR'));
      else res.end();
    });
    proc.on('close', (code) => {
      if (code === 0) {
        addToHistory({
          url, title: null, thumbnail: null, type: 'audio',
          format, quality: `${quality}kbps`, filesize: null, status: 'completed',
        });
      } else {
        console.error(`[Audio] yt-dlp exited with code ${code}: ${stderr}`);
        proc.stdout.unpipe(res);
        if (!res.headersSent) next(new HttpError(stderr || `Audio processing failed (exit ${code})`, 500, 'AUDIO_ERROR'));
        else res.end();
      }
    });
    req.on('close', () => { proc.kill('SIGTERM'); });

  } catch (err) {
    next(new HttpError((err as Error).message, 500, 'AUDIO_ERROR'));
  }
}
