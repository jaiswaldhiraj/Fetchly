'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { analyzeUrl } from '@/lib/api';
import { detectUrlType } from '@/lib/utils';
import type { MediaInfo } from '@/types';
import toast from 'react-hot-toast';

interface UrlInputProps {
  onResult: (info: MediaInfo) => void;
  onLoading: (loading: boolean) => void;
  isLoading: boolean;
}

const URL_TYPE_LABELS = {
  video: { label: 'Video URL', color: 'text-sky-400', icon: '🎬' },
  audio: { label: 'Audio URL', color: 'text-violet-400', icon: '🎵' },
  image: { label: 'Image URL', color: 'text-green-400', icon: '🖼️' },
  unknown: { label: 'Paste a URL', color: 'text-[var(--text-muted)]', icon: '🔗' },
};

export default function UrlInput({ onResult, onLoading, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [urlType, setUrlType] = useState<'video' | 'audio' | 'image' | 'unknown'>('unknown');
  const [error, setError] = useState<string | null>(null);
  const [showPaste, setShowPaste] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect clipboard URL on focus
  useEffect(() => {
    const handleFocus = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text?.startsWith('http') && !url) {
          setShowPaste(true);
        }
      } catch {
        // Clipboard access denied is fine
      }
    };
    const el = inputRef.current;
    el?.addEventListener('focus', handleFocus);
    return () => el?.removeEventListener('focus', handleFocus);
  }, [url]);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setError(null);
    setShowPaste(false);
    if (value.startsWith('http')) {
      setUrlType(detectUrlType(value));
    } else {
      setUrlType('unknown');
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleUrlChange(text);
    } catch {
      toast.error('Could not read clipboard');
    }
  };

  const clearUrl = () => {
    setUrl('');
    setUrlType('unknown');
    setError(null);
    inputRef.current?.focus();
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('Please enter a URL');
      return;
    }

    if (!trimmedUrl.startsWith('http')) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setError(null);
    onLoading(true);

    try {
      const result = await analyzeUrl(trimmedUrl);
      onResult(result);
      toast.success('Media analyzed successfully!');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      const message = axiosErr?.response?.data?.message || axiosErr?.message || 'Failed to analyze URL';
      setError(message);
      toast.error(message);
    } finally {
      onLoading(false);
    }
  }, [url, onLoading, onResult]);

  // Ctrl+Enter shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && url) {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [url, handleSubmit]);

  const typeInfo = URL_TYPE_LABELS[urlType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="max-w-3xl mx-auto px-4"
    >
      <form onSubmit={handleSubmit} className="glass-card p-3 sm:p-4">
        {/* URL Type indicator */}
        <AnimatePresence>
          {url && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-2 pb-2"
            >
              <span className={`text-xs font-medium ${typeInfo.color} flex items-center gap-1`}>
                <span>{typeInfo.icon}</span>
                <span>{typeInfo.label} detected</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 sm:gap-3">
          {/* Input */}
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <MagnifyingGlassIcon className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
            <input
              ref={inputRef}
              type="url"
              id="url-input"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="https://example.com/video"
              className="input-primary pl-9 pr-9"
              disabled={isLoading}
              autoComplete="off"
              spellCheck={false}
            />
            {url && (
              <button
                type="button"
                onClick={clearUrl}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Paste button */}
          {!url && (
            <button
              type="button"
              onClick={pasteFromClipboard}
              className="btn-ghost flex-shrink-0 gap-1.5"
              title="Paste from clipboard"
            >
              <ClipboardDocumentIcon className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Paste</span>
            </button>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="btn-brand flex-shrink-0 gap-2 min-w-[120px] sm:min-w-[140px]"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="hidden sm:inline">Analyzing...</span>
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>Analyze</span>
              </>
            )}
          </button>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex items-center gap-2 text-red-400 text-sm px-2"
            >
              <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Hint */}
      <p className="text-center text-xs text-[var(--text-muted)] mt-3">
        Press <kbd className="glass rounded px-1.5 py-0.5 text-xs font-mono">Ctrl+Enter</kbd> to analyze
      </p>
    </motion.div>
  );
}
