'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { gzip, unzip, zip as fflateZip } from 'fflate';
import { PDFDocument } from 'pdf-lib';
import { usePathname } from 'next/navigation';
import { PageTitle } from '../title';
import ContentSection from '@/components/ui/content';

// ============================================================================
// TYPES & PRESETS
// ============================================================================

interface Preset {
  label: string;
  tag: string;
  desc: string;
  color: string;
  ring: string;
  imgQ: number;
  imgS: number;
  pdfS: number;
  pdfQ: number;
  audBps: number;
  vidBps: number;
  vidS: number;
}

interface Result {
  originalSize: number;
  compressedSize: number;
  ratio: number;
  url: string;
  downloadName: string;
  method: string;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  tags?: string[];
  popular?: boolean;
  isNew?: boolean;
}

interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
  tools: Tool[];
}

export const categoriesHub: Category[] = [
  {
    id: 'image',
    label: 'Image',
    icon: '🖼️',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
    tools: [
      {
        id: 'png',
        name: 'PNG Compressor',
        description: 'Losslessly shrink PNG files.',
        tags: ['png', 'lossless'],
        popular: true,
      },
      {
        id: 'jpg',
        name: 'JPG Compressor',
        description: 'Reduce JPG sizes.',
        tags: ['jpg', 'jpeg'],
        popular: true,
      },
      {
        id: 'jpeg',
        name: 'JPEG Compressor',
        description: 'Optimise JPEG for web.',
        tags: ['jpeg', 'image'],
      },
      {
        id: 'webp',
        name: 'WebP Compressor',
        description: 'Compress WebP images.',
        tags: ['webp', 'image'],
        isNew: true,
      },
      {
        id: 'gif',
        name: 'GIF Compressor',
        description: 'Reduce animated GIF sizes.',
        tags: ['gif', 'animated'],
      },
      {
        id: 'svg',
        name: 'SVG Compressor',
        description: 'Minify SVG vector files.',
        tags: ['svg', 'vector'],
      },
      {
        id: 'avif',
        name: 'AVIF Compressor',
        description: 'Compress AVIF images.',
        tags: ['avif'],
        isNew: true,
      },
      {
        id: 'bmp',
        name: 'BMP Compressor',
        description: 'Compress legacy BMP bitmaps.',
        tags: ['bmp', 'bitmap'],
      },
      {
        id: 'tiff',
        name: 'TIFF Compressor',
        description: 'Reduce TIFF file sizes.',
        tags: ['tiff', 'print'],
      },
      {
        id: 'ico',
        name: 'ICO Compressor',
        description: 'Compress favicon ICO files.',
        tags: ['ico', 'favicon'],
      },
      {
        id: 'heic',
        name: 'HEIC Compressor',
        description: 'Compress Apple HEIC photos.',
        tags: ['heic', 'apple'],
      },
      {
        id: 'psd',
        name: 'PSD Compressor',
        description: 'Reduce Photoshop PSD sizes.',
        tags: ['psd', 'photoshop'],
      },
      {
        id: 'bulk-img',
        name: 'Bulk Image Compressor',
        description: 'Compress many images at once.',
        tags: ['bulk', 'batch'],
        popular: true,
      },
      {
        id: 'res-img',
        name: 'Resolution Compressor',
        description: 'Downscale image resolution.',
        tags: ['resolution', 'resize'],
      },
    ],
  },
  {
    id: 'video',
    label: 'Video',
    icon: '🎥',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
    tools: [
      {
        id: 'mp4',
        name: 'MP4 Compressor',
        description: 'Compress MP4 videos.',
        tags: ['mp4', 'video'],
        popular: true,
      },
      {
        id: 'mov',
        name: 'MOV Compressor',
        description: 'Reduce Apple MOV sizes.',
        tags: ['mov', 'apple'],
      },
      {
        id: 'avi',
        name: 'AVI Compressor',
        description: 'Compress AVI video files.',
        tags: ['avi', 'legacy'],
      },
      {
        id: 'mkv',
        name: 'MKV Compressor',
        description: 'Compress MKV containers.',
        tags: ['mkv', 'video'],
      },
      {
        id: 'webm',
        name: 'WebM Compressor',
        description: 'Compress WebM videos.',
        tags: ['webm', 'web'],
      },
      {
        id: '4k',
        name: '4K Compressor',
        description: 'Compress ultra-HD 4K footage.',
        tags: ['4k', 'uhd'],
        popular: true,
      },
      {
        id: 'hd',
        name: 'HD Compressor',
        description: 'Reduce 1080p/720p sizes.',
        tags: ['hd', '1080p'],
      },
      {
        id: 'yt',
        name: 'YouTube Compressor',
        description: 'Compress for YouTube.',
        tags: ['youtube', 'video'],
      },
    ],
  },
  {
    id: 'audio',
    label: 'Audio',
    icon: '🎵',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    tools: [
      {
        id: 'mp3',
        name: 'MP3 Compressor',
        description: 'Reduce MP3 file sizes.',
        tags: ['mp3', 'audio'],
        popular: true,
      },
      {
        id: 'wav',
        name: 'WAV Compressor',
        description: 'Resample & shrink WAV.',
        tags: ['wav', 'audio'],
      },
      {
        id: 'aac',
        name: 'AAC Compressor',
        description: 'Optimise AAC audio.',
        tags: ['aac', 'audio'],
      },
      {
        id: 'ogg',
        name: 'OGG Compressor',
        description: 'Compress OGG Vorbis.',
        tags: ['ogg', 'audio'],
      },
      {
        id: 'flac',
        name: 'FLAC Compressor',
        description: 'Reduce FLAC sizes.',
        tags: ['flac', 'audio'],
      },
      {
        id: 'm4a',
        name: 'M4A Compressor',
        description: 'Compress Apple M4A.',
        tags: ['m4a', 'apple'],
      },
    ],
  },
  {
    id: 'document',
    label: 'Document',
    icon: '📄',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/20',
    tools: [
      {
        id: 'pdf',
        name: 'PDF Compressor',
        description: 'Compress PDF files (page-render method).',
        tags: ['pdf'],
        popular: true,
      },
      {
        id: 'docx',
        name: 'DOCX Compressor',
        description: 'Compress Word documents.',
        tags: ['docx', 'word'],
        popular: true,
      },
      {
        id: 'xlsx',
        name: 'XLSX Compressor',
        description: 'Compress Excel spreadsheets.',
        tags: ['xlsx', 'excel'],
      },
      {
        id: 'pptx-doc',
        name: 'PPTX Compressor',
        description: 'Compress PowerPoint files.',
        tags: ['pptx', 'slides'],
      },
      {
        id: 'epub',
        name: 'EPUB Compressor',
        description: 'Compress eBook EPUB files.',
        tags: ['epub', 'ebook'],
      },
      {
        id: 'txt',
        name: 'TXT Compressor',
        description: 'Gzip-compress text files.',
        tags: ['txt', 'text'],
      },
    ],
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: '📦',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    tools: [
      {
        id: 'zip',
        name: 'ZIP Compressor',
        description: 'Re-compress ZIP at DEFLATE level 9.',
        tags: ['zip'],
        popular: true,
      },
      {
        id: 'rar',
        name: 'RAR Compressor',
        description: 'Gzip-wrap RAR archives.',
        tags: ['rar'],
        popular: true,
      },
      {
        id: '7z',
        name: '7Z Compressor',
        description: 'Gzip-wrap 7-Zip archives.',
        tags: ['7z', 'archive'],
      },
      {
        id: 'tar',
        name: 'TAR Compressor',
        description: 'Gzip-compress TAR bundles.',
        tags: ['tar', 'unix'],
      },
      {
        id: 'gz',
        name: 'GZ Compressor',
        description: 'GZIP compress any file.',
        tags: ['gzip', 'gz'],
      },
      {
        id: 'folder',
        name: 'Folder → ZIP',
        description: 'Pack entire folder into compressed ZIP.',
        tags: ['folder'],
        popular: true,
      },
    ],
  },
  {
    id: 'developer',
    label: 'Developer',
    icon: '💻',
    color: 'text-lime-400',
    bg: 'bg-lime-500/10 border-lime-500/20',
    tools: [
      {
        id: 'html-min',
        name: 'HTML Minifier',
        description: 'Strip whitespace from HTML.',
        tags: ['html', 'minify'],
        popular: true,
      },
      {
        id: 'css-min',
        name: 'CSS Minifier',
        description: 'Minify CSS stylesheets.',
        tags: ['css', 'minify'],
        popular: true,
      },
      {
        id: 'js-min',
        name: 'JS Minifier',
        description: 'Minify JavaScript bundles.',
        tags: ['js', 'minify'],
        popular: true,
      },
      {
        id: 'json-min',
        name: 'JSON Minifier',
        description: 'Compact JSON data.',
        tags: ['json', 'minify'],
      },
      {
        id: 'xml-min',
        name: 'XML Minifier',
        description: 'Minify XML markup.',
        tags: ['xml', 'minify'],
      },
      { id: 'sql-min', name: 'SQL Compressor', description: 'Minify SQL queries.', tags: ['sql'] },
      {
        id: 'ts-min',
        name: 'TypeScript Compressor',
        description: 'Compress TS/TSX files.',
        tags: ['ts', 'typescript'],
      },
      { id: 'php-min', name: 'PHP Compressor', description: 'Minify PHP source.', tags: ['php'] },
      {
        id: 'py-min',
        name: 'Python Compressor',
        description: 'Minify Python scripts.',
        tags: ['python', 'py'],
      },
      {
        id: 'yaml-min',
        name: 'YAML Compressor',
        description: 'Compress YAML config.',
        tags: ['yaml'],
      },
    ],
  },
  {
    id: 'social',
    label: 'Social',
    icon: '📱',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/20',
    tools: [
      {
        id: 'whatsapp',
        name: 'WhatsApp Image',
        description: 'Optimise images for WhatsApp.',
        tags: ['whatsapp'],
        popular: true,
      },
      {
        id: 'instagram',
        name: 'Instagram Image',
        description: 'Compress for Instagram.',
        tags: ['instagram'],
      },
      {
        id: 'facebook',
        name: 'Facebook Image',
        description: 'Optimise for Facebook.',
        tags: ['facebook'],
      },
      { id: 'tiktok', name: 'TikTok Video', description: 'Compress for TikTok.', tags: ['tiktok'] },
      {
        id: 'thumbnail',
        name: 'Thumbnail',
        description: 'Optimise video thumbnails.',
        tags: ['thumbnail', 'youtube'],
      },
      {
        id: 'screenshot',
        name: 'Screenshot',
        description: 'Compress app screenshots.',
        tags: ['screenshot'],
      },
    ],
  },
];

const PRESETS: Preset[] = [
  {
    label: 'Light',
    tag: '−20%',
    desc: 'Best quality, moderate reduction',
    color: 'bg-sky-500/15 border-sky-500/50 text-sky-300',
    ring: 'ring-sky-400',
    imgQ: 80,
    imgS: 92,
    pdfS: 0.88,
    pdfQ: 0.78,
    audBps: 128_000,
    vidBps: 2_200_000,
    vidS: 92,
  },
  {
    label: 'Medium',
    tag: '−35%',
    desc: 'Balanced quality and size',
    color: 'bg-amber-500/15 border-amber-500/50 text-amber-300',
    ring: 'ring-amber-400',
    imgQ: 62,
    imgS: 82,
    pdfS: 0.74,
    pdfQ: 0.6,
    audBps: 96_000,
    vidBps: 1_100_000,
    vidS: 78,
  },
  {
    label: 'Heavy',
    tag: '−50%',
    desc: 'Smallest file, lower quality',
    color: 'bg-rose-500/15 border-rose-500/50 text-rose-300',
    ring: 'ring-rose-400',
    imgQ: 40,
    imgS: 68,
    pdfS: 0.56,
    pdfQ: 0.38,
    audBps: 48_000,
    vidBps: 550_000,
    vidS: 60,
  },
];

// ============================================================================
// UTILITIES
// ============================================================================

function fmt(b: number) {
  if (b <= 0) return '0 B';
  if (b < 1024) return `${b} B`;
  if (b < 1 << 20) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1 << 20)).toFixed(2)} MB`;
}

function detectKind(file: File): string {
  const n = file.name.toLowerCase(),
    m = file.type;
  if (
    m.startsWith('image/') ||
    n.match(/\.(png|jpg|jpeg|webp|gif|bmp|tiff?|ico|svg|avif|heic|heif|raw|cr2|nef|psd|tga|dng)$/)
  )
    return 'image';
  if (m.startsWith('video/') || n.match(/\.(mp4|mov|avi|mkv|webm|flv|wmv|m4v|3gp|ogv|ts|rm)$/))
    return 'video';
  if (m.startsWith('audio/') || n.match(/\.(mp3|wav|aac|ogg|flac|m4a|wma|aiff?|opus|amr)$/))
    return 'audio';
  if (m === 'application/pdf' || n.endsWith('.pdf')) return 'pdf';
  if (n.match(/\.(docx|xlsx|pptx|odt|ods|odp|epub|apk|jar|ipa)$/)) return 'office';
  if (n.endsWith('.zip')) return 'zip';
  if (n.match(/\.(rar|7z|tar|gz|bz2|xz|zst|lz4|cab|iso|dmg)$/)) return 'archbin';
  if (
    m.includes('text') ||
    n.match(
      /\.(js|mjs|ts|jsx|tsx|json|html?|css|xml|txt|php|py|rb|go|rs|java|cpp|c|h|cs|sh|yaml|yml|toml|sql|graphql|md|rtf|csv|log|conf|ini|env)$/
    ) ||
    n === 'dockerfile' ||
    n === 'makefile'
  )
    return 'text';
  return 'binary';
}

// fflate promisified
const p_gzip = (d: Uint8Array, lv = 9) =>
  new Promise<Uint8Array>((ok, no) =>
    gzip(d, { level: lv as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 }, (e, r) => (e ? no(e) : ok(r)))
  );
const p_unzip = (d: Uint8Array) =>
  new Promise<Record<string, Uint8Array>>((ok, no) => unzip(d, (e, r) => (e ? no(e) : ok(r))));
const p_zip = (files: Record<string, Uint8Array>, lv = 9) =>
  new Promise<Uint8Array>((ok, no) => {
    const inp: Record<
      string,
      Uint8Array | [Uint8Array, { level: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 }]
    > = {};
    for (const [k, v] of Object.entries(files))
      inp[k] = [v, { level: lv as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 }];
    fflateZip(inp, (e, r) => (e ? no(e) : ok(r)));
  });

// ── gzip fallback ─────────────────────────────────────────────────────────────
async function eng_gzip(file: File): Promise<{ file: File; method: string }> {
  const raw = new Uint8Array(await file.arrayBuffer());
  const gz = await p_gzip(raw);
  if (gz.length >= raw.length) return { file, method: 'Already compressed — no gain from gzip' };
  return {
    file: new File([new Uint8Array(gz)], file.name + '.gz', { type: 'application/gzip' }),
    method: 'fflate gzip',
  };
}

// ── IMAGE ──────────────────────────────────────────────────────────────────────
function canvasHasTransparency(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  try {
    const sw = Math.min(w, 200),
      sh = Math.min(h, 200);
    const data = ctx.getImageData(0, 0, sw, sh).data;
    for (let i = 3; i < data.length; i += 4) if (data[i] < 250) return true;
  } catch {
    /**/
  }
  return false;
}

async function eng_image(
  file: File,
  quality: number,
  scalePct: number
): Promise<{ file: File; method: string }> {
  const n = file.name.toLowerCase(),
    scale = scalePct / 100;

  if (n.endsWith('.svg') || file.type === 'image/svg+xml') {
    const src = await file.text();
    const min = src
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
    const out = new File([min], file.name, { type: 'image/svg+xml' });
    if (out.size >= file.size) return { file, method: 'SVG already minimal' };
    return { file: out, method: 'SVG minification' };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('File read failed'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Image decode failed'));
      img.onload = () => {
        const W = Math.max(1, Math.round(img.width * scale));
        const H = Math.max(1, Math.round(img.height * scale));
        const cv = document.createElement('canvas');
        cv.width = W;
        cv.height = H;
        const ctx = cv.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, W, H);

        const isPngInput = n.endsWith('.png') || file.type === 'image/png';
        const transparent = isPngInput && canvasHasTransparency(ctx, W, H);
        const useJpeg = !transparent;
        const outMime = useJpeg ? 'image/jpeg' : 'image/png';
        if (useJpeg) {
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, W, H);
          ctx.globalCompositeOperation = 'source-over';
        }

        const cv2 = document.createElement('canvas');
        cv2.width = W;
        cv2.height = H;
        const ctx2 = cv2.getContext('2d')!;
        if (useJpeg) {
          ctx2.fillStyle = '#ffffff';
          ctx2.fillRect(0, 0, W, H);
        }
        ctx2.drawImage(img, 0, 0, W, H);

        const outQ = useJpeg ? quality / 100 : undefined;
        cv2.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas toBlob returned null'));
              return;
            }
            if (blob.size >= file.size && useJpeg && isPngInput) {
              cv2.toBlob((pngBlob) => {
                if (!pngBlob || pngBlob.size >= file.size) {
                  const fW = Math.max(1, Math.round(img.width * scale * 0.8));
                  const fH = Math.max(1, Math.round(img.height * scale * 0.8));
                  const cv3 = document.createElement('canvas');
                  cv3.width = fW;
                  cv3.height = fH;
                  const ctx3 = cv3.getContext('2d')!;
                  ctx3.fillStyle = '#ffffff';
                  ctx3.fillRect(0, 0, fW, fH);
                  ctx3.drawImage(img, 0, 0, fW, fH);
                  cv3.toBlob(
                    (fb) => {
                      if (!fb || fb.size >= file.size) {
                        resolve({ file, method: 'Already at minimum size' });
                        return;
                      }
                      resolve({
                        file: new File([fb], file.name.replace(/\.[^.]+$/, '.jpg'), {
                          type: 'image/jpeg',
                        }),
                        method: `Canvas JPEG ${quality}% @ 80% scale (forced reduction)`,
                      });
                    },
                    'image/jpeg',
                    quality / 100
                  );
                  return;
                }
                resolve({
                  file: new File([pngBlob], file.name, { type: 'image/png' }),
                  method: `Canvas PNG ${scalePct}% scale → ${W}×${H}px`,
                });
              }, 'image/png');
              return;
            }
            if (blob.size >= file.size) {
              resolve({ file, method: 'Already at minimum size for this format' });
              return;
            }
            const outName =
              isPngInput && useJpeg ? file.name.replace(/\.png$/i, '.jpg') : file.name;
            resolve({
              file: new File([blob], outName, { type: outMime }),
              method: transparent
                ? `Canvas PNG (transparent) — ${scalePct}% scale → ${W}×${H}px`
                : `Canvas JPEG ${quality}% — ${scalePct}% scale → ${W}×${H}px${isPngInput ? ' (PNG→JPG)' : ''}`,
            });
          },
          outMime,
          outQ
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ── PDF via PDF.js ──────────────────────────────────────────────────────────────
let _pdfJsPromise: Promise<any> | null = null;
function loadPdfJs(): Promise<any> {
  if (_pdfJsPromise) return _pdfJsPromise;
  _pdfJsPromise = new Promise((resolve, reject) => {
    const w = window as any;
    if (w.pdfjsLib?.getDocument) {
      resolve(w.pdfjsLib);
      return;
    }
    const VER = '3.11.174';
    const s = document.createElement('script');
    s.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${VER}/pdf.min.js`;
    s.crossOrigin = 'anonymous';
    s.referrerPolicy = 'no-referrer';
    s.onload = () => {
      const lib = w.pdfjsLib;
      if (!lib?.getDocument) {
        _pdfJsPromise = null;
        reject(new Error('pdfjsLib not found after script load'));
        return;
      }
      lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${VER}/pdf.worker.min.js`;
      resolve(lib);
    };
    s.onerror = () => {
      _pdfJsPromise = null;
      reject(new Error('PDF.js CDN failed to load'));
    };
    document.head.appendChild(s);
  });
  return _pdfJsPromise;
}

async function eng_pdf(
  file: File,
  renderScale: number,
  jpegQ: number,
  onProgress: (s: string) => void
): Promise<{ file: File; method: string }> {
  let pdfjs: any;
  try {
    pdfjs = await loadPdfJs();
  } catch (e) {
    onProgress('PDF.js unavailable — using gzip fallback');
    return eng_gzip(file);
  }
  try {
    onProgress('Loading PDF…');
    const ab = await file.arrayBuffer();
    const loadTask = pdfjs.getDocument({ data: new Uint8Array(ab) });
    const srcDoc = await loadTask.promise;
    const numPages: number = srcDoc.numPages;
    const newPdf = await PDFDocument.create();
    newPdf.setProducer('');
    newPdf.setCreator('');
    for (let p = 1; p <= numPages; p++) {
      onProgress(`Rendering page ${p} / ${numPages}…`);
      const page = await srcDoc.getPage(p);
      const viewport = page.getViewport({ scale: renderScale });
      const W = Math.round(viewport.width),
        H = Math.round(viewport.height);
      const cv = document.createElement('canvas');
      cv.width = W;
      cv.height = H;
      const ctx = cv.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      await page.render({ canvasContext: ctx, viewport }).promise;
      const blob = await new Promise<Blob | null>((r) => cv.toBlob(r, 'image/jpeg', jpegQ));
      if (!blob) continue;
      const jpg = new Uint8Array(await blob.arrayBuffer());
      const img = await newPdf.embedJpg(jpg);
      const pg = newPdf.addPage([W, H]);
      pg.drawImage(img, { x: 0, y: 0, width: W, height: H });
    }
    const outBytes = await newPdf.save({ useObjectStreams: true });
    const out = new File([outBytes as any], file.name, { type: 'application/pdf' });
    if (out.size >= file.size) return eng_gzip(file);
    return {
      file: out,
      method: `PDF.js render (scale ${Math.round(renderScale * 100)}%, JPEG ${Math.round(jpegQ * 100)}%) × ${numPages} page${numPages > 1 ? 's' : ''}`,
    };
  } catch (e) {
    console.error('PDF render failed:', e);
    onProgress('PDF render failed — using gzip fallback');
    return eng_gzip(file);
  }
}

// ── TEXT / CODE ────────────────────────────────────────────────────────────────
async function minifyText(text: string, name: string): Promise<string> {
  const n = name.toLowerCase();
  try {
    if (n.endsWith('.json')) return JSON.stringify(JSON.parse(text));
    if (n.match(/\.(html?|htm)$/))
      return text
        .replace(/<!--(?!\s*\[if)[\s\S]*?-->/g, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/>\s+</g, '><')
        .trim();
    if (n.endsWith('.css'))
      return text
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s*([{}:;,>+~])\s*/g, '$1')
        .replace(/;;+/g, ';')
        .replace(/\s+/g, ' ')
        .trim();
    if (n.match(/\.(js|mjs|ts|jsx|tsx|php|java|cpp|c|h|cs|rb|go|rs|swift|kt)$/))
      return text
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/[^\n]*/g, '')
        .replace(/\n\s+/g, '\n')
        .replace(/\s+\n/g, '\n')
        .replace(/\n{2,}/g, '\n')
        .trim();
    if (n.endsWith('.xml'))
      return text
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim();
    if (n.endsWith('.sql'))
      return text
        .replace(/--[^\n]*/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .trim();
    if (n.match(/\.(yaml|yml)$/))
      return text
        .replace(/#[^\n]*/g, '')
        .replace(/\n{2,}/g, '\n')
        .trim();
  } catch {
    /**/
  }
  return text
    .replace(/\n\s+/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

async function eng_text(file: File): Promise<{ file: File; method: string }> {
  const raw = await file.text();
  const min = await minifyText(raw, file.name);
  const enc = new TextEncoder();
  const rawB = enc.encode(raw),
    minB = enc.encode(min);
  const gz = await p_gzip(minB);
  if (gz.length < minB.length && gz.length < rawB.length)
    return {
      file: new File([gz as any], file.name + '.gz', { type: 'application/gzip' }),
      method: 'Minify + gzip (fflate)',
    };
  if (minB.length < rawB.length)
    return {
      file: new File([minB], file.name, { type: file.type || 'text/plain' }),
      method: 'Code/text minification',
    };
  const gzRaw = await p_gzip(rawB);
  if (gzRaw.length < rawB.length)
    return {
      file: new File([gzRaw as any], file.name + '.gz', { type: 'application/gzip' }),
      method: 'fflate gzip (no minification gain)',
    };
  return { file, method: 'Already minimal' };
}

// ── ZIP / OFFICE ───────────────────────────────────────────────────────────────
const ALREADY_COMPRESSED_EXTS =
  /\.(jpg|jpeg|png|gif|webp|avif|mp3|mp4|mov|avi|mkv|webm|aac|ogg|flac|m4a|zip|gz|bz2|xz|7z|rar|zst|lz4|pdf|docx|xlsx|pptx|epub|apk|jar|ipa)$/i;

async function eng_zip(file: File): Promise<{ file: File; method: string }> {
  const raw = new Uint8Array(await file.arrayBuffer());
  try {
    const entries = await p_unzip(raw);
    const names = Object.keys(entries);
    if (names.length === 0) throw new Error('empty archive');
    const alreadyCompressedCount = names.filter((n) => ALREADY_COMPRESSED_EXTS.test(n)).length;
    const repacked = await p_zip(entries, 9);
    if (repacked.length < raw.length) {
      const savedPct = Math.round((1 - repacked.length / raw.length) * 100);
      const note =
        alreadyCompressedCount > 0
          ? ` — ${alreadyCompressedCount} pre-compressed entries (images/media) skipped`
          : '';
      return {
        file: new File([repacked as any], file.name, { type: file.type || 'application/zip' }),
        method: `DEFLATE-9 repack (${names.length} files, ${savedPct}% saved${note})`,
      };
    }
    if (alreadyCompressedCount === names.length)
      return {
        file,
        method: `ZIP contains ${names.length} pre-compressed files — no further compression possible`,
      };
  } catch (e) {
    console.warn('ZIP unzip/repack failed:', e);
  }
  const gz = await p_gzip(raw);
  if (gz.length < raw.length)
    return {
      file: new File([gz as any], file.name + '.gz', { type: 'application/gzip' }),
      method: 'fflate gzip wrap (archive contains pre-compressed data)',
    };
  return { file, method: 'Archive content is fully compressed — no reduction possible' };
}

// ── WAV resample ───────────────────────────────────────────────────────────────
function buildWav(channels: Float32Array[], sr: number): ArrayBuffer {
  const nCh = channels.length,
    len = channels[0].length;
  const buf = new ArrayBuffer(44 + len * nCh * 2);
  const v = new DataView(buf);
  const ws = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };
  ws(0, 'RIFF');
  v.setUint32(4, 36 + len * nCh * 2, true);
  ws(8, 'WAVE');
  ws(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, nCh, true);
  v.setUint32(24, sr, true);
  v.setUint32(28, sr * nCh * 2, true);
  v.setUint16(32, nCh * 2, true);
  v.setUint16(34, 16, true);
  ws(36, 'data');
  v.setUint32(40, len * nCh * 2, true);
  let off = 44;
  for (let i = 0; i < len; i++)
    for (let c = 0; c < nCh; c++) {
      const x = Math.max(-1, Math.min(1, channels[c][i]));
      v.setInt16(off, x < 0 ? x * 0x8000 : x * 0x7fff, true);
      off += 2;
    }
  return buf;
}

async function eng_wav(file: File, bps: number): Promise<{ file: File; method: string }> {
  try {
    const ab = await file.arrayBuffer();
    const tmpCtx = new OfflineAudioContext(1, 1, 44100);
    const decoded = await tmpCtx.decodeAudioData(ab.slice(0));
    const origRate = decoded.sampleRate;
    const targetRate =
      bps >= 128_000
        ? origRate
        : bps >= 96_000
          ? Math.max(22050, origRate >> 1)
          : bps >= 64_000
            ? Math.max(11025, origRate >> 2)
            : 8000;
    const outLen = Math.ceil(decoded.duration * targetRate);
    const offCtx = new OfflineAudioContext(1, outLen, targetRate);
    const src = offCtx.createBufferSource();
    src.buffer = decoded;
    src.connect(offCtx.destination);
    src.start();
    const rendered = await offCtx.startRendering();
    const wav = buildWav([rendered.getChannelData(0)], targetRate);
    const out = new File([wav], file.name.replace(/\.[^.]+$/, '.wav'), { type: 'audio/wav' });
    if (out.size >= file.size) return eng_gzip(file);
    return { file: out, method: `WAV resample ${origRate}→${targetRate}Hz mono (Web Audio)` };
  } catch {
    return eng_gzip(file);
  }
}

async function eng_audio(file: File, bps: number): Promise<{ file: File; method: string }> {
  if (file.name.toLowerCase().endsWith('.wav')) return eng_wav(file, bps);
  if (typeof MediaRecorder === 'undefined') return eng_gzip(file);
  const mime =
    ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm'].find((m) =>
      MediaRecorder.isTypeSupported(m)
    ) ?? null;
  if (!mime) return eng_gzip(file);
  try {
    const ab = await file.arrayBuffer();
    const actx = new AudioContext();
    const decoded = await actx.decodeAudioData(ab.slice(0));
    const dest = actx.createMediaStreamDestination();
    const src = actx.createBufferSource();
    src.buffer = decoded;
    src.connect(dest);
    return new Promise((resolve) => {
      const chunks: Blob[] = [];
      const mr = new MediaRecorder(dest.stream, { mimeType: mime, audioBitsPerSecond: bps });
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mr.onstop = async () => {
        actx.close();
        const blob = new Blob(chunks, { type: mime });
        const ext = mime.includes('ogg') ? '.ogg' : '.webm';
        const out = new File([blob], file.name.replace(/\.[^.]+$/, ext), { type: mime });
        if (out.size >= file.size) {
          resolve(await eng_gzip(file));
          return;
        }
        resolve({
          file: out,
          method: `Web Audio API → MediaRecorder Opus ${Math.round(bps / 1000)}kbps`,
        });
      };
      mr.start();
      setTimeout(() => {
        src.start();
      }, 50);
      setTimeout(
        () => {
          if (mr.state !== 'inactive') {
            mr.stop();
            src.stop();
          }
        },
        (decoded.duration + 1.5) * 1000 + 100
      );
    });
  } catch {
    return eng_gzip(file);
  }
}

// ── VIDEO via Canvas + MediaRecorder ──────────────────────────────────────────
async function eng_video(
  file: File,
  vbps: number,
  scalePct: number,
  onProgress: (s: string) => void
): Promise<{ file: File; method: string }> {
  if (typeof MediaRecorder === 'undefined') return eng_gzip(file);
  const mime =
    ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find((m) =>
      MediaRecorder.isTypeSupported(m)
    ) ?? null;
  if (!mime) {
    onProgress('MediaRecorder not supported');
    return eng_gzip(file);
  }
  const sf = scalePct / 100;
  const url = URL.createObjectURL(file);
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.src = url;
    video.onerror = async () => {
      URL.revokeObjectURL(url);
      resolve(await eng_gzip(file));
    };
    video.onloadedmetadata = () => {
      const W = Math.max(2, Math.round(video.videoWidth * sf)),
        H = Math.max(2, Math.round(video.videoHeight * sf));
      const cv = document.createElement('canvas');
      cv.width = W;
      cv.height = H;
      const ctx = cv.getContext('2d')!;
      const stream = cv.captureStream(24);
      const chunks: Blob[] = [];
      const mr = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: vbps });
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mr.onstop = async () => {
        URL.revokeObjectURL(url);
        const blob = new Blob(chunks, { type: mime });
        const out = new File([blob], file.name.replace(/\.[^.]+$/, '.webm'), { type: mime });
        if (out.size >= file.size) {
          resolve(await eng_gzip(file));
          return;
        }
        resolve({
          file: out,
          method: `Canvas + MediaRecorder VP9 ${Math.round(vbps / 1000)}kbps, ${scalePct}% res`,
        });
      };
      let raf = 0;
      const drawFrame = () => {
        if (video.paused || video.ended) {
          cancelAnimationFrame(raf);
          if (mr.state === 'recording') mr.stop();
          return;
        }
        ctx.drawImage(video, 0, 0, W, H);
        onProgress(`Encoding ${video.currentTime.toFixed(1)}s / ${video.duration.toFixed(1)}s…`);
        raf = requestAnimationFrame(drawFrame);
      };
      video.onplay = () => {
        raf = requestAnimationFrame(drawFrame);
      };
      video.onended = () => {
        cancelAnimationFrame(raf);
        if (mr.state === 'recording') mr.stop();
      };
      video.onpause = () => {
        cancelAnimationFrame(raf);
      };
      mr.start(1000);
      setTimeout(() => {
        video.play().catch(async () => {
          mr.stop();
          URL.revokeObjectURL(url);
          resolve(await eng_gzip(file));
        });
      }, 0);
      const safetyMs = Math.max(30_000, (video.duration + 5) * 5000);
      setTimeout(() => {
        if (mr.state === 'recording') {
          cancelAnimationFrame(raf);
          mr.stop();
        }
      }, safetyMs);
    };
    video.load();
  });
}

// ── FOLDER → ZIP ──────────────────────────────────────────────────────────────
async function eng_folder(files: File[]): Promise<{ file: File; method: string }> {
  const entries: Record<string, Uint8Array> = {};
  for (const f of files) {
    const path = (f as any).webkitRelativePath || f.name;
    entries[path] = new Uint8Array(await f.arrayBuffer());
  }
  const zipped = await p_zip(entries, 9);
  const folderName = ((files[0] as any).webkitRelativePath as string)?.split('/')[0] || 'folder';
  return {
    file: new File([zipped as any], `${folderName}.zip`, { type: 'application/zip' }),
    method: `Folder → ZIP DEFLATE-9 (${files.length} files)`,
  };
}

// ── MASTER ─────────────────────────────────────────────────────────────────────
async function runCompress(
  file: File,
  preset: Preset,
  onProgress: (s: string) => void,
  folderFiles?: File[]
): Promise<{ file: File; method: string }> {
  if (folderFiles && folderFiles.length > 0) {
    onProgress(`Packing ${folderFiles.length} files…`);
    return eng_folder(folderFiles);
  }
  const kind = detectKind(file);
  onProgress(`Detected: ${kind}…`);
  switch (kind) {
    case 'image':
      return eng_image(file, preset.imgQ, preset.imgS);
    case 'pdf':
      return eng_pdf(file, preset.pdfS, preset.pdfQ, onProgress);
    case 'text':
      return eng_text(file);
    case 'office':
      return eng_zip(file);
    case 'zip':
      return eng_zip(file);
    case 'audio':
      return eng_audio(file, preset.audBps);
    case 'video':
      return eng_video(file, preset.vidBps, preset.vidS, onProgress);
    default:
      return eng_gzip(file);
  }
}

// ============================================================================
// Helper: get accept attribute based on tool ID
// ============================================================================

function getAcceptForTool(toolId: string): string {
  const imageExts = '.png,.jpg,.jpeg,.webp,.gif,.svg,.avif,.bmp,.tiff,.ico,.heic,.psd';
  const videoExts = '.mp4,.mov,.avi,.mkv,.webm';
  const audioExts = '.mp3,.wav,.aac,.ogg,.flac,.m4a';
  const docExts = '.pdf,.docx,.xlsx,.pptx,.epub,.txt';
  const archiveExts = '.zip,.rar,.7z,.tar,.gz';
  const devExts =
    '.html,.htm,.css,.js,.mjs,.ts,.tsx,.json,.xml,.yaml,.yml,.sql,.php,.py,.rb,.go,.rs,.java,.cpp,.c,.h,.cs,.sh';
  switch (toolId) {
    case 'png':
      return '.png';
    case 'jpg':
    case 'jpeg':
      return '.jpg,.jpeg';
    case 'webp':
      return '.webp';
    case 'gif':
      return '.gif';
    case 'svg':
      return '.svg';
    case 'avif':
      return '.avif';
    case 'bmp':
      return '.bmp';
    case 'tiff':
      return '.tiff,.tif';
    case 'ico':
      return '.ico';
    case 'heic':
      return '.heic,.heif';
    case 'psd':
      return '.psd';
    case 'bulk-img':
    case 'res-img':
      return imageExts;
    case 'mp4':
      return '.mp4';
    case 'mov':
      return '.mov';
    case 'avi':
      return '.avi';
    case 'mkv':
      return '.mkv';
    case 'webm':
      return '.webm';
    case '4k':
    case 'hd':
    case 'yt':
      return videoExts;
    case 'mp3':
      return '.mp3';
    case 'wav':
      return '.wav';
    case 'aac':
      return '.aac';
    case 'ogg':
      return '.ogg';
    case 'flac':
      return '.flac';
    case 'm4a':
      return '.m4a';
    case 'pdf':
      return '.pdf';
    case 'docx':
      return '.docx';
    case 'xlsx':
      return '.xlsx';
    case 'pptx-doc':
      return '.pptx';
    case 'epub':
      return '.epub';
    case 'txt':
      return '.txt';
    case 'zip':
      return '.zip';
    case 'rar':
      return '.rar';
    case '7z':
      return '.7z';
    case 'tar':
      return '.tar';
    case 'gz':
      return '.gz';
    case 'folder':
      return '';
    case 'html-min':
      return '.html,.htm';
    case 'css-min':
      return '.css';
    case 'js-min':
      return '.js,.mjs';
    case 'json-min':
      return '.json';
    case 'xml-min':
      return '.xml';
    case 'sql-min':
      return '.sql';
    case 'ts-min':
      return '.ts,.tsx';
    case 'php-min':
      return '.php';
    case 'py-min':
      return '.py';
    case 'yaml-min':
      return '.yaml,.yml';
    case 'whatsapp':
    case 'instagram':
    case 'facebook':
    case 'thumbnail':
    case 'screenshot':
      return 'image/*';
    case 'tiktok':
      return 'video/*';
    default:
      return '*/*';
  }
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export const CompresserPage = (data: any) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>('image');
  const [activeTool, setActiveTool] = useState<Tool>(categoriesHub[0].tools[0]);
  const category = categoriesHub.find((c) => c.id === activeCategoryId)!;

  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [folderFiles, setFolderFiles] = useState<File[]>([]);
  const [presetIdx, setPresetIdx] = useState(0);
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const pathname = usePathname();
console.log('Pathname0------------qdk0kdp :', data);
  // Sync tool from URL slug (e.g., /compress/txt)
  useEffect(() => {
    const slug = pathname.split('/').pop()?.toLowerCase() || '';
    if (!slug) return;
    // Find tool by id matching slug
    for (const cat of categoriesHub) {
      const tool = cat.tools.find((t) => t.id === slug);
      if (tool) {
        setActiveCategoryId(cat.id);
        setActiveTool(tool);
        break;
      }
    }
  }, [pathname]);

  const prevUrl = useRef('');
  useEffect(
    () => () => {
      if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
    },
    []
  );

  const preset = PRESETS[presetIdx];
  const isFolder = activeTool.id === 'folder';
  const accept = isFolder ? '' : getAcceptForTool(activeTool.id);

  const pickFile = useCallback((f: File) => {
    setFile(f);
    setFolderFiles([]);
    setResult(null);
    setError('');
    setProgress('');
  }, []);

  const pickFolder = useCallback((fl: File[]) => {
    setFolderFiles(fl);
    setFile(null);
    setResult(null);
    setError('');
    setProgress('');
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (isFolder) {
        const files = Array.from(e.dataTransfer.files);
        if (files.length) pickFolder(files);
      } else {
        const f = e.dataTransfer.files[0];
        if (f) pickFile(f);
      }
    },
    [pickFile, pickFolder, isFolder]
  );

  const run = useCallback(async () => {
    if (!file && folderFiles.length === 0) return;
    setCompressing(true);
    setResult(null);
    setError('');
    setProgress('Starting…');
    try {
      const dummy = file ?? new File([], 'folder');
      const { file: out, method } = await runCompress(
        dummy,
        preset,
        setProgress,
        folderFiles.length > 0 ? folderFiles : undefined
      );
      if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
      const url = URL.createObjectURL(out);
      prevUrl.current = url;
      const origSize =
        folderFiles.length > 0 ? folderFiles.reduce((s, f) => s + f.size, 0) : file!.size;
      const ratio =
        origSize > 0 ? Math.max(0, Math.round(((origSize - out.size) / origSize) * 100)) : 0;
      setResult({
        originalSize: origSize,
        compressedSize: out.size,
        ratio,
        url,
        downloadName: `compressed_${out.name}`,
        method,
      });
    } catch (e) {
      setError(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setCompressing(false);
      setProgress('');
    }
  }, [file, folderFiles, preset]);

  const hasInput = file !== null || folderFiles.length > 0;
  const totalFolderSize = folderFiles.reduce((s, f) => s + f.size, 0);

  const handleToolSelect = (tool: Tool) => {
    setActiveTool(tool);
    setFile(null);
    setFolderFiles([]);
    setResult(null);
    setError('');
    setProgress('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05070a] to-[#0a0c10] text-white">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
          {categoriesHub.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategoryId(cat.id);
                setActiveTool(cat.tools[0]);
                setFile(null);
                setFolderFiles([]);
                setResult(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategoryId === cat.id
                  ? `${cat.color} ${cat.bg} shadow-sm`
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
            {category.label} Tools
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {category.tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolSelect(tool)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  activeTool.id === tool.id
                    ? `${category.bg} ${category.color} border-current shadow-sm`
                    : 'border-white/10 hover:border-white/20 bg-white/5 text-slate-300'
                }`}
              >
                <div className="font-medium text-sm">{tool.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                  {tool.description}
                </div>
                {tool.popular && (
                  <span className="inline-block mt-1 text-[9px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
                {tool.isNew && (
                  <span className="inline-block mt-1 text-[9px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded-full ml-1">
                    New
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
 <PageTitle title={data?.data?.title} description={data?.data?.description} />
        {/* Main Compression Card */}
        <div className="bg-white/3 backdrop-blur border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{category.icon}</span>
            <div>
              <h1 className={`text-xl font-bold ${category.color}`}>{activeTool.name}</h1>
              <p className="text-xs text-slate-400">{activeTool.description}</p>
            </div>
          </div>

          {/* Preset Selector */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Compression Level
            </p>
            <div className="grid grid-cols-3 gap-3">
              {PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPresetIdx(i);
                    setResult(null);
                  }}
                  className={`relative flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 font-semibold transition-all ${
                    presetIdx === i
                      ? `${p.color} ring-2 ${p.ring} ring-offset-2 ring-offset-[#0a0c10] scale-[1.02]`
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/25 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xl font-black leading-none">{p.tag}</span>
                  <span className="text-xs">{p.label}</span>
                  <span className="text-[10px] opacity-60 text-center">{p.desc}</span>
                  {presetIdx === i && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full text-[9px] text-white font-black flex items-center justify-center">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
         
          {/* File Input */}
          {isFolder ? (
            <div className="space-y-3">
              <div
                onClick={() => folderRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${folderFiles.length > 0 ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/15 hover:border-emerald-400/60 hover:bg-emerald-500/5'}`}
              >
                <input
                  ref={folderRef}
                  type="file"
                  className="hidden"
                  {...({ webkitdirectory: '' } as any)}
                  multiple
                  onChange={(e) => {
                    const fl = Array.from(e.target.files ?? []);
                    if (fl.length) pickFolder(fl);
                  }}
                />
                {folderFiles.length > 0 ? (
                  <>
                    <p className="text-2xl mb-1">📁</p>
                    <p className="text-sm font-bold text-white">
                      {(folderFiles[0] as any).webkitRelativePath?.split('/')[0] ??
                        'Selected folder'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {folderFiles.length} files · {fmt(totalFolderSize)}
                    </p>
                    <p className="text-xs text-emerald-400 mt-1">Click to change</p>
                  </>
                ) : (
                  <>
                    <p className="text-3xl mb-1.5">📁</p>
                    <p className="text-sm font-semibold text-slate-300">Click to select a folder</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      All files → single compressed ZIP
                    </p>
                  </>
                )}
              </div>
              <div className="border border-white/10 rounded-xl p-3 text-center cursor-pointer hover:border-white/25 transition-all">
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={(e) => {
                    const fl = Array.from(e.target.files ?? []);
                    if (fl.length) pickFolder(fl);
                  }}
                  id="multiFiles"
                />
                <label htmlFor="multiFiles" className="text-xs text-slate-500 cursor-pointer">
                  📂 Or select multiple files manually
                </label>
              </div>
            </div>
          ) : (
            <div
              onDrop={onDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragOver ? 'border-violet-400 bg-violet-500/10' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}
            >
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept={accept}
                onChange={(e) => e.target.files?.[0] && pickFile(e.target.files[0])}
              />
              {file ? (
                <>
                  <p className="text-3xl mb-2">📂</p>
                  <p className="text-sm font-semibold text-white break-all">{file.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{fmt(file.size)}</p>
                  <p className="text-xs text-violet-400 mt-2">Click to change</p>
                </>
              ) : (
                <>
                  <p className="text-5xl mb-3">⬆️</p>
                  <p className="text-sm font-medium text-slate-400">
                    Drop a {activeTool.name.toLowerCase()} file here or click to browse
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {accept ? accept.split(',').join(', ') : 'All formats supported'}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Notes */}
          {category.id === 'video' && (
            <div className="flex gap-2 items-start bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
              <span className="text-base">📹</span>
              <p className="text-[11px] text-slate-400">
                Re-encodes to <strong className="text-slate-200">WebM/VP9</strong> via Canvas +
                MediaRecorder. Works in Chrome & Edge.
              </p>
            </div>
          )}
          {category.id === 'audio' && (
            <div className="flex gap-2 items-start bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <span className="text-base">🎵</span>
              <p className="text-[11px] text-slate-400">
                Compressed using <strong className="text-slate-200">Opus</strong> via MediaRecorder
                (WebM/OGG).
              </p>
            </div>
          )}

          {/* Compress Button */}
          <button
            onClick={run}
            disabled={!hasInput || compressing}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${!hasInput || compressing ? 'bg-white/10 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-900/40'}`}
          >
            {compressing ? (
              <span className="flex items-center justify-center gap-2.5">
                <span className="animate-spin w-4 h-4 border-2 border-white/25 border-t-white rounded-full inline-block" />
                Compressing…
              </span>
            ) : (
              `⚡ Compress ${preset.tag}`
            )}
          </button>

          {compressing && progress && (
            <p className="text-xs text-slate-400 text-center animate-pulse">{progress}</p>
          )}
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/25 p-3 text-xs text-red-400">
              ❌ {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-5 space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="text-xs font-bold text-emerald-400">✅ Complete</span>
                <span
                  className="text-[10px] text-slate-500 italic truncate max-w-[60%]"
                  title={result.method}
                >
                  {result.method}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/5 rounded-xl p-2.5">
                  <p className="text-[9px] text-slate-500 uppercase">Original</p>
                  <p className="text-sm font-bold text-white">{fmt(result.originalSize)}</p>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-2.5">
                  <p className="text-[9px] text-slate-500 uppercase">Output</p>
                  <p className="text-sm font-bold text-emerald-400">{fmt(result.compressedSize)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-2.5">
                  <p className="text-[9px] text-slate-500 uppercase">Saved</p>
                  <p className="text-sm font-bold text-white">{result.ratio}%</p>
                </div>
              </div>
              <a
                href={result.url}
                download={result.downloadName}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors"
              >
                ⬇️ Download — {fmt(result.compressedSize)}
              </a>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {PRESETS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPresetIdx(i);
                      setResult(null);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${i === presetIdx ? 'border-white/20 text-slate-600 cursor-default' : `${p.color} hover:opacity-90`}`}
                  >
                    {p.tag} {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <ContentSection data={data?.data} />
    </div>
  );
};

export default CompresserPage;
