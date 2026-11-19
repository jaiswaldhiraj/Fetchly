// ─────────────────────────────────────────────────────────
//  Frontend Shared TypeScript Types
// ─────────────────────────────────────────────────────────

export type MediaType = 'video' | 'audio' | 'image' | 'gif' | 'playlist' | 'unknown';

export interface MediaFormat {
  formatId: string;
  resolution: string;
  quality: string;
  fps: number | null;
  codec: string | null;
  audioCodec: string | null;
  container: string | null;
  filesize: number | null;
  filesizeApprox: number | null;
  bitrate: number | null;
  hasVideo: boolean;
  hasAudio: boolean;
  hdr: boolean;
  note: string | null;
  // Browser-fallback fields (when yt-dlp is blocked by ISP)
  directUrl?: string;
  streamType?: 'mp4' | 'm3u8' | 'mpd';
}

export interface AudioFormat {
  formatId: string;
  format: string;
  bitrate: number;
  filesize: number | null;
  codec: string | null;
}

export interface MediaInfo {
  url: string;
  type: MediaType;
  title: string | null;
  thumbnail: string | null;
  duration: number | null;
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
  cached?: boolean;
  extractedBy?: 'ytdlp' | 'browser';
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
  createdAt: string;
}

export type DownloadStatus =
  | 'idle'
  | 'analyzing'
  | 'ready'
  | 'downloading'
  | 'completed'
  | 'error';

export interface DownloadState {
  status: DownloadStatus;
  progress: number;
  speed: string | null;
  eta: string | null;
  downloadedSize: string | null;
  error: string | null;
}

export type AudioQuality = '320' | '256' | '192' | '128';
export type AudioFormatType = 'mp3' | 'm4a' | 'aac' | 'wav' | 'flac' | 'opus';

export type Language = 'en' | 'hi' | 'es' | 'fr' | 'de' | 'ar' | 'ja';

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  preferredVideoFormat: string;
  preferredAudioFormat: AudioFormatType;
  preferredQuality: string;
  language: Language;
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
  };
}
