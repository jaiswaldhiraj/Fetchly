'use client';

import Image from 'next/image';
import { ArrowDownTrayIcon, PhotoIcon } from '@heroicons/react/24/outline';
import type { MediaInfo } from '@/types';

interface ImagePreviewProps {
  info: MediaInfo;
}

export default function ImagePreview({ info }: ImagePreviewProps) {
  const handleDownload = () => {
    if (!info.thumbnail) return;
    const link = document.createElement('a');
    link.href = info.url;
    link.download = `image.${info.ext || 'jpg'}`;
    link.target = '_blank';
    link.click();
  };

  return (
    <div className="glass-card p-4 sm:p-6 space-y-4">
      <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
        <PhotoIcon className="w-5 h-5 text-green-400" />
        Image Preview
      </h3>

      {info.thumbnail && (
        <div className="relative w-full max-h-96 rounded-xl overflow-hidden bg-[var(--border-glass)]">
          <Image
            src={info.thumbnail || info.url}
            alt={info.title || 'Image preview'}
            width={800}
            height={450}
            className="w-full h-auto object-contain"
            unoptimized
          />
        </div>
      )}

      {/* Image Details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {info.width && info.height && (
          <div className="glass rounded-xl p-3 text-center">
            <div className="text-xs text-[var(--text-muted)] mb-1">Dimensions</div>
            <div className="text-sm font-bold text-[var(--text-primary)]">
              {info.width}×{info.height}
            </div>
          </div>
        )}
        {info.ext && (
          <div className="glass rounded-xl p-3 text-center">
            <div className="text-xs text-[var(--text-muted)] mb-1">Format</div>
            <div className="text-sm font-bold text-[var(--text-primary)] uppercase">{info.ext}</div>
          </div>
        )}
        {info.width && info.height && (
          <div className="glass rounded-xl p-3 text-center">
            <div className="text-xs text-[var(--text-muted)] mb-1">Aspect Ratio</div>
            <div className="text-sm font-bold text-[var(--text-primary)]">
              {(info.width / info.height).toFixed(2)}:1
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleDownload}
        className="btn-brand w-full justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
      >
        <ArrowDownTrayIcon className="w-4 h-4" />
        Download Image
      </button>
    </div>
  );
}
