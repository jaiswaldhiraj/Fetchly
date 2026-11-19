'use client';

import { motion } from 'framer-motion';
import { SUPPORTED_PLATFORMS } from '@/lib/constants';

export default function SupportedServices() {
  return (
    <section id="platforms" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl sm:text-3xl font-black mb-3">
          <span className="text-[var(--text-primary)]">Supported</span>{' '}
          <span className="gradient-text">Platforms</span>
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Supports thousands of sites via yt-dlp — these are just the most popular ones.
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-3">
        {SUPPORTED_PLATFORMS.map((platform, i) => (
          <motion.div
            key={platform.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05, y: -2 }}
            className="glass rounded-xl px-4 py-3 flex items-center gap-2.5 cursor-default select-none"
          >
            <span className="text-lg">{platform.icon}</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">{platform.name}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
