import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format bytes to human-readable size */
export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return 'Unknown size';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/** Format seconds to HH:MM:SS or MM:SS */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Format large numbers with K/M/B suffix */
export function formatCount(count: number | null | undefined): string {
  if (!count) return '—';
  if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}B`;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

/** Format ISO date to readable string */
export function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Get quality color based on resolution */
export function getQualityColor(quality: string): string {
  const q = quality.replace('p', '');
  const n = parseInt(q, 10);
  if (n >= 2160) return 'text-purple-400 bg-purple-400/10';
  if (n >= 1440) return 'text-blue-400 bg-blue-400/10';
  if (n >= 1080) return 'text-green-400 bg-green-400/10';
  if (n >= 720) return 'text-yellow-400 bg-yellow-400/10';
  return 'text-gray-400 bg-gray-400/10';
}

/** Detect URL type */
export function detectUrlType(url: string): 'video' | 'audio' | 'image' | 'unknown' {
  const lower = url.toLowerCase();
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp', '.svg'];
  const audioExts = ['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac'];

  if (imageExts.some((ext) => lower.includes(ext))) return 'image';
  if (audioExts.some((ext) => lower.includes(ext))) return 'audio';

  const videoPatterns = ['youtube.com', 'youtu.be', 'vimeo.com', 'twitch.tv', 'dailymotion.com', 'tiktok.com', 'instagram.com', 'twitter.com', 'x.com', 'reddit.com', 'facebook.com'];
  if (videoPatterns.some((p) => lower.includes(p))) return 'video';

  return 'unknown';
}

/** Truncate text to max length */
export function truncate(text: string | null | undefined, max = 100): string {
  if (!text) return '';
  return text.length <= max ? text : text.slice(0, max) + '...';
}

/** Copy text to clipboard */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Format uptime seconds to readable string */
export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(' ');
}
