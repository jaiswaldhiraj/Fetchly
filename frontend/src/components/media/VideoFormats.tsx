'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownTrayIcon, FilmIcon } from '@heroicons/react/24/outline';
import type { MediaFormat } from '@/types';
import { formatBytes, getQualityColor } from '@/lib/utils';
import { downloadFile } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

interface VideoFormatsProps {
  formats: MediaFormat[];
  url: string;
  title: string | null;
}

export default function VideoFormats({ formats, url, title }: VideoFormatsProps) {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Show all video formats, selecting the best format per quality level
  const videoFormats = formats.filter((f) => f.hasVideo);
  const qualityMap = new Map<string, MediaFormat>();
  for (const f of videoFormats) {
    const existing = qualityMap.get(f.quality);
    if (!existing) {
      qualityMap.set(f.quality, f);
    } else if (!existing.hasAudio && f.hasAudio) {
      qualityMap.set(f.quality, f);
    }
  }
  const bestFormats = Array.from(qualityMap.values());

  const handleDownload = (format: MediaFormat) => {
    setDownloading(format.formatId);
    const toastId = toast.loading('Starting download…');

    try {
      downloadFile(url, format.formatId, title || 'video', format);
      toast.success('Download started in your browser!', { id: toastId });
    } catch {
      toast.error('Download failed to start.', { id: toastId });
    } finally {
      setTimeout(() => {
        setDownloading(null);
      }, 1500);
    }
  };

  if (formats.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <FilmIcon className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-3" />
        <p className="text-[var(--text-secondary)]">No video formats available</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 sm:p-6 space-y-4">
      <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
        <FilmIcon className="w-5 h-5 text-sky-400" />
        Available Formats
        <span className="ml-1 text-xs font-normal text-[var(--text-muted)]">
          ({bestFormats.length} formats)
        </span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {bestFormats.map((format) => (
          <motion.div
            key={format.formatId}
            whileHover={{ scale: 1.01 }}
            onClick={() => setSelectedFormat(
              selectedFormat === format.formatId ? null : format.formatId
            )}
            className={`format-card ${selectedFormat === format.formatId ? 'selected' : ''}`}
          >
            {/* Quality badge */}
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-black px-2.5 py-1 rounded-lg ${getQualityColor(format.quality)}`}>
                {format.quality}
              </span>
              <div className="flex gap-1">
                {format.hdr && <Badge variant="purple" size="sm">HDR</Badge>}
                {format.hasVideo && format.hasAudio && (
                  <Badge variant="success" size="sm">AV</Badge>
                )}
                {format.hasVideo && !format.hasAudio && (
                  <Badge variant="brand" size="sm">V</Badge>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-1">
              {format.container && (
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Container</span>
                  <span className="font-medium text-[var(--text-primary)] uppercase">{format.container}</span>
                </div>
              )}
              {format.codec && (
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Codec</span>
                  <span className="font-medium text-[var(--text-primary)]">{format.codec}</span>
                </div>
              )}
              {format.fps && (
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">FPS</span>
                  <span className="font-medium text-[var(--text-primary)]">{format.fps} fps</span>
                </div>
              )}
              {format.bitrate && (
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Bitrate</span>
                  <span className="font-medium text-[var(--text-primary)]">{Math.round(format.bitrate)} kbps</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-muted)]">Size</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {formatBytes(format.filesize || format.filesizeApprox)}
                </span>
              </div>
            </div>

            {/* Download button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(format);
              }}
              disabled={!!downloading}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all duration-200
                bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 disabled:opacity-50"
            >
              {downloading === format.formatId ? (
                <>
                  <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Downloading…
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                  Download
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
