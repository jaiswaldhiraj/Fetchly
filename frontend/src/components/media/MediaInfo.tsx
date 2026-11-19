'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  PlayCircleIcon,
  SpeakerWaveIcon,
  FilmIcon,
} from '@heroicons/react/24/outline';
import type { MediaInfo } from '@/types';
import { formatDuration, formatCount, formatDate, truncate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import VideoFormats from './VideoFormats';
import AudioFormats from './AudioFormats';
import ImagePreview from './ImagePreview';

interface MediaInfoCardProps {
  info: MediaInfo;
}

type Tab = 'video' | 'audio' | 'image';

export default function MediaInfoCard({ info }: MediaInfoCardProps) {
  const [activeTab, setActiveTab] = useState<Tab>(
    info.type === 'audio' ? 'audio' : info.type === 'image' ? 'image' : 'video'
  );
  const [showFullDesc, setShowFullDesc] = useState(false);

  const allTabs: { id: Tab; label: string; icon: React.ElementType; show: boolean }[] = [
    { id: 'video', label: 'Video', icon: FilmIcon, show: info.type !== 'audio' && info.type !== 'image' },
    { id: 'audio', label: 'Audio', icon: SpeakerWaveIcon, show: info.audioFormats.length > 0 },
    { id: 'image', label: 'Image', icon: PlayCircleIcon, show: info.type === 'image' || info.type === 'gif' },
  ];
  const tabs = allTabs.filter((t) => t.show);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 space-y-4"
    >
      {/* Media Header Card */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Thumbnail */}
          {info.thumbnail && (
            <div className="relative w-full sm:w-48 h-32 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-[var(--border-glass)]">
              <Image
                src={info.thumbnail}
                alt={info.title || 'Media thumbnail'}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 192px"
                unoptimized
              />
              {info.isLive && (
                <div className="absolute top-2 left-2">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    LIVE
                  </span>
                </div>
              )}
              {info.duration && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-mono px-1.5 py-0.5 rounded">
                  {formatDuration(info.duration)}
                </div>
              )}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="brand">{info.type.toUpperCase()}</Badge>
              {info.platform && (
                <Badge variant="default">{info.platform}</Badge>
              )}
              {info.isPlaylist && <Badge variant="purple">PLAYLIST</Badge>}
              {info.cached && <Badge variant="success">CACHED</Badge>}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-2 leading-snug line-clamp-2">
              {info.title || 'Untitled Media'}
            </h2>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {info.uploader && (
                <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                  <UserIcon className="w-3.5 h-3.5" />
                  {info.uploader}
                </span>
              )}
              {info.duration && (
                <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                  <ClockIcon className="w-3.5 h-3.5" />
                  {formatDuration(info.duration)}
                </span>
              )}
              {info.viewCount !== null && (
                <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                  <EyeIcon className="w-3.5 h-3.5" />
                  {formatCount(info.viewCount)} views
                </span>
              )}
              {info.uploadDate && (
                <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {formatDate(info.uploadDate)}
                </span>
              )}
            </div>

            {/* Description */}
            {info.description && (
              <div className="mt-3">
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {showFullDesc ? info.description : truncate(info.description, 120)}
                </p>
                {info.description.length > 120 && (
                  <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="text-xs text-sky-400 hover:text-sky-300 mt-1 font-medium"
                  >
                    {showFullDesc ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Format Tabs */}
      {tabs.length > 1 && (
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'glass text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Format Panels */}
      {activeTab === 'video' && (
        <VideoFormats formats={info.formats} url={info.url} title={info.title} />
      )}
      {activeTab === 'audio' && (
        <AudioFormats formats={info.audioFormats} url={info.url} />
      )}
      {activeTab === 'image' && (
        <ImagePreview info={info} />
      )}
    </motion.div>
  );
}
