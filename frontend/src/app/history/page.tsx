'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClockIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Badge from '@/components/ui/Badge';
import { HistoryItemSkeleton } from '@/components/ui/SkeletonLoader';
import { getHistory, deleteHistoryItem, clearAllHistory } from '@/lib/api';
import { formatDate, formatBytes } from '@/lib/utils';
import type { DownloadHistory } from '@/types';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const [items, setItems] = useState<DownloadHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { items, total } = await getHistory();
      setItems(items);
      setTotal(total);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteHistoryItem(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success('Item removed from history');
  };

  const handleClearAll = async () => {
    if (!confirm('Clear all download history?')) return;
    await clearAllHistory();
    setItems([]);
    toast.success('History cleared');
  };

  const filtered = items.filter((item) =>
    !search || (item.title || item.url).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="hero-bg min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-black gradient-text">Download History</h1>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              {total} total downloads
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadHistory} className="btn-ghost gap-2">
              <ArrowPathIcon className="w-4 h-4" />
              Refresh
            </button>
            {items.length > 0 && (
              <button onClick={handleClearAll} className="btn-ghost gap-2 text-red-400 hover:text-red-300">
                <TrashIcon className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search history…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-primary pl-9"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <HistoryItemSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-16 text-center"
          >
            <ClockIcon className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-4" />
            <p className="text-[var(--text-secondary)] font-medium">
              {search ? 'No results found' : 'No download history yet'}
            </p>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              {!search && 'Start downloading media to see your history here.'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-card p-4 flex items-center gap-4 group"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--border-glass)]">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.title || ''}
                        width={80}
                        height={48}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ArrowDownTrayIcon className="w-5 h-5 text-[var(--text-muted)]" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {item.title || item.url}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <Badge variant={item.status === 'completed' ? 'success' : 'error'}>
                        {item.status}
                      </Badge>
                      <Badge variant="default">{item.type.toUpperCase()}</Badge>
                      {item.format && (
                        <span className="text-xs text-[var(--text-muted)] uppercase">{item.format}</span>
                      )}
                      {item.quality && (
                        <span className="text-xs text-[var(--text-muted)]">{item.quality}</span>
                      )}
                      {item.filesize && (
                        <span className="text-xs text-[var(--text-muted)]">{formatBytes(item.filesize)}</span>
                      )}
                      <span className="text-xs text-[var(--text-muted)]">{formatDate(item.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
