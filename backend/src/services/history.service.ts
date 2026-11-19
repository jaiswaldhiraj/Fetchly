import { getDatabase } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import type { DownloadHistory, MediaType } from '../types';

// ─────────────────────────────────────────────────────────
//  History Service — SQLite-backed download history
// ─────────────────────────────────────────────────────────

export function extractPlatform(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'YouTube';
    if (host.includes('vimeo.com')) return 'Vimeo';
    if (host.includes('twitter.com') || host.includes('x.com')) return 'Twitter / X';
    if (host.includes('reddit.com')) return 'Reddit';
    if (host.includes('tiktok.com')) return 'TikTok';
    if (host.includes('instagram.com')) return 'Instagram';
    if (host.includes('facebook.com')) return 'Facebook';
    if (host.includes('twitch.tv')) return 'Twitch';
    if (host.includes('dailymotion.com')) return 'Dailymotion';
    return host.replace(/^www\./, '');
  } catch {
    return 'Direct';
  }
}

export function addToHistory(entry: Omit<DownloadHistory, 'id' | 'createdAt'>): DownloadHistory {
  const db = getDatabase();
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  const platform = entry.platform || extractPlatform(entry.url);

  db.prepare(`
    INSERT INTO download_history (id, url, title, thumbnail, type, format, quality, filesize, status, platform, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    entry.url,
    entry.title || null,
    entry.thumbnail || null,
    entry.type,
    entry.format || null,
    entry.quality || null,
    entry.filesize || null,
    entry.status,
    platform,
    createdAt,
  );

  return { ...entry, id, platform, createdAt };
}

export function getHistory(limit = 50, offset = 0): DownloadHistory[] {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT id, url, title, thumbnail, type, format, quality, filesize, status, platform, created_at as createdAt
    FROM download_history
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset) as Array<{
    id: string; url: string; title: string | null; thumbnail: string | null;
    type: string; format: string | null; quality: string | null;
    filesize: number | null; status: string; platform: string | null; createdAt: string;
  }>;

  return rows.map((r) => ({
    ...r,
    type: r.type as MediaType,
    status: r.status as 'completed' | 'failed' | 'cancelled',
  }));
}

export function getHistoryCount(): number {
  const db = getDatabase();
  const row = db.prepare('SELECT COUNT(*) as count FROM download_history').get() as { count: number };
  return row.count;
}

export function deleteHistoryEntry(id: string): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM download_history WHERE id = ?').run(id);
  return result.changes > 0;
}

export function clearHistory(): void {
  const db = getDatabase();
  db.prepare('DELETE FROM download_history').run();
}

export function getDownloadsToday(): number {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT COUNT(*) as count FROM download_history
    WHERE date(created_at) = date('now')
  `).get() as { count: number };
  return row.count;
}

export function getTopPlatforms(limit = 5): Array<{ platform: string; count: number }> {
  const db = getDatabase();
  return db.prepare(`
    SELECT COALESCE(platform, 'Unknown') as platform, COUNT(*) as count
    FROM download_history
    GROUP BY platform
    ORDER BY count DESC
    LIMIT ?
  `).all(limit) as Array<{ platform: string; count: number }>;
}
