'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownTrayIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import type { AudioFormat } from '@/types';
import type { AudioFormatType, AudioQuality } from '@/types';
import { formatBytes } from '@/lib/utils';
import { AUDIO_FORMATS, AUDIO_QUALITIES } from '@/lib/constants';
import { downloadAudio } from '@/lib/api';
import toast from 'react-hot-toast';

interface AudioFormatsProps {
  formats: AudioFormat[];
  url: string;
}

export default function AudioFormats({ formats, url }: AudioFormatsProps) {
  const [selectedFormat, setSelectedFormat] = useState<AudioFormatType>('mp3');
  const [selectedQuality, setSelectedQuality] = useState<AudioQuality>('320');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    const toastId = toast.loading(`Starting ${selectedFormat.toUpperCase()} audio download…`);
    try {
      downloadAudio(url, selectedFormat, selectedQuality);
      toast.success('Audio download started in your browser!', { id: toastId });
    } catch {
      toast.error('Audio download failed to start.', { id: toastId });
    } finally {
      setTimeout(() => {
        setDownloading(false);
      }, 1500);
    }
  };

  return (
    <div className="glass-card p-4 sm:p-6 space-y-5">
      <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
        <SpeakerWaveIcon className="w-5 h-5 text-violet-400" />
        Audio Download
      </h3>

      {/* Source audio formats (from analysis) */}
      {formats.length > 0 && (
        <div>
          <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">Source Formats</p>
          <div className="flex flex-wrap gap-2">
            {formats.map((f) => (
              <div key={f.formatId} className="glass rounded-lg px-3 py-2 text-xs">
                <span className="font-semibold text-[var(--text-primary)] uppercase">{f.format}</span>
                <span className="text-[var(--text-muted)] ml-2">{f.bitrate}kbps</span>
                {f.filesize && (
                  <span className="text-[var(--text-muted)] ml-2">{formatBytes(f.filesize)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Format Selector */}
      <div>
        <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">Output Format</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {AUDIO_FORMATS.map((fmt) => (
            <motion.button
              key={fmt.value}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedFormat(fmt.value as AudioFormatType)}
              className={`p-2.5 rounded-xl text-center transition-all duration-200 ${
                selectedFormat === fmt.value
                  ? 'bg-violet-500/20 border border-violet-500/40 text-violet-400'
                  : 'glass border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="text-sm font-bold">{fmt.label}</div>
              <div className="text-xs opacity-60 mt-0.5">{fmt.description}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quality Selector */}
      <div>
        <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">Bitrate</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AUDIO_QUALITIES.map((q) => (
            <button
              key={q.value}
              onClick={() => setSelectedQuality(q.value as AudioQuality)}
              className={`p-2.5 rounded-xl text-center transition-all duration-200 ${
                selectedQuality === q.value
                  ? 'bg-violet-500/20 border border-violet-500/40 text-violet-400'
                  : 'glass text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="text-sm font-bold">{q.label}</div>
              <div className="text-xs opacity-60">{q.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="btn-brand w-full justify-center gap-2 !bg-gradient-to-r from-violet-600 to-purple-700"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
      >
        {downloading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing Audio…
          </>
        ) : (
          <>
            <ArrowDownTrayIcon className="w-4 h-4" />
            Download {selectedFormat.toUpperCase()} · {selectedQuality}kbps
          </>
        )}
      </button>
    </div>
  );
}
