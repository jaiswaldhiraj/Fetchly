'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ClockIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { DownloadHistory } from '@/types';
import { getHistory, deleteHistoryItem } from '@/lib/api';
import { formatDate, formatBytes } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import { HistoryItemSkeleton } from '@/components/ui/SkeletonLoader';

export default function RecentDownloads() {
  const [items, setItems] = useState<DownloadHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory()
      .then(({ items }) => setItems(items.slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    await deleteHistoryItem(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  if (!loading && items.length === 0) return null;

  return (
    <section className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-4">
        <ClockIcon className="w-5 h-5 text-[var(--text-muted)]" />
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Recent Downloads</h2>
      </div>

      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <HistoryItemSkeleton key={i} />)
        ) : (
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="glass-card-sm p-3 flex items-center gap-3 group"
              >
                {item.thumbnail ? (
                  <div className="relative w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--border-glass)]">
                    <Image src={item.thumbnail} alt={item.title || ''} fill className="object-cover" unoptimized />
                  </div>
                ) : (
                  <div className="w-16 h-10 rounded-lg bg-[var(--border-glass)] flex-shrink-0 flex items-center justify-center">
                    <ArrowDownTrayIcon className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {item.title || item.url}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={item.status === 'completed' ? 'success' : 'error'}>
                      {item.status}
                    </Badge>
                    {item.format && <span className="text-xs text-[var(--text-muted)] uppercase">{item.format}</span>}
                    <span className="text-xs text-[var(--text-muted)]">{formatDate(item.createdAt)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10 text-red-400"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
