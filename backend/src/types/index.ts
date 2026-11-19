// ─────────────────────────────────────────────────────────
//  FetchLy Backend — Shared TypeScript Types
// ─────────────────────────────────────────────────────────

export type MediaType = 'video' | 'audio' | 'image' | 'gif' | 'playlist' | 'unknown';

export interface MediaFormat {
  formatId: string;
  resolution: string;
  quality: string; // e.g. "1080p"
  fps: number | null;
  codec: string | null;
  audioCodec: string | null;
  container: string | null; // mp4, webm, mkv
  filesize: number | null; // bytes
  filesizeApprox: number | null;
  bitrate: number | null; // kbps
  hasVideo: boolean;
  hasAudio: boolean;
  hdr: boolean;
  note: string | null;
  // Browser-extracted fields (when yt-dlp fallback is used)
  directUrl?: string;
  streamType?: 'mp4' | 'm3u8' | 'mpd';
}

export interface AudioFormat {
  formatId: string;
  format: string; // mp3, m4a, aac, etc.
  bitrate: number; // kbps
  filesize: number | null;
  codec: string | null;
}

export interface MediaInfo {
  url: string;
  type: MediaType;
  title: string | null;
  thumbnail: string | null;
  duration: number | null; // seconds
  uploader: string | null;
  uploaderUrl: string | null;
  viewCount: number | null;
  likeCount: number | null;
  uploadDate: string | null;
  description: string | null;
  width: number | null;
  height: number | null;
  ext: string | null;
  platform: string | null;
  formats: MediaFormat[];
  audioFormats: AudioFormat[];
  isLive: boolean;
  isPlaylist: boolean;
  tags: string[];
}

export interface DownloadHistory {
  id: string;
  url: string;
  title: string | null;
  thumbnail: string | null;
  type: MediaType;
  format: string | null;
  quality: string | null;
  filesize: number | null;
  status: 'completed' | 'failed' | 'cancelled';
  platform?: string | null;
  createdAt: string;
}

export interface AnalyzeRequest {
  url: string;
}

export interface DownloadRequest {
  url: string;
  formatId: string;
  filename?: string;
}

export interface AudioRequest {
  url: string;
  format: 'mp3' | 'm4a' | 'aac' | 'wav' | 'flac' | 'opus';
  quality: '320' | '256' | '192' | '128';
}

export interface ImageRequest {
  url: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface AdminStats {
  downloadsToday: number;
  downloadsTotal: number;
  activeUsers: number;
  topPlatforms: Array<{ platform: string; count: number }>;
  serverStatus: {
    uptime: number;
    memoryUsage: number;
    platform: string;
    nodeVersion: string;
    cpuUsage?: number;
  };
  recentLogs?: Array<{ timestamp: string; level: string; message: string }>;
}
