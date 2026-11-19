import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';
import path from 'path';
import fs from 'fs';
import { config } from '../config';
import type { MediaInfo, MediaFormat, AudioFormat, MediaType } from '../types';

interface YtdlpCommand {
  command: string;
  baseArgs: string[];
}

let resolvedYtdlpCommand: YtdlpCommand | null = null;

export function getYtdlpCommand(): YtdlpCommand {
  if (resolvedYtdlpCommand) return resolvedYtdlpCommand;

  const rawPath = (config.ytdlpPath || 'yt-dlp').trim();

  // 1. Explicit arguments like "python -m yt_dlp" or "C:\path\python.exe -m yt_dlp"
  if (rawPath.includes(' -m ')) {
    const parts = rawPath.split(/\s+/);
    resolvedYtdlpCommand = {
      command: parts[0],
      baseArgs: parts.slice(1),
    };
    return resolvedYtdlpCommand;
  }

  // 2. Direct python executable
  if (rawPath.toLowerCase().endsWith('python.exe') || rawPath.toLowerCase().endsWith('python')) {
    resolvedYtdlpCommand = {
      command: rawPath,
      baseArgs: ['-m', 'yt_dlp'],
    };
    return resolvedYtdlpCommand;
  }

  // 3. Direct executable path exists on disk
  if (fs.existsSync(rawPath)) {
    resolvedYtdlpCommand = { command: rawPath, baseArgs: [] };
    return resolvedYtdlpCommand;
  }

  // 4. Windows auto-detection if yt-dlp was not in PATH
  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA || '';
    const userProfile = process.env.USERPROFILE || '';

    const potentialPythonPaths = [
      path.join(localAppData, 'Python', 'bin', 'python.exe'),
      path.join(userProfile, 'AppData', 'Local', 'Python', 'bin', 'python.exe'),
      path.join(localAppData, 'Python', 'pythoncore-3.14-64', 'python.exe'),
      path.join(localAppData, 'Programs', 'Python', 'Python312', 'python.exe'),
      path.join(localAppData, 'Programs', 'Python', 'Python311', 'python.exe'),
      path.join(localAppData, 'Programs', 'Python', 'Python310', 'python.exe'),
    ];

    for (const pyPath of potentialPythonPaths) {
      if (fs.existsSync(pyPath)) {
        console.log(`[yt-dlp] Auto-detected Python executable at ${pyPath}, executing via '-m yt_dlp'`);
        resolvedYtdlpCommand = { command: pyPath, baseArgs: ['-m', 'yt_dlp'] };
        return resolvedYtdlpCommand;
      }
    }
  }

  resolvedYtdlpCommand = { command: rawPath, baseArgs: [] };
  return resolvedYtdlpCommand;
}

export function spawnYtdlp(args: string[]): ChildProcessWithoutNullStreams {
  const { command, baseArgs } = getYtdlpCommand();
  return spawn(command, [...baseArgs, ...args], { shell: false });
}

// ─────────────────────────────────────────────────────────
//  Raw yt-dlp JSON shape (partial — only fields we use)
// ─────────────────────────────────────────────────────────
interface YtdlpFormat {
  format_id: string;
  format_note?: string;
  ext?: string;
  resolution?: string;
  width?: number;
  height?: number;
  fps?: number;
  vcodec?: string;
  acodec?: string;
  filesize?: number;
  filesize_approx?: number;
  tbr?: number;
  abr?: number;
  vbr?: number;
  dynamic_range?: string;
  container?: string;
  quality?: number;
}

interface YtdlpInfo {
  id: string;
  title?: string;
  thumbnail?: string;
  thumbnails?: Array<{ url: string; width?: number; height?: number }>;
  duration?: number;
  uploader?: string;
  uploader_url?: string;
  view_count?: number;
  like_count?: number;
  upload_date?: string;
  description?: string;
  width?: number;
  height?: number;
  ext?: string;
  extractor?: string;
  webpage_url?: string;
  is_live?: boolean;
  formats?: YtdlpFormat[];
  entries?: YtdlpInfo[];
  _type?: string;
  tags?: string[];
}

// ─────────────────────────────────────────────────────────
//  Helper: run yt-dlp and collect JSON output
// ─────────────────────────────────────────────────────────
function runYtdlp(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';

    const proc = spawnYtdlp(args);

    proc.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString(); });
    proc.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr || `yt-dlp exited with code ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to start yt-dlp: ${err.message}`));
    });
  });
}

// ─────────────────────────────────────────────────────────
//  Parse quality label from format data
// ─────────────────────────────────────────────────────────
function getQualityLabel(fmt: YtdlpFormat): string {
  if (fmt.height) return `${fmt.height}p`;
  if (fmt.format_note) return fmt.format_note;
  if (fmt.resolution && fmt.resolution !== 'audio only') return fmt.resolution;
  return 'unknown';
}

// ─────────────────────────────────────────────────────────
//  Detect media type
// ─────────────────────────────────────────────────────────
function detectMediaType(info: YtdlpInfo, url: string): MediaType {
  if (info._type === 'playlist') return 'playlist';
  if (info.is_live) return 'video';

  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp', '.svg'];
  const urlLower = url.toLowerCase();
  if (imageExts.some((ext) => urlLower.includes(ext))) return 'image';

  if (info.ext === 'gif') return 'gif';

  if (!info.duration && info.formats?.every((f) => f.vcodec === 'none')) return 'audio';

  return 'video';
}

// ─────────────────────────────────────────────────────────
//  Helper: locate ffmpeg directory
// ─────────────────────────────────────────────────────────
let resolvedFfmpegLocation: string | null = null;

export function getFfmpegLocation(): string | null {
  if (resolvedFfmpegLocation) return resolvedFfmpegLocation;

  // 1. Explicit config path if it exists
  if (config.ffmpegPath && fs.existsSync(config.ffmpegPath)) {
    const isDir = fs.statSync(config.ffmpegPath).isDirectory();
    resolvedFfmpegLocation = isDir ? config.ffmpegPath : path.dirname(config.ffmpegPath);
    return resolvedFfmpegLocation;
  }

  // 2. Windows WinGet package search
  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA || '';
    const userProfile = process.env.USERPROFILE || '';
    const searchDirs = [
      path.join(localAppData, 'Microsoft', 'WinGet', 'Packages'),
      path.join(userProfile, 'AppData', 'Local', 'Microsoft', 'WinGet', 'Packages'),
    ];

    for (const baseDir of searchDirs) {
      if (fs.existsSync(baseDir)) {
        try {
          const entries = fs.readdirSync(baseDir);
          for (const entry of entries) {
            if (entry.toLowerCase().includes('ffmpeg')) {
              const fullEntryPath = path.join(baseDir, entry);
              const subEntries = fs.readdirSync(fullEntryPath);
              for (const sub of subEntries) {
                const subBin = path.join(fullEntryPath, sub, 'bin');
                if (fs.existsSync(path.join(subBin, 'ffmpeg.exe'))) {
                  resolvedFfmpegLocation = subBin;
                  return resolvedFfmpegLocation;
                }
              }
            }
          }
        } catch {
          // ignore
        }
      }
    }
  }

  return null;
}

const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export function getCommonYtdlpArgs(url?: string): string[] {
  const common = [
    '--no-warnings',
    '--no-check-certificates',
    '--geo-bypass',
    '--user-agent', BROWSER_USER_AGENT,
    '--add-header', 'Accept-Language: en-US,en;q=0.9',
    '--add-header', 'Sec-Fetch-Mode: navigate',
  ];

  // Pass ffmpeg location if available
  const ffmpegLoc = getFfmpegLocation();
  if (ffmpegLoc) {
    common.push('--ffmpeg-location', ffmpegLoc);
  }

  // Proxy: route requests through proxy if configured (bypasses ISP SNI blocks)
  if (config.proxyUrl) {
    common.push('--proxy', config.proxyUrl);
  }

  // Cookies: ONLY use if explicit cookies file is provided (never extract from browser)
  if (config.cookiesPath && fs.existsSync(config.cookiesPath)) {
    common.push('--cookies', config.cookiesPath);
  } else if (config.cookiesFromBrowser) {
    common.push('--cookies-from-browser', config.cookiesFromBrowser);
  }

  if (url) {
    try {
      const parsed = new URL(url);
      common.push('--referer', `${parsed.protocol}//${parsed.hostname}/`);
    } catch {
      // ignore invalid URL
    }
  }

  return common;
}

// ─────────────────────────────────────────────────────────
//  Analyze a URL and return structured MediaInfo
// ─────────────────────────────────────────────────────────
export async function analyzeUrl(url: string): Promise<MediaInfo> {
  const raw = await runYtdlp([
    '--dump-json',
    '--no-playlist',
    ...getCommonYtdlpArgs(url),
    url,
  ]);

  const info: YtdlpInfo = JSON.parse(raw);

  // Pick best thumbnail
  const thumbnail =
    info.thumbnail ||
    (info.thumbnails?.sort((a, b) => (b.width || 0) - (a.width || 0))[0]?.url) ||
    null;

  const type = detectMediaType(info, url);

  // Parse formats
  const formats: MediaFormat[] = (info.formats || [])
    .filter((f) => f.vcodec !== 'none' || f.acodec !== 'none')
    .map((f): MediaFormat => ({
      formatId: f.format_id,
      resolution: f.resolution || (f.width && f.height ? `${f.width}x${f.height}` : 'N/A'),
      quality: getQualityLabel(f),
      fps: f.fps || null,
      codec: f.vcodec !== 'none' ? (f.vcodec || null) : null,
      audioCodec: f.acodec !== 'none' ? (f.acodec || null) : null,
      container: f.ext || f.container || null,
      filesize: f.filesize || null,
      filesizeApprox: f.filesize_approx || null,
      bitrate: f.tbr || f.vbr || null,
      hasVideo: f.vcodec !== 'none',
      hasAudio: f.acodec !== 'none',
      hdr: f.dynamic_range === 'HDR10' || f.dynamic_range === 'HLG',
      note: f.format_note || null,
    }))
    .sort((a, b) => {
      const ah = parseInt(a.resolution.split('x')[1] || '0', 10);
      const bh = parseInt(b.resolution.split('x')[1] || '0', 10);
      return bh - ah;
    });

  // Audio-only formats
  const audioFormats: AudioFormat[] = (info.formats || [])
    .filter((f) => f.vcodec === 'none' && f.acodec !== 'none')
    .map((f): AudioFormat => ({
      formatId: f.format_id,
      format: f.ext || 'm4a',
      bitrate: Math.round(f.abr || f.tbr || 128),
      filesize: f.filesize || null,
      codec: f.acodec || null,
    }))
    .sort((a, b) => b.bitrate - a.bitrate);

  // Format upload date
  let uploadDate: string | null = null;
  if (info.upload_date && info.upload_date.length === 8) {
    uploadDate = `${info.upload_date.slice(0, 4)}-${info.upload_date.slice(4, 6)}-${info.upload_date.slice(6, 8)}`;
  }

  return {
    url,
    type,
    title: info.title || null,
    thumbnail,
    duration: info.duration || null,
    uploader: info.uploader || null,
    uploaderUrl: info.uploader_url || null,
    viewCount: info.view_count || null,
    likeCount: info.like_count || null,
    uploadDate,
    description: info.description || null,
    width: info.width || null,
    height: info.height || null,
    ext: info.ext || null,
    platform: info.extractor || null,
    formats,
    audioFormats,
    isLive: info.is_live || false,
    isPlaylist: info._type === 'playlist',
    tags: info.tags || [],
  };
}

// ─────────────────────────────────────────────────────────
//  Stream a download using yt-dlp subprocess
// ─────────────────────────────────────────────────────────
export function createDownloadProcess(url: string, formatId: string) {
  let formatArg: string;
  if (!formatId || formatId === 'best') {
    formatArg = 'best[ext=mp4]/best';
  } else if (formatId.includes('+')) {
    formatArg = formatId;
  } else {
    // Single format stream: downloads directly without requiring muxing
    formatArg = `${formatId}/best`;
  }

  const args = [
    '-f', formatArg,
    '--no-playlist',
    '--no-progress',
    ...getCommonYtdlpArgs(url),
    '-o', '-', // output to stdout
    url,
  ];

  return spawnYtdlp(args);
}

// ─────────────────────────────────────────────────────────
//  Stream an audio download
// ─────────────────────────────────────────────────────────
export function createAudioProcess(
  url: string,
  format: string,
  quality: string
) {
  const args = [
    '-f', 'bestaudio/best',
    '--extract-audio',
    '--audio-format', format,
    '--audio-quality', `${quality}K`,
    '--no-playlist',
    ...getCommonYtdlpArgs(url),
    '-o', '-',
    url,
  ];

  return spawnYtdlp(args);
}
