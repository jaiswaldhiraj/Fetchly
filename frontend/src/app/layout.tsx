import type { Metadata } from 'next';
import { Providers } from '@/components/layout/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'FetchLy — Universal Media Downloader',
    template: '%s | FetchLy',
  },
  description:
    'Download videos, audio, and supported media from compatible platforms in the highest available quality. Free, fast, and secure.',
  keywords: [
    'video downloader', 'youtube downloader', 'audio downloader',
    'media downloader', 'mp3 downloader', 'universal downloader', 'FetchLy'
  ],
  authors: [{ name: 'FetchLy' }],
  creator: 'FetchLy',
  metadataBase: new URL('https://fetchly.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://fetchly.app',
    title: 'FetchLy — Universal Media Downloader',
    description: 'Download videos, audio, and media from compatible platforms.',
    siteName: 'FetchLy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FetchLy — Universal Media Downloader',
    description: 'Download videos, audio, and media from compatible platforms.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
