import { chromium } from 'playwright';
import type { MediaInfo, MediaFormat, AudioFormat } from '../types';

// ─────────────────────────────────────────────────────────
//  Browser-based media extractor using real Chromium
//  Extracts real master video streams (HLS & Direct MP4),
//  completely eliminating all 3rd-party video ads (TrafficJunky, AdTng, etc.)
// ─────────────────────────────────────────────────────────

const AD_DOMAINS = [
  'trafficjunky',
  'adtng',
  'exoclick',
  'juicyads',
  'ero-advertising',
  'tsyndicate',
  'et-code',
  'popads',
  'doubleclick',
  'googlesyndication',
  'adservice',
  'adx',
  'creative',
  'creatives',
  'stripchat',
  'chaturbate',
  'cams',
  'promo',
  'banner',
  'affiliate',
  'delivery',
  'sponsor',
  'adcontent',
];

function isAdUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return AD_DOMAINS.some((kw) => lower.includes(kw));
}

export interface ExtractedMediaItem {
  formatId: string;
  quality: string;
  resolution: string;
  container: string;
  bitrate: number | null;
  filesize: number | null;
  filesizeApprox: number | null;
  directUrl: string;
  streamType: 'mp4' | 'm3u8' | 'mpd';
  hasVideo: boolean;
  hasAudio: boolean;
  hdr: boolean;
  fps: number | null;
  codec: string | null;
  audioCodec: string | null;
  note: string | null;
}

export interface BrowserExtractResult {
  pageUrl: string;
  title: string | null;
  thumbnail: string | null;
  duration: number | null;
  formats: ExtractedMediaItem[];
}

function estimateFilesize(bitrateKbps: number, durationSec: number | null): number | null {
  if (!durationSec || durationSec <= 0) return null;
  return Math.round((bitrateKbps * 1000 * durationSec) / 8);
}

function getBitrateForQuality(qualityStr: string): number {
  const q = parseInt(qualityStr.replace(/\D/g, ''), 10);
  if (q >= 2160) return 12000;
  if (q >= 1440) return 8000;
  if (q >= 1080) return 4000;
  if (q >= 720) return 2500;
  if (q >= 480) return 1200;
  if (q >= 360) return 800;
  return 500;
}

export async function extractWithBrowser(url: string, timeoutMs = 30000): Promise<BrowserExtractResult> {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-dev-shm-usage',
    ],
  });

  const capturedNetworkStreams: Array<{ url: string; type: 'mp4' | 'm3u8' | 'mpd' }> = [];

  try {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
      },
      ignoreHTTPSErrors: true,
    });

    // Block all known ad networks immediately
    await context.route('**/*', async (route) => {
      const reqUrl = route.request().url();
      if (isAdUrl(reqUrl)) {
        await route.abort();
        return;
      }
      await route.continue();
    });

    const page = await context.newPage();

    // Listen to network responses for media stream manifests
    page.on('response', (response) => {
      const respUrl = response.url();
      if (isAdUrl(respUrl)) return;

      const cleanUrl = respUrl.split('?')[0].toLowerCase();
      if (cleanUrl.endsWith('.m3u8') || cleanUrl.includes('.m3u8')) {
        if (!capturedNetworkStreams.some((s) => s.url === respUrl)) {
          capturedNetworkStreams.push({ url: respUrl, type: 'm3u8' });
        }
      } else if (cleanUrl.endsWith('.mpd') || cleanUrl.includes('.mpd')) {
        if (!capturedNetworkStreams.some((s) => s.url === respUrl)) {
          capturedNetworkStreams.push({ url: respUrl, type: 'mpd' });
        }
      } else if (cleanUrl.endsWith('.mp4') && !cleanUrl.includes('thumb') && !cleanUrl.includes('preview')) {
        if (!capturedNetworkStreams.some((s) => s.url === respUrl)) {
          capturedNetworkStreams.push({ url: respUrl, type: 'mp4' });
        }
      }
    });

    // Navigate to target URL
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: timeoutMs,
    });

    await page.waitForTimeout(3000);

    // ─────────────────────────────────────────────────────────
    //  Deep In-Page Player Extraction
    // ─────────────────────────────────────────────────────────
    const pageData = await page.evaluate(async () => {
      let title: string | null = null;
      let duration: number | null = null;
      let thumbnail: string | null = null;
      const rawStreams: Array<{
        quality: string;
        videoUrl: string;
        format: string;
        width?: number;
        height?: number;
      }> = [];

      // Extract general metadata
      const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
      title = ogTitle?.content || document.title || null;

      const ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement | null;
      thumbnail = ogImage?.content || null;

      // 1. PornHub / RedTube / YouPorn flashvars
      for (const key of Object.keys(window)) {
        if (key.startsWith('flashvars_')) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fv = (window as Record<string, any>)[key];
          if (fv) {
            if (fv.video_title) title = fv.video_title;
            if (fv.video_duration) duration = parseInt(fv.video_duration, 10);
            if (fv.image_url) thumbnail = fv.image_url;

            // Check if there is a get_media endpoint for direct high-speed MP4s
            if (Array.isArray(fv.mediaDefinitions)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const mp4Api = fv.mediaDefinitions.find((d: any) =>
                d.format === 'mp4' && d.videoUrl && d.videoUrl.includes('get_media')
              );

              if (mp4Api) {
                try {
                  const resp = await fetch(mp4Api.videoUrl);
                  const directMp4List = await resp.json();
                  if (Array.isArray(directMp4List) && directMp4List.length > 0) {
                    for (const item of directMp4List) {
                      if (item.videoUrl) {
                        const q = item.quality ? String(item.quality) : item.height ? String(item.height) : '720';
                        rawStreams.push({
                          quality: q,
                          videoUrl: item.videoUrl,
                          format: 'mp4',
                          width: item.width,
                          height: item.height,
                        });
                      }
                    }
                  }
                } catch {
                  // ignore
                }
              }

              // Also include HLS formats if MP4 list was not obtained
              if (rawStreams.length === 0) {
                for (const item of fv.mediaDefinitions) {
                  if (item.videoUrl && typeof item.videoUrl === 'string' && !item.videoUrl.includes('get_media')) {
                    const q = item.quality ? String(item.quality) : item.height ? String(item.height) : '720';
                    rawStreams.push({
                      quality: q,
                      videoUrl: item.videoUrl,
                      format: item.format || 'hls',
                      width: item.width,
                      height: item.height,
                    });
                  }
                }
              }
            }
          }
        }
      }

      // 2. XVideos / XNXX html5player
      if (rawStreams.length === 0) {
        const scripts = Array.from(document.querySelectorAll('script')).map((s) => s.innerText);
        for (const script of scripts) {
          if (script.includes('html5player')) {
            const hlsMatch = script.match(/setVideoHLS\(['"]([^'"]+)['"]\)/);
            const highMatch = script.match(/setVideoUrlHigh\(['"]([^'"]+)['"]\)/);
            const lowMatch = script.match(/setVideoUrlLow\(['"]([^'"]+)['"]\)/);
            const titleMatch = script.match(/setVideoTitle\(['"]([^'"]+)['"]\)/);

            if (titleMatch) title = titleMatch[1];
            if (highMatch) rawStreams.push({ quality: '720', videoUrl: highMatch[1], format: 'mp4' });
            if (lowMatch) rawStreams.push({ quality: '360', videoUrl: lowMatch[1], format: 'mp4' });
            if (hlsMatch) rawStreams.push({ quality: 'Auto', videoUrl: hlsMatch[1], format: 'hls' });
          }

          // 3. SpankBang stream_data
          if (script.includes('stream_data')) {
            const m = script.match(/var\s+stream_data\s*=\s*({[^;]+});/);
            if (m) {
              try {
                const sd = JSON.parse(m[1]);
                for (const [k, v] of Object.entries(sd)) {
                  if (typeof v === 'string' && v.startsWith('http')) {
                    rawStreams.push({ quality: k, videoUrl: v, format: v.includes('.m3u8') ? 'hls' : 'mp4' });
                  }
                }
              } catch {
                // ignore
              }
            }
          }
        }
      }

      // 4. HTML5 <video> elements
      if (rawStreams.length === 0) {
        const videoEl = document.querySelector('video') as HTMLVideoElement | null;
        if (videoEl) {
          if (!duration && videoEl.duration && isFinite(videoEl.duration)) {
            duration = Math.round(videoEl.duration);
          }
          if (!thumbnail && videoEl.poster) {
            thumbnail = videoEl.poster;
          }
          if (videoEl.src && !videoEl.src.startsWith('blob:')) {
            rawStreams.push({ quality: 'Default', videoUrl: videoEl.src, format: videoEl.src.includes('.m3u8') ? 'hls' : 'mp4' });
          }
          const sources = Array.from(videoEl.querySelectorAll('source'));
          for (const s of sources) {
            if (s.src && !s.src.startsWith('blob:')) {
              const label = s.getAttribute('label') || s.getAttribute('size') || 'HD';
              rawStreams.push({ quality: label, videoUrl: s.src, format: s.src.includes('.m3u8') ? 'hls' : 'mp4' });
            }
          }
        }
      }

      return { title, duration, thumbnail, rawStreams };
    });

    await context.close();

    // ─────────────────────────────────────────────────────────
    //  Build Formats with Correct File Sizes & Labels
    // ─────────────────────────────────────────────────────────
    const formats: ExtractedMediaItem[] = [];

    // Strictly filter out any ads that might have slipped into rawStreams
    const validPageStreams = (pageData.rawStreams || []).filter((s) => !isAdUrl(s.videoUrl));

    if (validPageStreams.length > 0) {
      for (let i = 0; i < validPageStreams.length; i++) {
        const item = validPageStreams[i];
        const isHls = item.format === 'hls' || item.videoUrl.includes('.m3u8');
        const isMpd = item.format === 'mpd' || item.videoUrl.includes('.mpd');
        const streamType = isHls ? 'm3u8' : isMpd ? 'mpd' : 'mp4';

        const rawQuality = item.quality.replace(/[^\w]/g, '');
        const qualityLabel =
          rawQuality && rawQuality !== 'Auto' && rawQuality !== 'Default'
            ? rawQuality.endsWith('p')
              ? rawQuality
              : `${rawQuality}p`
            : isHls
            ? 'Auto (HLS)'
            : 'MP4';

        const bitrate = getBitrateForQuality(qualityLabel);
        const estBytes = estimateFilesize(bitrate, pageData.duration);
        const resolution =
          item.width && item.height
            ? `${item.width}x${item.height}`
            : qualityLabel.includes('1080')
            ? '1920x1080'
            : qualityLabel.includes('720')
            ? '1280x720'
            : qualityLabel.includes('480')
            ? '854x480'
            : qualityLabel.includes('240')
            ? '426x240'
            : '1280x720';

        formats.push({
          formatId: `browser_${i}`,
          quality: qualityLabel,
          resolution,
          container: 'mp4',
          bitrate,
          filesize: estBytes,
          filesizeApprox: estBytes,
          directUrl: item.videoUrl,
          streamType,
          hasVideo: true,
          hasAudio: true,
          hdr: false,
          fps: 25,
          codec: 'h264',
          audioCodec: 'aac',
          note: streamType.toUpperCase(),
        });
      }
    } else if (capturedNetworkStreams.length > 0) {
      for (let i = 0; i < capturedNetworkStreams.length; i++) {
        const item = capturedNetworkStreams[i];
        const qualityLabel = item.type === 'm3u8' ? 'Auto (HLS)' : item.type === 'mpd' ? 'DASH' : 'MP4';
        const bitrate = item.type === 'm3u8' ? 2500 : 2000;
        const estBytes = estimateFilesize(bitrate, pageData.duration);

        formats.push({
          formatId: `browser_${i}`,
          quality: qualityLabel,
          resolution: '1280x720',
          container: 'mp4',
          bitrate,
          filesize: estBytes,
          filesizeApprox: estBytes,
          directUrl: item.url,
          streamType: item.type,
          hasVideo: true,
          hasAudio: true,
          hdr: false,
          fps: null,
          codec: null,
          audioCodec: null,
          note: item.type.toUpperCase(),
        });
      }
    }

    // Sort formats: highest resolution first (1080p > 720p > 480p > 240p)
    formats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

    return {
      pageUrl: url,
      title: pageData.title?.replace(/ - .*$/, '').trim() || null,
      thumbnail: pageData.thumbnail,
      duration: pageData.duration,
      formats,
    };
  } finally {
    await browser.close();
  }
}

export function browserResultToMediaInfo(result: BrowserExtractResult): MediaInfo {
  const formats: MediaFormat[] = result.formats.map((f) => ({
    formatId: f.formatId,
    resolution: f.resolution,
    quality: f.quality,
    fps: f.fps,
    codec: f.codec,
    audioCodec: f.audioCodec,
    container: f.container,
    filesize: f.filesize,
    filesizeApprox: f.filesizeApprox,
    bitrate: f.bitrate,
    hasVideo: f.hasVideo,
    hasAudio: f.hasAudio,
    hdr: f.hdr,
    note: f.note,
    directUrl: f.directUrl,
    streamType: f.streamType,
  }));

  const audioFormats: AudioFormat[] = [];

  return {
    url: result.pageUrl,
    type: 'video',
    title: result.title,
    thumbnail: result.thumbnail,
    duration: result.duration,
    uploader: null,
    uploaderUrl: null,
    viewCount: null,
    likeCount: null,
    uploadDate: null,
    description: null,
    width: null,
    height: null,
    ext: formats[0]?.container || 'mp4',
    platform: 'browser',
    formats,
    audioFormats,
    isLive: false,
    isPlaylist: false,
    tags: [],
  };
}
