'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ArrowDownTrayIcon,
  UsersIcon,
  ServerIcon,
  ShieldCheckIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getAdminStats } from '@/lib/api';
import type { AdminStats } from '@/types';
import { formatUptime } from '@/lib/utils';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import toast from 'react-hot-toast';

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="glass-card p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-black text-[var(--text-primary)]">{value}</div>
      <div className="text-sm text-[var(--text-muted)] mt-1">{label}</div>
    </div>
  );
}

export default function AdminPage() {
  const [apiKey, setApiKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!apiKey.trim()) return;
    setLoading(true);
    try {
      const data = await getAdminStats(apiKey);
      setStats(data);
      setAuthenticated(true);
      toast.success('Admin access granted');
    } catch {
      toast.error('Invalid admin API key');
    } finally {
      setLoading(false);
    }
  };

  const refresh = useCallback(async () => {
    if (!authenticated || !apiKey) return;
    try {
      const data = await getAdminStats(apiKey);
      setStats(data);
    } catch {
      // ignore periodic refresh errors
    }
  }, [authenticated, apiKey]);

  useEffect(() => {
    if (!authenticated) return;
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [authenticated, refresh]);

  return (
    <div className="hero-bg min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <ShieldCheckIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black gradient-text">Admin Panel</h1>
          </div>
          <p className="text-[var(--text-muted)] text-sm">Monitor downloads, users, and server health</p>
        </motion.div>

        {/* Auth Gate */}
        {!authenticated ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 max-w-md mx-auto text-center"
          >
            <LockClosedIcon className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-4" />
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Admin Access Required</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Enter your Admin API key to access the dashboard.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                placeholder="Admin API Key"
                className="input-primary flex-1"
              />
              <button onClick={handleAuth} disabled={loading} className="btn-brand">
                {loading ? '…' : 'Enter'}
              </button>
            </div>
          </motion.div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={ArrowDownTrayIcon}
                label="Downloads Today"
                value={stats.downloadsToday}
                color="bg-sky-500/10 text-sky-400"
              />
              <StatCard
                icon={ChartBarIcon}
                label="Total Downloads"
                value={stats.downloadsTotal}
                color="bg-violet-500/10 text-violet-400"
              />
              <StatCard
                icon={UsersIcon}
                label="Active Users"
                value={stats.activeUsers}
                color="bg-green-500/10 text-green-400"
              />
              <StatCard
                icon={ServerIcon}
                label="Server Uptime"
                value={formatUptime(stats.serverStatus.uptime)}
                color="bg-amber-500/10 text-amber-400"
              />
            </div>

            {/* Server Status + Top Platforms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Server */}
              <div className="glass-card p-5">
                <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <ServerIcon className="w-5 h-5 text-green-400" />
                  Server Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-secondary)]">Memory Usage</span>
                    <div className="flex items-center gap-2">
                      <div className="progress-bar w-24 h-2">
                        <div
                          className="progress-fill h-full"
                          style={{ width: `${stats.serverStatus.memoryUsage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {stats.serverStatus.memoryUsage}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Node.js</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {stats.serverStatus.nodeVersion}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Platform</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)] capitalize">
                      {stats.serverStatus.platform}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm text-green-400 font-medium">All systems operational</span>
                  </div>
                </div>
              </div>

              {/* Top Platforms */}
              <div className="glass-card p-5">
                <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5 text-sky-400" />
                  Top Platforms
                </h3>
                {stats.topPlatforms.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">No downloads yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.topPlatforms.map((p, i) => {
                      const maxCount = stats.topPlatforms[0]?.count || 1;
                      return (
                        <div key={p.platform}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-[var(--text-primary)] capitalize">{p.platform}</span>
                            <span className="text-[var(--text-muted)]">{p.count}</span>
                          </div>
                          <div className="progress-bar h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(p.count / maxCount) * 100}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1 }}
                              className="progress-fill h-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={refresh} className="btn-ghost gap-2">
                Auto-refreshes every 30s
              </button>
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
