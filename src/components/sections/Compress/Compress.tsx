'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';

// ─── CATEGORIES DATA ──────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'image',
    label: 'Image',
    icon: '🖼️',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
    tools: [
      { id: 'png', name: 'PNG Compressor', description: 'Losslessly shrink PNG files without quality loss.', tags: ['png', 'lossless', 'image'], popular: true },
      { id: 'jpg', name: 'JPG Compressor', description: 'Reduce JPG file sizes with smart quality control.', tags: ['jpg', 'jpeg', 'lossy'], popular: true },
      { id: 'jpeg', name: 'JPEG Compressor', description: 'Optimise JPEG images for web and email.', tags: ['jpeg', 'jpg', 'image'] },
      { id: 'webp', name: 'WEBP Compressor', description: 'Compress modern WebP images efficiently.', tags: ['webp', 'modern', 'image'], new: true },
      { id: 'gif', name: 'GIF Compressor', description: 'Reduce animated GIF file sizes.', tags: ['gif', 'animated', 'image'] },
      { id: 'svg', name: 'SVG Compressor', description: 'Minify and compress SVG vector files.', tags: ['svg', 'vector', 'minify'] },
      { id: 'avif', name: 'AVIF Compressor', description: 'Compress next-gen AVIF image format.', tags: ['avif', 'next-gen', 'image'], new: true },
      { id: 'heic', name: 'HEIC Compressor', description: 'Compress Apple HEIC/HEIF photos.', tags: ['heic', 'apple', 'photo'] },
      { id: 'bmp', name: 'BMP Compressor', description: 'Compress legacy BMP bitmap images.', tags: ['bmp', 'bitmap', 'legacy'] },
      { id: 'tiff', name: 'TIFF Compressor', description: 'Reduce TIFF file sizes for print/scan.', tags: ['tiff', 'print', 'scan'] },
      { id: 'ico', name: 'ICO Compressor', description: 'Compress website favicon ICO files.', tags: ['ico', 'favicon', 'icon'] },
      { id: 'raw', name: 'RAW Compressor', description: 'Compress camera RAW image files.', tags: ['raw', 'camera', 'photo'] },
      { id: 'psd', name: 'PSD Compressor', description: 'Reduce Photoshop PSD file sizes.', tags: ['psd', 'photoshop', 'design'] },
      { id: 'ai-img', name: 'AI Image Compressor', description: 'AI-powered intelligent image compression.', tags: ['ai', 'smart', 'image'], badge: 'AI' },
      { id: 'eps', name: 'EPS Compressor', description: 'Compress EPS vector/postscript files.', tags: ['eps', 'vector', 'print'] },
      { id: 'tga', name: 'TGA Compressor', description: 'Compress TGA game/rendering textures.', tags: ['tga', 'game', 'texture'] },
      { id: 'lossless', name: 'Lossless Compressor', description: 'Zero quality loss image compression.', tags: ['lossless', 'quality', 'image'] },
      { id: 'lossy', name: 'Lossy Compressor', description: 'Aggressive size reduction with minimal visual impact.', tags: ['lossy', 'size', 'image'] },
      { id: 'smart-img', name: 'Smart Image Compressor', description: 'Automatically chooses best compression method.', tags: ['smart', 'auto', 'image'] },
      { id: 'bulk-img', name: 'Bulk Image Compressor', description: 'Compress hundreds of images at once.', tags: ['bulk', 'batch', 'image'], popular: true },
      { id: 'hq-img', name: 'High-Quality Compressor', description: 'Preserve maximum quality while reducing size.', tags: ['quality', 'hq', 'image'] },
      { id: 'bitrate-img', name: 'Image Bitrate Compressor', description: 'Fine-tune image bitrate for optimal output.', tags: ['bitrate', 'image', 'advanced'] },
      { id: 'res-img', name: 'Image Resolution Compressor', description: 'Downscale image resolution smartly.', tags: ['resolution', 'resize', 'image'] },
    ],
  },
  {
    id: 'video',
    label: 'Video',
    icon: '🎥',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
    tools: [
      { id: 'mp4', name: 'MP4 Compressor', description: 'Compress MP4 videos for web and mobile.', tags: ['mp4', 'video', 'h264'], popular: true },
      { id: 'mov', name: 'MOV Compressor', description: 'Reduce Apple MOV file sizes.', tags: ['mov', 'apple', 'video'] },
      { id: 'avi', name: 'AVI Compressor', description: 'Compress legacy AVI video files.', tags: ['avi', 'legacy', 'video'] },
      { id: 'mkv', name: 'MKV Compressor', description: 'Compress Matroska container videos.', tags: ['mkv', 'matroska', 'video'] },
      { id: 'webm', name: 'WEBM Compressor', description: 'Compress WebM videos for web use.', tags: ['webm', 'web', 'video'] },
      { id: 'flv', name: 'FLV Compressor', description: 'Compress Flash video files.', tags: ['flv', 'flash', 'video'] },
      { id: 'wmv', name: 'WMV Compressor', description: 'Reduce Windows Media Video sizes.', tags: ['wmv', 'windows', 'video'] },
      { id: 'm4v', name: 'M4V Compressor', description: 'Compress iTunes M4V video files.', tags: ['m4v', 'itunes', 'apple'] },
      { id: '3gp', name: '3GP Compressor', description: 'Compress mobile 3GP videos.', tags: ['3gp', 'mobile', 'video'] },
      { id: 'ogv', name: 'OGV Compressor', description: 'Compress open OGG video files.', tags: ['ogv', 'ogg', 'open'] },
      { id: '4k', name: '4K Video Compressor', description: 'Compress ultra-HD 4K footage.', tags: ['4k', 'uhd', 'video'], popular: true },
      { id: 'hd', name: 'HD Video Compressor', description: 'Reduce HD 1080p/720p video sizes.', tags: ['hd', '1080p', 'video'] },
      { id: 'batch-vid', name: 'Batch Video Compressor', description: 'Process multiple videos simultaneously.', tags: ['batch', 'bulk', 'video'] },
      { id: 'stream', name: 'Streaming Video Compressor', description: 'Optimise video for streaming platforms.', tags: ['stream', 'hls', 'video'] },
      { id: 'mobile-vid', name: 'Mobile Video Compressor', description: 'Optimise videos for mobile devices.', tags: ['mobile', 'phone', 'video'] },
      { id: 'yt-vid', name: 'YouTube Video Compressor', description: 'Compress videos for YouTube upload.', tags: ['youtube', 'social', 'video'] },
      { id: 'tiktok-vid', name: 'TikTok Video Compressor', description: 'Optimise videos for TikTok.', tags: ['tiktok', 'social', 'video'] },
    ],
  },
  {
    id: 'audio',
    label: 'Audio',
    icon: '🎵',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    tools: [
      { id: 'mp3', name: 'MP3 Compressor', description: 'Reduce MP3 audio file sizes.', tags: ['mp3', 'audio', 'music'], popular: true },
      { id: 'wav', name: 'WAV Compressor', description: 'Compress uncompressed WAV audio.', tags: ['wav', 'lossless', 'audio'] },
      { id: 'aac', name: 'AAC Compressor', description: 'Optimise AAC audio for streaming.', tags: ['aac', 'streaming', 'audio'] },
      { id: 'ogg', name: 'OGG Compressor', description: 'Compress open OGG audio files.', tags: ['ogg', 'open', 'audio'] },
      { id: 'flac', name: 'FLAC Compressor', description: 'Reduce lossless FLAC file sizes.', tags: ['flac', 'lossless', 'audio'] },
      { id: 'm4a', name: 'M4A Compressor', description: 'Compress Apple M4A audio files.', tags: ['m4a', 'apple', 'audio'] },
      { id: 'wma', name: 'WMA Compressor', description: 'Compress Windows Media Audio.', tags: ['wma', 'windows', 'audio'] },
      { id: 'amr', name: 'AMR Compressor', description: 'Compress phone call AMR audio.', tags: ['amr', 'phone', 'audio'] },
      { id: 'aiff', name: 'AIFF Compressor', description: 'Compress Apple AIFF audio files.', tags: ['aiff', 'apple', 'audio'] },
      { id: 'podcast', name: 'Podcast Audio Compressor', description: 'Optimise audio for podcast distribution.', tags: ['podcast', 'voice', 'audio'] },
      { id: 'batch-aud', name: 'Batch Audio Compressor', description: 'Compress multiple audio files at once.', tags: ['batch', 'bulk', 'audio'] },
      { id: 'smart-aud', name: 'Smart Audio Compressor', description: 'AI-driven audio compression.', tags: ['smart', 'ai', 'audio'], badge: 'AI' },
    ],
  },
  {
    id: 'document',
    label: 'Document',
    icon: '📄',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/20',
    tools: [
      { id: 'pdf', name: 'PDF Compressor', description: 'Reduce PDF sizes without losing readability.', tags: ['pdf', 'document'], popular: true },
      { id: 'word', name: 'Word Compressor', description: 'Compress Word .docx documents.', tags: ['word', 'docx', 'document'] },
      { id: 'doc', name: 'DOC Compressor', description: 'Compress legacy Word .doc files.', tags: ['doc', 'word', 'legacy'] },
      { id: 'docx', name: 'DOCX Compressor', description: 'Reduce modern Word document sizes.', tags: ['docx', 'word', 'document'] },
      { id: 'excel', name: 'Excel Compressor', description: 'Compress Excel spreadsheets.', tags: ['excel', 'xlsx', 'spreadsheet'] },
      { id: 'xls', name: 'XLS Compressor', description: 'Compress legacy Excel files.', tags: ['xls', 'excel', 'legacy'] },
      { id: 'xlsx', name: 'XLSX Compressor', description: 'Reduce modern Excel file sizes.', tags: ['xlsx', 'excel', 'spreadsheet'] },
      { id: 'ppt', name: 'PowerPoint Compressor', description: 'Compress PowerPoint presentations.', tags: ['ppt', 'powerpoint', 'slides'] },
      { id: 'pptx-doc', name: 'PPTX Compressor', description: 'Reduce modern PowerPoint sizes.', tags: ['pptx', 'slides', 'presentation'] },
      { id: 'epub', name: 'EPUB Compressor', description: 'Compress eBook EPUB files.', tags: ['epub', 'ebook', 'book'] },
      { id: 'rtf', name: 'RTF Compressor', description: 'Compress Rich Text Format files.', tags: ['rtf', 'text', 'document'] },
      { id: 'txt', name: 'TXT Compressor', description: 'Compress plain text files.', tags: ['txt', 'text', 'plain'] },
    ],
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: '📦',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    tools: [
      { id: 'zip', name: 'ZIP Compressor', description: 'Create and compress ZIP archives.', tags: ['zip', 'archive'], popular: true },
      { id: 'rar', name: 'RAR Compressor', description: 'Compress files into RAR archives.', tags: ['rar', 'archive'] },
      { id: '7z', name: '7Z Compressor', description: 'Ultra-high 7-Zip compression.', tags: ['7z', '7zip', 'archive'] },
      { id: 'tar', name: 'TAR Compressor', description: 'Create TAR archive bundles.', tags: ['tar', 'unix', 'archive'] },
      { id: 'gzip', name: 'GZIP Compressor', description: 'GZIP compress files for servers.', tags: ['gzip', 'gz', 'web'] },
      { id: 'bzip2', name: 'BZIP2 Compressor', description: 'High-ratio BZIP2 compression.', tags: ['bzip2', 'bz2', 'linux'] },
      { id: 'xz-arc', name: 'XZ Compressor', description: 'Extreme XZ/LZMA2 compression.', tags: ['xz', 'lzma', 'linux'] },
      { id: 'zstd', name: 'ZSTD Compressor', description: 'Fast modern Zstandard compression.', tags: ['zstd', 'fast', 'modern'], new: true },
      { id: 'lzma', name: 'LZMA Compressor', description: 'High-ratio LZMA compression.', tags: ['lzma', '7z', 'archive'] },
      { id: 'lz4', name: 'LZ4 Compressor', description: 'Ultra-fast LZ4 compression.', tags: ['lz4', 'fast', 'archive'], new: true },
      { id: 'folder', name: 'Folder Compressor', description: 'Compress entire directories.', tags: ['folder', 'directory', 'bulk'] },
      { id: 'email-att', name: 'Email Attachment Compressor', description: 'Shrink files for email attachments.', tags: ['email', 'attachment', 'send'] },
    ],
  },
  {
    id: 'developer',
    label: 'Developer',
    icon: '💻',
    color: 'text-lime-400',
    bg: 'bg-lime-500/10 border-lime-500/20',
    tools: [
      { id: 'html-min', name: 'HTML Minifier', description: 'Strip whitespace from HTML files.', tags: ['html', 'minify', 'web'], popular: true },
      { id: 'css-min', name: 'CSS Minifier', description: 'Minify CSS stylesheets.', tags: ['css', 'minify', 'web'], popular: true },
      { id: 'js-min', name: 'JavaScript Minifier', description: 'Minify and compress JS bundles.', tags: ['js', 'javascript', 'minify'], popular: true },
      { id: 'json-min', name: 'JSON Minifier', description: 'Compress and minify JSON data.', tags: ['json', 'minify', 'data'] },
      { id: 'xml-min', name: 'XML Minifier', description: 'Minify XML markup files.', tags: ['xml', 'minify', 'data'] },
      { id: 'sql-min', name: 'SQL Query Compressor', description: 'Minify SQL queries.', tags: ['sql', 'database', 'query'] },
      { id: 'php', name: 'PHP Code Compressor', description: 'Minify PHP source files.', tags: ['php', 'server', 'code'] },
      { id: 'python', name: 'Python Code Compressor', description: 'Minify Python scripts.', tags: ['python', 'code', 'script'] },
      { id: 'java', name: 'Java Code Compressor', description: 'Compress Java source files.', tags: ['java', 'code', 'jvm'] },
      { id: 'cpp', name: 'C++ Code Compressor', description: 'Minify C++ source code.', tags: ['cpp', 'c++', 'native'] },
      { id: 'ts', name: 'TypeScript Compressor', description: 'Compress TypeScript files.', tags: ['typescript', 'ts', 'code'] },
      { id: 'jsx', name: 'React JSX Compressor', description: 'Compress React JSX/TSX files.', tags: ['react', 'jsx', 'tsx'] },
      { id: 'nextjs', name: 'Next.js Bundle Compressor', description: 'Optimise Next.js production bundles.', tags: ['nextjs', 'bundle', 'react'] },
      { id: 'graphql', name: 'GraphQL Compressor', description: 'Minify GraphQL queries/schemas.', tags: ['graphql', 'api', 'schema'] },
      { id: 'yaml', name: 'YAML Compressor', description: 'Compress YAML configuration files.', tags: ['yaml', 'config', 'devops'] },
      { id: 'toml', name: 'TOML Compressor', description: 'Minify TOML config files.', tags: ['toml', 'config', 'rust'] },
      { id: 'webpack', name: 'Webpack Bundle Compressor', description: 'Optimise Webpack build output.', tags: ['webpack', 'bundle', 'build'] },
      { id: 'brotli', name: 'Brotli Web Compressor', description: 'Brotli-compress web assets.', tags: ['brotli', 'web', 'server'], new: true },
    ],
  },
  {
    id: 'ai',
    label: 'AI / Smart',
    icon: '🧠',
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/10 border-fuchsia-500/20',
    tools: [
      { id: 'ai-image2', name: 'AI Image Compressor', description: 'Neural-network image compression.', tags: ['ai', 'image', 'smart'], badge: 'AI', popular: true },
      { id: 'ai-video', name: 'AI Video Compressor', description: 'AI-powered video size reduction.', tags: ['ai', 'video', 'smart'], badge: 'AI' },
      { id: 'ai-audio', name: 'AI Audio Compressor', description: 'Machine-learning audio compression.', tags: ['ai', 'audio', 'smart'], badge: 'AI' },
      { id: 'ai-file', name: 'AI File Compressor', description: 'Intelligent all-format compression.', tags: ['ai', 'file', 'smart'], badge: 'AI' },
      { id: 'auto', name: 'Auto Compression Tool', description: 'Detects format and applies best method.', tags: ['auto', 'smart', 'all'] },
      { id: 'ml', name: 'ML Compressor', description: 'Machine learning-based compression.', tags: ['ml', 'ai', 'advanced'], badge: 'AI' },
      { id: 'adaptive', name: 'Adaptive Compression', description: 'Adapts algorithm to content type.', tags: ['adaptive', 'smart', 'dynamic'] },
      { id: 'gpu', name: 'GPU Compressor', description: 'GPU-accelerated compression for large files.', tags: ['gpu', 'fast', 'accelerated'] },
      { id: 'parallel', name: 'Parallel Compressor', description: 'Multi-core parallel compression.', tags: ['parallel', 'fast', 'multi-thread'] },
    ],
  },
  {
    id: 'social',
    label: 'Social Media',
    icon: '📱',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/20',
    tools: [
      { id: 'whatsapp', name: 'WhatsApp Image Compressor', description: 'Optimise images for WhatsApp sharing.', tags: ['whatsapp', 'social', 'image'], popular: true },
      { id: 'instagram', name: 'Instagram Image Compressor', description: "Compress for Instagram's format.", tags: ['instagram', 'social', 'image'] },
      { id: 'facebook', name: 'Facebook Image Compressor', description: 'Optimise images for Facebook.', tags: ['facebook', 'social', 'image'] },
      { id: 'youtube2', name: 'YouTube Video Compressor', description: 'Prepare videos for YouTube upload.', tags: ['youtube', 'social', 'video'] },
      { id: 'tiktok2', name: 'TikTok Video Compressor', description: 'Compress for TikTok vertical format.', tags: ['tiktok', 'social', 'video'] },
      { id: 'story', name: 'Story Image Compressor', description: 'Compress story-sized 9:16 images.', tags: ['story', 'social', 'image'] },
      { id: 'thumb', name: 'Thumbnail Compressor', description: 'Optimise channel/video thumbnails.', tags: ['thumbnail', 'youtube', 'image'] },
      { id: 'screenshot', name: 'App Screenshot Compressor', description: 'Compress app store screenshots.', tags: ['screenshot', 'app', 'image'] },
      { id: 'social-vid', name: 'Social Media Video Compressor', description: 'Multi-platform video compression.', tags: ['social', 'video', 'multi'] },
    ],
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type Tool = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  popular?: boolean;
  new?: boolean;
  badge?: string;
  categoryId?: string;
  categoryLabel?: string;
};

type Category = typeof CATEGORIES[0];

type CompressedResult = {
  originalSize: number;
  compressedSize: number;
  ratio: number;
  url: string;
  name: string;
  downloadName: string;
};

// ─── Compression Engine ───────────────────────────────────────────────────────

// Determine what category/type a file belongs to
function detectFileType(file: File): string {
  const name = file.name.toLowerCase();
  const mime = file.type;

  if (mime.startsWith('image/') || name.match(/\.(png|jpg|jpeg|webp|gif|bmp|tiff|tif|ico|svg|avif|heic|heif|raw|psd|eps|tga)$/)) return 'image';
  if (mime.startsWith('video/') || name.match(/\.(mp4|mov|avi|mkv|webm|flv|wmv|m4v|3gp|ogv|ts|mts|m2ts)$/)) return 'video';
  if (mime.startsWith('audio/') || name.match(/\.(mp3|wav|aac|ogg|flac|m4a|wma|amr|aiff|aif|opus)$/)) return 'audio';
  if (mime === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (name.match(/\.(docx|xlsx|pptx|doc|xls|ppt|odt|ods|odp)$/)) return 'office';
  if (name.match(/\.(zip|rar|7z|tar|gz|bz2|xz|zst|lz4|cab|iso)$/)) return 'archive';
  if (mime.includes('text') || name.match(/\.(js|ts|jsx|tsx|json|html|css|xml|txt|php|py|java|cpp|c|h|rb|go|rs|swift|kt|yaml|yml|toml|sql|graphql|md|rtf|csv|log|sh|bat|ps1)$/)) return 'text';
  return 'binary';
}

async function compressImage(file: File, quality: number, resizeScale: number): Promise<File> {
  const name = file.name.toLowerCase();
  
  // SVG: minify text
  if (name.endsWith('.svg') || file.type === 'image/svg+xml') {
    const text = await file.text();
    const minified = text
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
    return new File([minified], file.name, { type: 'image/svg+xml' });
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.src = reader.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * resizeScale);
        canvas.height = Math.round(img.height * resizeScale);
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas context unavailable')); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const outMime = name.endsWith('.png') ? 'image/png' : 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('Canvas toBlob failed')); return; }
            resolve(new File([blob], file.name, { type: outMime }));
          },
          outMime,
          quality / 100
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressText(file: File): Promise<File> {
  const text = await file.text();
  const name = file.name.toLowerCase();
  let out = text;

  if (name.endsWith('.json')) {
    try { out = JSON.stringify(JSON.parse(text)); } catch { out = text; }
  } else if (name.endsWith('.html') || name.endsWith('.htm')) {
    out = text
      .replace(/<!--(?![\s\S]*?<!\[)[\s\S]*?-->/g, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
  } else if (name.endsWith('.css')) {
    out = text
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s*([{}:;,>+~])\s*/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  } else if (name.match(/\.(js|ts|jsx|tsx)$/)) {
    out = text
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '')
      .replace(/\n\s+/g, '\n')
      .replace(/\s+\n/g, '\n')
      .replace(/\n{2,}/g, '\n')
      .trim();
  } else if (name.endsWith('.xml')) {
    out = text
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
  } else if (name.endsWith('.sql')) {
    out = text
      .replace(/--[^\n]*/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .trim();
  } else {
    // Generic: collapse whitespace
    out = text.replace(/\n\s+/g, '\n').replace(/\n{2,}/g, '\n').trim();
  }

  return new File([out], file.name, { type: file.type || 'text/plain' });
}

async function compressZip(file: File): Promise<File> {
  // Dynamic import for JSZip — falls back gracefully if not available
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const JSZip = (await import('jszip')).default as any;
    const ab = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(ab);
    const newZip = new JSZip();
    const tasks: Promise<void>[] = [];

    zip.forEach((path: string, entry: any) => {
      if (!entry.dir) {
        tasks.push(
          entry.async('nodebuffer').then((content: Uint8Array) => {
            newZip.file(path, content, { compression: 'DEFLATE', compressionOptions: { level: 9 } });
          })
        );
      } else {
        newZip.folder(path);
      }
    });

    await Promise.all(tasks);
    const bytes = await newZip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', compressionOptions: { level: 9 } });
    return new File([bytes], file.name, { type: file.type });
  } catch {
    return file;
  }
}

async function compressPdf(file: File): Promise<File> {
  try {
    const { PDFDocument } = await import('pdf-lib');
    const ab = await file.arrayBuffer();
    const doc = await PDFDocument.load(ab);
    const bytes = await doc.save({ useObjectStreams: true });
    const uint8Array = new Uint8Array(bytes);
    return new File([uint8Array], file.name, { type: 'application/pdf' });
  } catch {
    return file;
  }
}

async function runCompression(
  file: File,
  quality: number,
  resizeScale: number
): Promise<{ file: File; supported: boolean }> {
  const ft = detectFileType(file);

  switch (ft) {
    case 'image': {
      const result = await compressImage(file, quality, resizeScale);
      return { file: result, supported: true };
    }
    case 'text': {
      const result = await compressText(file);
      return { file: result, supported: true };
    }
    case 'pdf': {
      const result = await compressPdf(file);
      return { file: result, supported: true };
    }
    case 'office':
    case 'archive': {
      const result = await compressZip(file);
      return { file: result, supported: true };
    }
    case 'video':
    case 'audio':
    case 'binary':
    default:
      // Cannot compress these in-browser without heavy codec libs
      return { file, supported: false };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getCategoryForTool(toolId: string): Category | undefined {
  return CATEGORIES.find((c) => c.tools.some((t) => t.id === toolId));
}

// ─── Accept Map ───────────────────────────────────────────────────────────────

const acceptMap: Record<string, string> = {
  image: 'image/*,.heic,.heif,.avif,.raw,.psd,.eps,.tga',
  video: 'video/*,.mkv,.flv,.wmv,.m4v,.3gp,.ogv,.ts',
  audio: 'audio/*,.flac,.aiff,.aif,.amr,.opus,.wma',
  document: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.epub,.odt,.ods,.odp',
  archive: '.zip,.rar,.7z,.tar,.gz,.bz2,.xz,.zst,.lz4,.cab',
  developer: '.html,.css,.js,.ts,.jsx,.tsx,.json,.xml,.yaml,.yml,.toml,.sql,.php,.py,.java,.cpp,.c,.h,.rb,.go,.rs,.swift,.kt,.graphql,.md,.sh,.bat',
  ai: '*',
  social: 'image/*,video/*',
};

// ─── Badge Component ──────────────────────────────────────────────────────────

function Badge({ text }: { text: string }) {
  const colors: Record<string, string> = {
    AI: 'bg-fuchsia-500 text-white',
    new: 'bg-red-500 text-white',
    popular: 'bg-green-500 text-white',
  };
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${colors[text] ?? 'bg-slate-700 text-slate-300'}`}>
      {text}
    </span>
  );
}

// ─── ToolCard ─────────────────────────────────────────────────────────────────

function ToolCard({ tool, category, onClick, listView }: {
  tool: Tool;
  category: Category;
  onClick: () => void;
  listView?: boolean;
}) {
  if (listView) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-[#0f1117] border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all group text-left"
      >
        <span className="text-2xl w-8 shrink-0">{category.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{tool.name}</p>
          <p className="text-xs text-slate-500 truncate">{tool.description}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          {tool.badge && <Badge text={tool.badge} />}
          {tool.new && <Badge text="new" />}
          {tool.popular && <Badge text="popular" />}
        </div>
        <span className="text-slate-600 group-hover:text-slate-300 transition-colors ml-1">→</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-2xl border ${category.bg} hover:scale-[1.03] hover:shadow-lg hover:shadow-black/30 transition-all duration-200 group text-left cursor-pointer`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{category.icon}</span>
        <div className="flex flex-wrap gap-1 justify-end">
          {tool.badge && <Badge text={tool.badge} />}
          {tool.new && <Badge text="new" />}
          {tool.popular && <Badge text="popular" />}
        </div>
      </div>
      <h3 className={`text-sm font-bold ${category.color} mb-1 leading-tight`}>{tool.name}</h3>
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{tool.description}</p>
      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-slate-400">Open →</span>
      </div>
    </button>
  );
}

// ─── Compressor Modal ─────────────────────────────────────────────────────────

function CompressorModal({ tool, onClose }: { tool: Tool; onClose: () => void }) {
  const category = getCategoryForTool(tool.id)!;
  const fileRef = useRef<HTMLInputElement>(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [compressed, setCompressed] = useState<CompressedResult | null>(null);
  const [quality, setQuality] = useState(75);
  const [resizeScale, setResizeScale] = useState(100);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notSupported, setNotSupported] = useState(false);

  const isCategoryImage = category.id === 'image';
  const accept = acceptMap[category.id] ?? '*';

  const handleFileSelect = useCallback((file: File) => {
    setUploadedFile(file);
    setCompressed(null);
    setError(null);
    setNotSupported(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleCompress = useCallback(async () => {
    if (!uploadedFile) return;
    setCompressing(true);
    setCompressed(null);
    setError(null);
    setNotSupported(false);

    try {
      const scale = resizeScale / 100;
      const { file: outFile, supported } = await runCompression(uploadedFile, quality, scale);

      setNotSupported(!supported);

      const originalSize = uploadedFile.size;
      const compressedSize = outFile.size;
      const savedBytes = originalSize - compressedSize;
      const ratio = originalSize > 0 ? Math.max(0, Math.round((savedBytes / originalSize) * 100)) : 0;
      const url = URL.createObjectURL(outFile);

      setCompressed({
        originalSize,
        compressedSize,
        ratio,
        url,
        name: uploadedFile.name,
        downloadName: `compressed_${uploadedFile.name}`,
      });
    } catch (err) {
      setError(`Compression failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setCompressing(false);
    }
  }, [uploadedFile, quality, resizeScale]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-[#0d0f14] border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{category.icon}</span>
              <div>
                <h2 className={`text-lg font-bold ${category.color}`}>{tool.name}</h2>
                <p className="text-xs text-slate-500">{tool.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white transition-colors text-xl leading-none mt-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-violet-400 bg-violet-500/10'
                : 'border-white/10 hover:border-white/25 hover:bg-white/3'
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept={accept}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            {uploadedFile ? (
              <div>
                <p className="text-2xl mb-1">📂</p>
                <p className="text-sm font-semibold text-white">{uploadedFile.name}</p>
                <p className="text-xs text-slate-500">{formatBytes(uploadedFile.size)}</p>
                <p className="text-xs text-violet-400 mt-1 hover:underline">Click to change file</p>
              </div>
            ) : (
              <div>
                <p className="text-3xl mb-2">⬆️</p>
                <p className="text-sm text-slate-400">Drop file here or click to browse</p>
                <p className="text-xs text-slate-600 mt-1">{accept === '*' ? 'Supports all formats' : accept}</p>
              </div>
            )}
          </div>

          {/* Quality slider — images only */}
          {isCategoryImage && (
            <div className="space-y-4 bg-white/3 rounded-2xl p-4 border border-white/5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-400">Compression Quality</span>
                  <span className="text-xs font-bold text-white">{quality}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-violet-500"
                />
                <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                  <span>Max compression</span>
                  <span>Max quality</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-400">Resize Scale</span>
                  <span className="text-xs font-bold text-white">{resizeScale}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={resizeScale}
                  onChange={(e) => setResizeScale(Number(e.target.value))}
                  className="w-full accent-fuchsia-500"
                />
                <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                  <span>Smallest (10%)</span>
                  <span>Original (100%)</span>
                </div>
              </div>
            </div>
          )}

          {/* Compress button */}
          <button
            onClick={handleCompress}
            disabled={!uploadedFile || compressing}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-900/30 cursor-pointer"
          >
            {compressing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Compressing…
              </span>
            ) : (
              '⚡ Compress Now'
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
              ❌ {error}
            </div>
          )}

          {/* Not supported warning */}
          {notSupported && compressed && (
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-400">
              ⚠️ <strong>Browser-side compression is not available for {category.label} files.</strong> Video, audio, and some binary formats require server-side processing. The original file is provided for download.
            </div>
          )}

          {/* Result */}
          {compressed && (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
              <p className="text-xs font-bold text-emerald-400 mb-3">✅ Compression Complete</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 mb-1">Original</p>
                  <p className="text-sm font-bold text-white">{formatBytes(compressed.originalSize)}</p>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 mb-1">Compressed</p>
                  <p className="text-sm font-bold text-emerald-400">{formatBytes(compressed.compressedSize)}</p>
                </div>
                <div className="bg-amber-500/10 rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 mb-1">Saved</p>
                  <p className="text-sm font-bold text-amber-400">{compressed.ratio}%</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/5 rounded-full h-2 mb-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(4, 100 - compressed.ratio)}%` }}
                />
              </div>

              {/* Saved bytes */}
              {compressed.ratio > 0 && (
                <p className="text-xs text-center text-slate-400 mb-3">
                  Saved {formatBytes(compressed.originalSize - compressed.compressedSize)} out of {formatBytes(compressed.originalSize)}
                </p>
              )}

              {/* Download */}
              <a
                href={compressed.url}
                download={compressed.downloadName}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
              >
                ⬇️ Download Compressed File
              </a>

              {/* Retry */}
              {isCategoryImage && (
                <button
                  onClick={() => { setCompressed(null); setUploadedFile(uploadedFile); }}
                  className="mt-2 w-full py-2 rounded-xl text-xs text-slate-400 hover:text-white border border-white/5 hover:border-white/20 transition-all cursor-pointer"
                >
                  🔄 Try different quality settings
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CompressorHub() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'name'>('popular');

  const allTools: (Tool & { categoryId: string; categoryLabel: string })[] = useMemo(
    () => CATEGORIES.flatMap((c) => c.tools.map((t) => ({ ...t, categoryId: c.id, categoryLabel: c.label }))),
    []
  );

  const filtered = useMemo(() => {
    let tools = allTools;
    if (activeCategory !== 'all') tools = tools.filter((t) => t.categoryId === activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      tools = tools.filter(
        (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some((tag) => tag.includes(q))
      );
    }
    if (sortBy === 'popular') return [...tools].sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    return [...tools].sort((a, b) => a.name.localeCompare(b.name));
  }, [allTools, activeCategory, query, sortBy]);

  const popularTools = useMemo(() => allTools.filter((t) => t.popular).slice(0, 8), [allTools]);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">
      {activeTool && (
        <CompressorModal tool={activeTool} onClose={() => setActiveTool(null)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero */}
        <section>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-1">
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">All-in-One</span>{' '}
            File Compressor
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            {allTools.length} compression tools · images, video, audio, documents, code and more
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Total Tools', value: allTools.length, icon: '🛠️' },
              { label: 'Categories', value: CATEGORIES.length, icon: '📂' },
              { label: 'AI-Powered', value: allTools.filter((t) => t.badge === 'AI').length, icon: '🧠' },
              { label: 'New Tools', value: allTools.filter((t) => t.new).length, icon: '✨' },
            ].map((s) => (
              <div key={s.label} className="bg-white/3 border border-white/6 rounded-2xl p-4">
                <p className="text-xl mb-1">{s.icon}</p>
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Popular quick picks */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">⭐ Popular Tools</h2>
            <div className="flex flex-wrap gap-2">
              {popularTools.map((t) => {
                const cat = getCategoryForTool(t.id)!;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTool(t)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${cat.bg} text-xs font-semibold ${cat.color} hover:scale-105 transition-transform cursor-pointer`}
                  >
                    {cat.icon} {t.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools (e.g. PNG, PDF, JavaScript…)"
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/60 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'all' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40' : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            All · {allTools.length}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat.id ? `${cat.bg} ${cat.color}` : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {cat.icon} {cat.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-white/10' : 'bg-white/5'}`}>
                {cat.tools.length}
              </span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {filtered.length} tool{filtered.length !== 1 ? 's' : ''}{query ? ` for "${query}"` : ''}
          </p>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex gap-1 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setView('grid')}
                className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${view === 'grid' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
              >
                ⊞
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${view === 'list' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
              >
                ☰
              </button>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'popular' | 'name')}
              className="text-xs bg-white/5 border border-white/8 text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-violet-500/60 cursor-pointer"
            >
              <option value="popular">Popular first</option>
              <option value="name">A → Z</option>
            </select>
          </div>
        </div>

        {/* Grid / List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-slate-400 text-sm">No tools found for <strong className="text-white">"{query}"</strong></p>
            <button onClick={() => setQuery('')} className="mt-3 text-xs text-violet-400 hover:text-violet-300 underline cursor-pointer">
              Clear search
            </button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map((tool) => {
              const cat = CATEGORIES.find((c) => c.id === tool.categoryId) ?? CATEGORIES[0];
              return <ToolCard key={tool.id} tool={tool} category={cat} onClick={() => setActiveTool(tool)} />;
            })}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((tool) => {
              const cat = CATEGORIES.find((c) => c.id === tool.categoryId) ?? CATEGORIES[0];
              return <ToolCard key={tool.id} tool={tool} category={cat} onClick={() => setActiveTool(tool)} listView />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}