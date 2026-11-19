'use client';

import { motion } from 'framer-motion';
import { FEATURES } from '@/lib/constants';

export default function FeaturesSection() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-black mb-4">
          <span className="gradient-text">Everything</span>{' '}
          <span className="text-[var(--text-primary)]">You Need</span>
        </h2>
        <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
          A complete media downloading solution with no compromises.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="glass-card p-6 group cursor-default"
          >
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-200 inline-block">
              {feature.icon}
            </div>
            <h3 className="text-lg font-bold mb-2 text-[var(--text-primary)]">{feature.title}</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
