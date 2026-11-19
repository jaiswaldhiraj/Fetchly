'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Cog6ToothIcon, CheckIcon } from '@heroicons/react/24/outline';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AUDIO_FORMATS, AUDIO_QUALITIES, VIDEO_QUALITIES, LANGUAGES } from '@/lib/constants';
import type { Settings } from '@/types';
import toast from 'react-hot-toast';

const defaultSettings: Settings = {
  theme: 'system',
  preferredVideoFormat: 'mp4',
  preferredAudioFormat: 'mp3',
  preferredQuality: '1080p',
  language: 'en',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const { setTheme } = useTheme();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fetchly-settings');
      if (saved) {
        try {
          setSettings({ ...defaultSettings, ...JSON.parse(saved) });
        } catch {
          // ignore corrupted settings
        }
      }
    }
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (key === 'theme') {
      setTheme(value as string);
    }
  };

  const save = () => {
    localStorage.setItem('fetchly-settings', JSON.stringify(settings));
    toast.success('Settings saved!');
  };

  const reset = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('fetchly-settings');
    toast.success('Settings reset to defaults');
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="glass-card p-5 sm:p-6 space-y-4">
      <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );

  const OptionGroup = ({
    label,
    options,
    value,
    onChange,
  }: {
    label: string;
    options: { label: string; value: string }[];
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div>
      <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
              value === opt.value
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'glass text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {value === opt.value && <CheckIcon className="w-3 h-3" />}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="hero-bg min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
              <Cog6ToothIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black gradient-text">Settings</h1>
          </div>
          <p className="text-[var(--text-muted)] text-sm">Customize your FetchLy experience</p>
        </motion.div>

        <div className="space-y-4">
          <Section title="Appearance">
            <OptionGroup
              label="Theme"
              value={settings.theme}
              onChange={(v) => update('theme', v as Settings['theme'])}
              options={[
                { label: '☀️ Light', value: 'light' },
                { label: '🌙 Dark', value: 'dark' },
                { label: '💻 System', value: 'system' },
              ]}
            />
          </Section>

          <Section title="Downloads">
            <OptionGroup
              label="Preferred Video Quality"
              value={settings.preferredQuality}
              onChange={(v) => update('preferredQuality', v)}
              options={VIDEO_QUALITIES.map((q) => ({ label: q.label.split(' ')[0], value: q.value }))}
            />
            <OptionGroup
              label="Preferred Audio Format"
              value={settings.preferredAudioFormat}
              onChange={(v) => update('preferredAudioFormat', v as Settings['preferredAudioFormat'])}
              options={AUDIO_FORMATS.map((f) => ({ label: f.label, value: f.value }))}
            />
          </Section>

          <Section title="Language">
            <OptionGroup
              label="Interface Language"
              value={settings.language}
              onChange={(v) => update('language', v as Settings['language'])}
              options={LANGUAGES.map((l) => ({ label: `${l.nativeName}`, value: l.code }))}
            />
          </Section>
        </div>

        {/* Save/Reset */}
        <div className="flex gap-3 mt-6">
          <button onClick={save} className="btn-brand flex-1 justify-center">
            Save Settings
          </button>
          <button onClick={reset} className="btn-ghost">
            Reset
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
