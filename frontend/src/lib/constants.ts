// App-wide constants

export const APP_NAME = 'FetchLy';
export const APP_TAGLINE = 'Universal Media Downloader';
export const APP_DESCRIPTION =
  'Download videos, audio, and supported media from compatible platforms in the highest available quality.';

export const SUPPORTED_PLATFORMS = [
  { name: 'YouTube', icon: '▶', color: '#FF0000', domain: 'youtube.com' },
  { name: 'Vimeo', icon: '🎬', color: '#1AB7EA', domain: 'vimeo.com' },
  { name: 'Twitter / X', icon: '✖', color: '#1DA1F2', domain: 'twitter.com' },
  { name: 'Reddit', icon: '🤖', color: '#FF4500', domain: 'reddit.com' },
  { name: 'TikTok', icon: '♪', color: '#010101', domain: 'tiktok.com' },
  { name: 'Instagram', icon: '📸', color: '#E4405F', domain: 'instagram.com' },
  { name: 'Facebook', icon: '📘', color: '#1877F2', domain: 'facebook.com' },
  { name: 'Twitch', icon: '🎮', color: '#9146FF', domain: 'twitch.tv' },
  { name: 'Dailymotion', icon: '📺', color: '#0066FF', domain: 'dailymotion.com' },
  { name: 'Direct URLs', icon: '🔗', color: '#22D3EE', domain: '' },
];

export const VIDEO_QUALITIES = [
  { label: '4K (2160p)', value: '2160p', tag: '4K' },
  { label: '1440p (2K)', value: '1440p', tag: '2K' },
  { label: '1080p (FHD)', value: '1080p', tag: 'FHD' },
  { label: '720p (HD)', value: '720p', tag: 'HD' },
  { label: '480p', value: '480p', tag: '' },
  { label: '360p', value: '360p', tag: '' },
  { label: '240p', value: '240p', tag: '' },
  { label: '144p', value: '144p', tag: '' },
];

export const AUDIO_FORMATS = [
  { label: 'MP3', value: 'mp3', description: 'Most compatible' },
  { label: 'M4A', value: 'm4a', description: 'Apple devices' },
  { label: 'AAC', value: 'aac', description: 'High quality' },
  { label: 'WAV', value: 'wav', description: 'Lossless' },
  { label: 'FLAC', value: 'flac', description: 'Best lossless' },
  { label: 'Opus', value: 'opus', description: 'Web optimized' },
];

export const AUDIO_QUALITIES = [
  { label: '320 kbps', value: '320', description: 'Best' },
  { label: '256 kbps', value: '256', description: 'High' },
  { label: '192 kbps', value: '192', description: 'Good' },
  { label: '128 kbps', value: '128', description: 'Standard' },
];

export const FEATURES = [
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Powered by yt-dlp and FFmpeg for blazing-fast media extraction and downloads.',
  },
  {
    icon: '🎯',
    title: 'Smart Detection',
    description: 'Automatically detects URL type — video, audio, image, playlist, or shorts.',
  },
  {
    icon: '🎨',
    title: 'All Formats',
    description: 'MP4, WebM, MKV, MP3, FLAC, WAV, AAC, PNG, WEBP — we\'ve got you covered.',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    description: 'Your downloads stay private. No data is stored beyond your session.',
  },
  {
    icon: '📱',
    title: 'Works Everywhere',
    description: 'Fully responsive across desktop, tablet, and mobile devices.',
  },
  {
    icon: '🌍',
    title: 'Multi-Language',
    description: 'Available in 7 languages including English, Hindi, Spanish, and more.',
  },
];

export const FAQ = [
  {
    question: 'Is FetchLy free to use?',
    answer: 'Yes, FetchLy is completely free for personal use. We don\'t charge for downloads or require any subscription.',
  },
  {
    question: 'What platforms are supported?',
    answer: 'FetchLy supports hundreds of platforms including YouTube, Vimeo, Twitter/X, Reddit, TikTok, Instagram, Facebook, Twitch, Dailymotion, and thousands more via yt-dlp.',
  },
  {
    question: 'Is it legal to download videos?',
    answer: 'Downloading content is only legal for content you own, have permission to download, or content under permissive licenses. Always respect the terms of service of the platform and applicable copyright laws.',
  },
  {
    question: 'What is the maximum quality available?',
    answer: 'FetchLy automatically detects and offers all available qualities, up to 4K (2160p) where available. This depends entirely on what the source platform provides.',
  },
  {
    question: 'Can I download playlists?',
    answer: 'Yes, FetchLy supports playlist URLs. After pasting a playlist link, you can choose to download individual videos or the entire playlist.',
  },
  {
    question: 'Why is my download slow?',
    answer: 'Download speed depends on your internet connection and the source server. We support streaming downloads, so large files begin downloading immediately without waiting.',
  },
];

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
];
