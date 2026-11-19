'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import UrlInput from '@/components/home/UrlInput';
import SupportedServices from '@/components/home/SupportedServices';
import FeaturesSection from '@/components/home/FeaturesSection';
import FAQSection from '@/components/home/FAQ';
import RecentDownloads from '@/components/home/RecentDownloads';
import MediaInfoCard from '@/components/media/MediaInfo';
import { MediaInfoSkeleton } from '@/components/ui/SkeletonLoader';
import type { MediaInfo } from '@/types';

export default function HomePage() {
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResult = (info: MediaInfo) => {
    setMediaInfo(info);
    // Smooth scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="hero-bg min-h-screen">
      <Navbar />

      <main>
        {/* Hero */}
        <HeroSection />

        {/* URL Input */}
        <UrlInput
          onResult={handleResult}
          onLoading={setIsLoading}
          isLoading={isLoading}
        />

        {/* Results */}
        <div id="results" className="py-6">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-4xl mx-auto px-4"
              >
                <MediaInfoSkeleton />
              </motion.div>
            )}
            {!isLoading && mediaInfo && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <MediaInfoCard info={mediaInfo} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recent Downloads (shown only if no current result) */}
        {!mediaInfo && !isLoading && <RecentDownloads />}

        {/* Supported Services */}
        <SupportedServices />

        {/* Features */}
        <FeaturesSection />

        {/* FAQ */}
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
}
