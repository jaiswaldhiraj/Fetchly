# 🎬 FetchLy — Universal Media Downloader

A modern, full-stack media downloader that lets users paste any supported URL and retrieve all available download formats, resolutions, metadata, and more.

![FetchLy](https://img.shields.io/badge/FetchLy-v1.0.0-blueviolet?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)

---

## ✨ Features

- 🎥 **Video Downloads** — 4K, 1440p, 1080p, 720p, 480p, 360p, 240p, 144p
- 🎵 **Audio Downloads** — MP3, M4A, AAC, WAV, FLAC, Opus (up to 320kbps)
- 🖼️ **Image Downloads** — PNG, JPG, WEBP, AVIF, GIF with preview
- 📋 **Smart URL Detection** — Auto-detect video, image, audio, playlist, shorts
- 📥 **Download Progress** — Real-time progress bar, speed, ETA
- 🕐 **Download History** — Persistent history with re-download support
- 🌙 **Dark/Light Mode** — Auto system theme detection
- 🌍 **Multi-Language** — EN, HI, ES, FR, DE, AR, JA
- 📋 **Clipboard Detection** — Auto-suggest when URL is copied
- 🔒 **Security** — Rate limiting, URL validation, XSS/CSRF protection
- 📊 **Admin Dashboard** — Download stats, active users, server status
- 🐳 **Docker Support** — One-command setup
- ⚡ **Redis Caching** — Fast repeated lookups

---

## 📁 Project Structure

```
FetchLy/
├── frontend/                 # Next.js 14 frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities, API client, i18n
│   │   └── types/           # TypeScript types
│   └── package.json
├── backend/                  # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── config/          # Configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── types/           # TypeScript types
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Quick Start (Docker)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/fetchly.git
cd fetchly

# 2. Copy environment variables
cp .env.example .env

# 3. Start everything
docker-compose up -d

# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

---

## 🛠️ Manual Installation

### Prerequisites

- Node.js 20+
- npm or yarn
- yt-dlp (`pip install yt-dlp` or download from https://github.com/yt-dlp/yt-dlp)
- FFmpeg (https://ffmpeg.org/download.html)
- Redis (optional, for caching)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your configuration
npm run dev
```

---

## 🔧 Environment Variables

### Backend (`.env`)

```env
PORT=5000
NODE_ENV=development
ADMIN_API_KEY=your-secret-admin-key

# Database (SQLite by default, set for PostgreSQL)
DATABASE_URL=./data/fetchly.db
# DATABASE_URL=postgresql://user:password@localhost:5432/fetchly

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# yt-dlp
YTDLP_PATH=yt-dlp
FFMPEG_PATH=ffmpeg

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=FetchLy
```

---

## 📡 API Reference

### `POST /api/analyze`
Analyze a URL and return all available media information.

**Request:**
```json
{ "url": "https://example.com/video" }
```

**Response:**
```json
{
  "type": "video",
  "title": "Example Video",
  "thumbnail": "https://...",
  "duration": 360,
  "uploader": "Channel Name",
  "viewCount": 1000000,
  "uploadDate": "2024-01-01",
  "description": "...",
  "formats": [
    {
      "formatId": "137",
      "resolution": "1920x1080",
      "quality": "1080p",
      "fps": 30,
      "codec": "avc1",
      "container": "mp4",
      "filesize": 52428800,
      "hasVideo": true,
      "hasAudio": false,
      "hdr": false
    }
  ]
}
```

### `POST /api/download`
Stream a file download.

**Request:**
```json
{ "url": "https://example.com/video", "formatId": "137+140" }
```

### `POST /api/audio`
Download audio only.

**Request:**
```json
{ "url": "https://...", "format": "mp3", "quality": "320" }
```

### `POST /api/image`
Download an image.

**Request:**
```json
{ "url": "https://example.com/image.jpg" }
```

### `GET /api/history`
Get download history.

### `DELETE /api/history/:id`
Delete a history entry.

### `GET /api/admin/stats` *(requires Admin-Key header)*
Get admin statistics.

---

## 🚢 Deployment

### Vercel (Frontend)

```bash
cd frontend
npx vercel --prod
```

Set environment variable `NEXT_PUBLIC_API_URL` to your deployed backend URL.

### Railway / Render / Fly.io (Backend)

```bash
cd backend
npm run build
# Deploy the dist/ folder with Node.js 20
```

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🧪 Tests

```bash
# Backend tests
cd backend && npm test

# Frontend type check
cd frontend && npm run type-check
```

---

## ⚖️ Legal Disclaimer

This tool is intended for downloading content you own or have explicit permission to download. Users are solely responsible for complying with applicable laws and the terms of service of any platform they interact with. The developers do not condone or support any illegal use of this software.

---

## 📄 License

MIT License — See [LICENSE](LICENSE)

---

Made with ❤️ by the FetchLy team
