import axios from 'axios';
import type { MediaInfo, MediaFormat, DownloadHistory, AdminStats } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────────────────────────────────────────────────────
//  API Methods
// ─────────────────────────────────────────────────────────

export async function analyzeUrl(url: string): Promise<MediaInfo> {
  const { data } = await api.post<MediaInfo>('/analyze', { url });
  return data;
}

export function buildDownloadUrl(
  url: string,
  formatId: string,
  filename?: string,
  format?: MediaFormat
): string {
  const params = new URLSearchParams({ url, formatId });
  if (filename) params.append('filename', filename);

  // For browser-extracted formats, pass the direct URL and stream type
  if (format?.directUrl) {
    params.append('directUrl', format.directUrl);
    if (format.streamType) params.append('streamType', format.streamType);
  }

  return `${API_URL}/download?${params}`;
}

export function buildAudioUrl(url: string, format: string, quality: string): string {
  const params = new URLSearchParams({ url, format, quality });
  return `${API_URL}/audio?${params}`;
}

export function downloadFile(
  url: string,
  formatId: string,
  filename?: string,
  format?: MediaFormat
): void {
  const downloadUrl = buildDownloadUrl(url, formatId, filename, format);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', filename ? `${filename}.mp4` : 'download.mp4');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadAudio(
  url: string,
  format: string,
  quality: string
): void {
  const audioUrl = buildAudioUrl(url, format, quality);
  const link = document.createElement('a');
  link.href = audioUrl;
  link.setAttribute('download', `audio.${format}`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function getHistory(): Promise<{ items: DownloadHistory[]; total: number }> {
  const { data } = await api.get('/history');
  return data;
}

export async function deleteHistoryItem(id: string): Promise<void> {
  await api.delete(`/history/${id}`);
}

export async function clearAllHistory(): Promise<void> {
  await api.delete('/history');
}

export async function getAdminStats(adminKey: string): Promise<AdminStats> {
  const { data } = await api.get('/admin/stats', {
    headers: { 'X-Admin-Key': adminKey },
  });
  return data;
}
