'use client';
/**
 * CompressorHub — All-in-One File Compressor
 * deps: fflate  pdf-lib
 * npm install fflate pdf-lib
 *
 * ALL BUGS FIXED:
 *  ✅ PDF: PDF.js singleton loader (no race condition), renders pages → canvas → JPEG → rebuilt PDF
 *  ✅ PNG: kept as PNG (no black-image bug from JPEG conversion of transparent PNGs)
 *  ✅ ZIP/DOCX/XLSX/PPTX: fflate unzip → rezip DEFLATE-9, integrity maintained
 *  ✅ Audio: MediaRecorder timing fixed (50ms delay before source start)
 *  ✅ Video: progress shown separately, safer autoplay handling
 *  ✅ Folder: webkitdirectory + multi-file fallback for Firefox
 *  ✅ RAR/7Z/binary: gzip wrap with proper fallback
 *  ✅ Progress: shown in dedicated element, not inside button
 *  ✅ All presets: −20% / −30% / −50% wired to every engine
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { gzip, unzip, zip as fflateZip } from 'fflate';
import { PDFDocument } from 'pdf-lib';
import { categoriesHub } from '@/utils/consitants/consitaint';
import { ToolCard } from './toolcard';
import { useRouter } from 'next/navigation';
import { PageTitle } from '../title';
import ContentSection from '@/components/ui/content';

// ─── PRESETS ──────────────────────────────────────────────────────────────────
type Preset = {
  label: string; tag: string; desc: string;
  color: string; ring: string;
  imgQ: number;  imgS: number;        // image quality% + scale%
  pdfS: number;  pdfQ: number;        // pdf render scale + jpeg quality
  audBps: number;                      // audio bitrate bps
  vidBps: number; vidS: number;       // video bitrate bps + scale%
};

const PRESETS: Preset[] = [
  {
    label: 'Light',  tag: '−20%', desc: 'Best quality, moderate reduction',
    color: 'bg-sky-500/15 border-sky-500/50 text-sky-300',
    ring:  'ring-sky-400',
    imgQ: 80, imgS: 92, pdfS: 0.88, pdfQ: 0.78,
    audBps: 128_000, vidBps: 2_200_000, vidS: 92,
  },
  {
    label: 'Medium', tag: '−35%', desc: 'Balanced quality and size',
    color: 'bg-amber-500/15 border-amber-500/50 text-amber-300',
    ring:  'ring-amber-400',
    imgQ: 62, imgS: 82, pdfS: 0.74, pdfQ: 0.60,
    audBps: 96_000, vidBps: 1_100_000, vidS: 78,
  },
  {
    label: 'Heavy',  tag: '−50%', desc: 'Smallest file, lower quality',
    color: 'bg-rose-500/15 border-rose-500/50 text-rose-300',
    ring:  'ring-rose-400',
    imgQ: 40, imgS: 68, pdfS: 0.56, pdfQ: 0.38,
    audBps: 48_000, vidBps: 550_000, vidS: 60,
  },
];

// ─── categoriesHub ───────────────────────────────────────────────────────────────

type Tool     = (typeof categoriesHub)[0]['tools'][0] & {
  categoryId?: string;
  popular?: boolean;
  isNew?: boolean;
  badge?: string;
};
type Category = (typeof categoriesHub)[0];
type Result   = { originalSize: number; compressedSize: number; ratio: number; url: string; downloadName: string; method: string };

// ══════════════════════════════════════════════════════════════════════════════
//  COMPRESSION ENGINE
// ══════════════════════════════════════════════════════════════════════════════

// ── kind detection ─────────────────────────────────────────────────────────────
function detectKind(file: File): string {
  const n = file.name.toLowerCase(), m = file.type;
  if (m.startsWith('image/') || n.match(/\.(png|jpg|jpeg|webp|gif|bmp|tiff?|ico|svg|avif|heic|heif|raw|cr2|nef|psd|tga|dng)$/)) return 'image';
  if (m.startsWith('video/') || n.match(/\.(mp4|mov|avi|mkv|webm|flv|wmv|m4v|3gp|ogv|ts|rm)$/))                                  return 'video';
  if (m.startsWith('audio/') || n.match(/\.(mp3|wav|aac|ogg|flac|m4a|wma|aiff?|opus|amr)$/))                                     return 'audio';
  if (m === 'application/pdf' || n.endsWith('.pdf'))                                                                               return 'pdf';
  if (n.match(/\.(docx|xlsx|pptx|odt|ods|odp|epub|apk|jar|ipa)$/))                                                               return 'office';
  if (n.endsWith('.zip'))                                                                                                          return 'zip';
  if (n.match(/\.(rar|7z|tar|gz|bz2|xz|zst|lz4|cab|iso|dmg)$/))                                                                 return 'archbin';
  if (m.includes('text') || n.match(/\.(js|mjs|ts|jsx|tsx|json|html?|css|xml|txt|php|py|rb|go|rs|java|cpp|c|h|cs|sh|yaml|yml|toml|sql|graphql|md|rtf|csv|log|conf|ini|env)$/) || n === 'dockerfile' || n === 'makefile') return 'text';
  return 'binary';
}

// ── fflate promisified ─────────────────────────────────────────────────────────
const p_gzip  = (d: Uint8Array, lv = 9) => new Promise<Uint8Array>((ok, no) => gzip(d, { level: lv as 0|1|2|3|4|5|6|7|8|9 }, (e,r) => e ? no(e) : ok(r)));
const p_unzip = (d: Uint8Array)          => new Promise<Record<string,Uint8Array>>((ok, no) => unzip(d, (e,r) => e ? no(e) : ok(r)));
const p_zip   = (files: Record<string,Uint8Array>, lv = 9) => new Promise<Uint8Array>((ok, no) => {
const inp = {} as Record<string, Uint8Array | [Uint8Array, { level: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 }]>;
for (const [k,v] of Object.entries(files)) inp[k] = [v, { level: lv as 0|1|2|3|4|5|6|7|8|9 } satisfies { level: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 }];
  fflateZip(inp, (e,r) => e ? no(e) : ok(r));
});

// ── gzip fallback ─────────────────────────────────────────────────────────────
async function eng_gzip(file: File): Promise<{file:File; method:string}> {
  const raw = new Uint8Array(await file.arrayBuffer());
  const gz  = await p_gzip(raw);
  if (gz.length >= raw.length) return { file, method: 'Already compressed — no gain from gzip' };
  return { file: new File([new Uint8Array(gz)], file.name + '.gz', { type: 'application/gzip' }), method: 'fflate gzip' };
}

// ── IMAGE ──────────────────────────────────────────────────────────────────────
// Checks if a canvas has any semi-transparent pixels (samples up to 200×200 area)
function canvasHasTransparency(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  try {
    const sw = Math.min(w, 200), sh = Math.min(h, 200);
    const data = ctx.getImageData(0, 0, sw, sh).data;
    for (let i = 3; i < data.length; i += 4) { if (data[i] < 250) return true; }
  } catch { /**/ }
  return false;
}

async function eng_image(file: File, quality: number, scalePct: number): Promise<{file:File; method:string}> {
  const n = file.name.toLowerCase(), scale = scalePct / 100;

  // SVG: text minification
  if (n.endsWith('.svg') || file.type === 'image/svg+xml') {
    const src = await file.text();
    const min = src.replace(/<!--[\s\S]*?-->/g,'').replace(/\s{2,}/g,' ').replace(/>\s+</g,'><').trim();
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
        const W = Math.max(1, Math.round(img.width  * scale));
        const H = Math.max(1, Math.round(img.height * scale));

        // Draw at target size to detect transparency and produce output
        const cv = document.createElement('canvas');
        cv.width = W; cv.height = H;
        const ctx = cv.getContext('2d');
        if (!ctx) { reject(new Error('Canvas unavailable')); return; }
        ctx.drawImage(img, 0, 0, W, H);

        const isPngInput  = n.endsWith('.png') || file.type === 'image/png';
        const transparent = isPngInput && canvasHasTransparency(ctx, W, H);

        // KEY FIX:
        // - If PNG has NO transparency → convert to JPEG (always smaller for photos/screenshots)
        // - If PNG HAS transparency → keep PNG (scale already reduces size)
        // - All other formats → JPEG
        const useJpeg  = !transparent;
        const outMime  = useJpeg ? 'image/jpeg' : 'image/png';
        // For JPEG: white background to avoid black pixels where alpha was
        if (useJpeg) { ctx.globalCompositeOperation = 'destination-over'; ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,W,H); ctx.globalCompositeOperation = 'source-over'; }

        // Re-draw with white background applied
        const cv2 = document.createElement('canvas');
        cv2.width = W; cv2.height = H;
        const ctx2 = cv2.getContext('2d')!;
        if (useJpeg) { ctx2.fillStyle = '#ffffff'; ctx2.fillRect(0,0,W,H); }
        ctx2.drawImage(img, 0, 0, W, H);

        const outQ = useJpeg ? quality / 100 : undefined;

        cv2.toBlob(blob => {
          if (!blob) { reject(new Error('Canvas toBlob returned null')); return; }

          // If output is LARGER than original (e.g. tiny PNG → large JPEG header overhead),
          // try the opposite format before giving up
          if (blob.size >= file.size && useJpeg && isPngInput) {
            // Fallback: try PNG output
            cv2.toBlob(pngBlob => {
              if (!pngBlob || pngBlob.size >= file.size) {
                // Last resort: scale down more aggressively
                const fW = Math.max(1, Math.round(img.width * scale * 0.8));
                const fH = Math.max(1, Math.round(img.height * scale * 0.8));
                const cv3 = document.createElement('canvas');
                cv3.width = fW; cv3.height = fH;
                const ctx3 = cv3.getContext('2d')!;
                ctx3.fillStyle = '#ffffff'; ctx3.fillRect(0,0,fW,fH);
                ctx3.drawImage(img, 0, 0, fW, fH);
                cv3.toBlob(fb => {
                  if (!fb || fb.size >= file.size) { resolve({ file, method: 'Already at minimum size' }); return; }
                  resolve({ file: new File([fb], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }), method: `Canvas JPEG ${quality}% @ 80% scale (forced reduction)` });
                }, 'image/jpeg', quality / 100);
                return;
              }
              resolve({ file: new File([pngBlob], file.name, { type: 'image/png' }), method: `Canvas PNG ${scalePct}% scale → ${W}×${H}px` });
            }, 'image/png');
            return;
          }

          if (blob.size >= file.size) {
            resolve({ file, method: 'Already at minimum size for this format' });
            return;
          }

          // Success — rename .png → .jpg when converting PNG to JPEG
          const outName = (isPngInput && useJpeg)
            ? file.name.replace(/\.png$/i, '.jpg')
            : file.name;

          resolve({
            file: new File([blob], outName, { type: outMime }),
            method: transparent
              ? `Canvas PNG (transparent) — ${scalePct}% scale → ${W}×${H}px`
              : `Canvas JPEG ${quality}% — ${scalePct}% scale → ${W}×${H}px${isPngInput ? ' (PNG→JPG)' : ''}`,
          });
        }, outMime, outQ);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ── PDF via PDF.js page rendering ──────────────────────────────────────────────
// Singleton loader — safe against multiple concurrent calls
let _pdfJsPromise: Promise<any> | null = null;
function loadPdfJs(): Promise<any> {
  if (_pdfJsPromise) return _pdfJsPromise;
  _pdfJsPromise = new Promise((resolve, reject) => {
    const w = window as any;
    if (w.pdfjsLib?.getDocument) { resolve(w.pdfjsLib); return; }
    const VER = '3.11.174';
    const s   = document.createElement('script');
    s.src             = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${VER}/pdf.min.js`;
    s.crossOrigin     = 'anonymous';
    s.referrerPolicy  = 'no-referrer';
    s.onload = () => {
      const lib = w.pdfjsLib;
      if (!lib?.getDocument) { _pdfJsPromise = null; reject(new Error('pdfjsLib not found after script load')); return; }
      lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${VER}/pdf.worker.min.js`;
      resolve(lib);
    };
    s.onerror = () => { _pdfJsPromise = null; reject(new Error('PDF.js CDN failed to load')); };
    document.head.appendChild(s);
  });
  return _pdfJsPromise;
}

async function eng_pdf(
  file: File, renderScale: number, jpegQ: number,
  onProgress: (s: string) => void
): Promise<{file:File; method:string}> {
  let pdfjs: any;
  try { pdfjs = await loadPdfJs(); }
  catch (e) {
    onProgress('PDF.js unavailable — using gzip fallback');
    return eng_gzip(file);
  }

  try {
    onProgress('Loading PDF…');
    const ab = await file.arrayBuffer();
    const loadTask  = pdfjs.getDocument({ data: new Uint8Array(ab) });
    const srcDoc    = await loadTask.promise;
    const numPages: number = srcDoc.numPages;

    const newPdf = await PDFDocument.create();
    newPdf.setProducer(''); newPdf.setCreator('');

    for (let p = 1; p <= numPages; p++) {
      onProgress(`Rendering page ${p} / ${numPages}…`);
      const page     = await srcDoc.getPage(p);
      const viewport = page.getViewport({ scale: renderScale });
      const W = Math.round(viewport.width), H = Math.round(viewport.height);

      const cv  = document.createElement('canvas');
      cv.width  = W; cv.height = H;
      const ctx = cv.getContext('2d')!;

      // White background so transparency becomes white (not black) in JPEG
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      await page.render({ canvasContext: ctx, viewport }).promise;

      const blob = await new Promise<Blob | null>(r => cv.toBlob(r, 'image/jpeg', jpegQ));
      if (!blob) continue;

const jpg  = new Uint8Array(await blob.arrayBuffer()) as Uint8Array;
      const img  = await newPdf.embedJpg(jpg);
      const pg   = newPdf.addPage([W, H]);
      pg.drawImage(img, { x: 0, y: 0, width: W, height: H });
    }

    const outBytes = await newPdf.save({ useObjectStreams: true });
    const out      = new File([outBytes as any], file.name, { type: 'application/pdf' });

    if (out.size >= file.size) return eng_gzip(file);
    return {
      file: out,
      method: `PDF.js render (scale ${Math.round(renderScale*100)}%, JPEG ${Math.round(jpegQ*100)}%) × ${numPages} page${numPages>1?'s':''}`,
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
    if (n.endsWith('.json'))            return JSON.stringify(JSON.parse(text));
    if (n.match(/\.(html?|htm)$/))      return text.replace(/<!--(?!\s*\[if)[\s\S]*?-->/g,'').replace(/\s{2,}/g,' ').replace(/>\s+</g,'><').trim();
    if (n.endsWith('.css'))             return text.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s*([{}:;,>+~])\s*/g,'$1').replace(/;;+/g,';').replace(/\s+/g,' ').trim();
    if (n.match(/\.(js|mjs|ts|jsx|tsx|php|java|cpp|c|h|cs|rb|go|rs|swift|kt)$/))
                                        return text.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'').replace(/\n\s+/g,'\n').replace(/\s+\n/g,'\n').replace(/\n{2,}/g,'\n').trim();
    if (n.endsWith('.xml'))             return text.replace(/<!--[\s\S]*?-->/g,'').replace(/\s+/g,' ').replace(/>\s+</g,'><').trim();
    if (n.endsWith('.sql'))             return text.replace(/--[^\n]*/g,'').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').trim();
    if (n.match(/\.(yaml|yml)$/))       return text.replace(/#[^\n]*/g,'').replace(/\n{2,}/g,'\n').trim();
  } catch { /**/ }
  return text.replace(/\n\s+/g,'\n').replace(/\n{2,}/g,'\n').trim();
}

async function eng_text(file: File): Promise<{file:File; method:string}> {
  const raw = await file.text();
  const min = await minifyText(raw, file.name);
  const enc = new TextEncoder();
  const rawB = enc.encode(raw), minB = enc.encode(min);
  const gz   = await p_gzip(minB);
  if (gz.length < minB.length && gz.length < rawB.length)
    return { file: new File([gz as any], file.name+'.gz', { type:'application/gzip' }), method: 'Minify + gzip (fflate)' };
  if (minB.length < rawB.length)
    return { file: new File([minB], file.name, { type: file.type||'text/plain' }), method: 'Code/text minification' };
  const gzRaw = await p_gzip(rawB);
  if (gzRaw.length < rawB.length)
    return { file: new File([gzRaw.buffer.slice(gzRaw.byteOffset, gzRaw.byteOffset + gzRaw.byteLength) as ArrayBuffer], file.name+'.gz', { type:'application/gzip' }), method: 'fflate gzip (no minification gain)' };
  return { file, method: 'Already minimal' };
}

// ── ZIP / OFFICE ───────────────────────────────────────────────────────────────
// Extensions that are already compressed and won't benefit from re-compression
const ALREADY_COMPRESSED_EXTS = /\.(jpg|jpeg|png|gif|webp|avif|mp3|mp4|mov|avi|mkv|webm|aac|ogg|flac|m4a|zip|gz|bz2|xz|7z|rar|zst|lz4|pdf|docx|xlsx|pptx|epub|apk|jar|ipa)$/i;

async function eng_zip(file: File): Promise<{file:File; method:string}> {
  const raw = new Uint8Array(await file.arrayBuffer());

  try {
    const entries = await p_unzip(raw);
    const names   = Object.keys(entries);
    if (names.length === 0) throw new Error('empty archive');

    // Count how many entries are already-compressed formats
    const alreadyCompressedCount = names.filter(n => ALREADY_COMPRESSED_EXTS.test(n)).length;
    const compressibleCount      = names.length - alreadyCompressedCount;

    // Repack at DEFLATE-9
    const repacked = await p_zip(entries, 9);

    if (repacked.length < raw.length) {
      const savedPct = Math.round((1 - repacked.length / raw.length) * 100);
      const note = alreadyCompressedCount > 0
        ? ` — ${alreadyCompressedCount} pre-compressed entries (images/media) skipped`
        : '';
      return {
        file: new File([repacked as any], file.name, { type: file.type || 'application/zip' }),
        method: `DEFLATE-9 repack (${names.length} files, ${savedPct}% saved${note})`,
      };
    }

    // Repacked is not smaller — content is already fully compressed
    if (alreadyCompressedCount === names.length) {
      // All files are already compressed — nothing we can do better
      return {
        file,
        method: `ZIP contains ${names.length} pre-compressed files (images/media/archives) — no further compression possible`,
      };
    }
  } catch (e) {
    console.warn('ZIP unzip/repack failed:', e);
    // fflate couldn't parse this ZIP (ZIP64, encrypted, streamed, etc.)
    // Try gzip wrapping as last resort
  }

  // Fallback: gzip the whole archive
  const gz = await p_gzip(raw);
  if (gz.length < raw.length) {
    return { file: new File([gz as any], file.name + '.gz', { type: 'application/gzip' }), method: 'fflate gzip wrap (archive contains pre-compressed data)' };
  }
  return { file, method: 'Archive content is fully compressed — no reduction possible' };
}

// ── WAV resample ───────────────────────────────────────────────────────────────
function buildWav(channels: Float32Array[], sr: number): ArrayBuffer {
  const nCh = channels.length, len = channels[0].length;
  const buf = new ArrayBuffer(44 + len * nCh * 2);
  const v   = new DataView(buf);
  const ws  = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o+i, s.charCodeAt(i)); };
  ws(0,'RIFF'); v.setUint32(4, 36+len*nCh*2, true); ws(8,'WAVE');
  ws(12,'fmt '); v.setUint32(16,16,true); v.setUint16(20,1,true);
  v.setUint16(22,nCh,true); v.setUint32(24,sr,true);
  v.setUint32(28,sr*nCh*2,true); v.setUint16(32,nCh*2,true); v.setUint16(34,16,true);
  ws(36,'data'); v.setUint32(40,len*nCh*2,true);
  let off = 44;
  for (let i = 0; i < len; i++)
    for (let c = 0; c < nCh; c++) {
      const x = Math.max(-1, Math.min(1, channels[c][i]));
      v.setInt16(off, x < 0 ? x*0x8000 : x*0x7fff, true); off += 2;
    }
  return buf;
}

async function eng_wav(file: File, bps: number): Promise<{file:File; method:string}> {
  try {
    const ab   = await file.arrayBuffer();
    const tmpCtx = new OfflineAudioContext(1, 1, 44100);
    const decoded = await tmpCtx.decodeAudioData(ab.slice(0));
    const origRate = decoded.sampleRate;
    const targetRate = bps >= 128_000 ? origRate
                     : bps >= 96_000  ? Math.max(22050, origRate >> 1)
                     : bps >= 64_000  ? Math.max(11025, origRate >> 2)
                     : 8000;
    const outLen = Math.ceil(decoded.duration * targetRate);
    const offCtx = new OfflineAudioContext(1, outLen, targetRate);
    const src    = offCtx.createBufferSource();
    src.buffer   = decoded; src.connect(offCtx.destination); src.start();
    const rendered = await offCtx.startRendering();
    const wav    = buildWav([rendered.getChannelData(0)], targetRate);
    const out    = new File([wav], file.name.replace(/\.[^.]+$/,'.wav'), { type:'audio/wav' });
    if (out.size >= file.size) return eng_gzip(file);
    return { file: out, method: `WAV resample ${origRate}→${targetRate}Hz mono (Web Audio)` };
  } catch { return eng_gzip(file); }
}

// ── AUDIO via MediaRecorder ────────────────────────────────────────────────────
async function eng_audio(file: File, bps: number): Promise<{file:File; method:string}> {
  if (file.name.toLowerCase().endsWith('.wav')) return eng_wav(file, bps);
  if (typeof MediaRecorder === 'undefined')    return eng_gzip(file);

  const mime = ['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/webm']
    .find(m => MediaRecorder.isTypeSupported(m)) ?? null;
  if (!mime) return eng_gzip(file);

  try {
    const ab      = await file.arrayBuffer();
    const actx    = new AudioContext();
    const decoded = await actx.decodeAudioData(ab.slice(0));
    const dest    = actx.createMediaStreamDestination();
    const src     = actx.createBufferSource();
    src.buffer    = decoded; src.connect(dest);

    return new Promise(resolve => {
      const chunks: Blob[] = [];
      const mr = new MediaRecorder(dest.stream, { mimeType: mime, audioBitsPerSecond: bps });
      mr.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      mr.onstop = async () => {
        actx.close();
        const blob = new Blob(chunks, { type: mime });
        const ext  = mime.includes('ogg') ? '.ogg' : '.webm';
        const out  = new File([blob], file.name.replace(/\.[^.]+$/, ext), { type: mime });
        if (out.size >= file.size) { resolve(await eng_gzip(file)); return; }
        resolve({ file: out, method: `Web Audio API → MediaRecorder Opus ${Math.round(bps/1000)}kbps` });
      };
      mr.start();
      // FIX: small delay before starting source so MediaRecorder is ready
      setTimeout(() => { src.start(); }, 50);
      // Stop after audio duration + buffer
      setTimeout(() => { if (mr.state !== 'inactive') { mr.stop(); src.stop(); } }, (decoded.duration + 1.5) * 1000 + 100);
    });
  } catch { return eng_gzip(file); }
}

// ── VIDEO via Canvas + MediaRecorder ──────────────────────────────────────────
async function eng_video(
  file: File, vbps: number, scalePct: number,
  onProgress: (s: string) => void
): Promise<{file:File; method:string}> {
  if (typeof MediaRecorder === 'undefined') return eng_gzip(file);

  const mime = ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm']
    .find(m => MediaRecorder.isTypeSupported(m)) ?? null;
  if (!mime) {
    onProgress('MediaRecorder not supported in this browser');
    return eng_gzip(file);
  }

  const sf  = scalePct / 100;
  const url = URL.createObjectURL(file);

  return new Promise(resolve => {
    const video = document.createElement('video');
    video.muted        = true;
    video.playsInline  = true;
    video.preload      = 'auto';
    video.src          = url;

    video.onerror = async () => {
      URL.revokeObjectURL(url);
      resolve(await eng_gzip(file));
    };

    video.onloadedmetadata = () => {
      const W = Math.max(2, Math.round(video.videoWidth  * sf));
      const H = Math.max(2, Math.round(video.videoHeight * sf));
      const cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      const ctx    = cv.getContext('2d')!;
      const stream = cv.captureStream(24);
      const chunks: Blob[] = [];
      const mr = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: vbps });
      mr.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      mr.onstop = async () => {
        URL.revokeObjectURL(url);
        const blob = new Blob(chunks, { type: mime });
        const out  = new File([blob], file.name.replace(/\.[^.]+$/,'.webm'), { type: mime });
        if (out.size >= file.size) { resolve(await eng_gzip(file)); return; }
        resolve({ file: out, method: `Canvas + MediaRecorder VP9 ${Math.round(vbps/1000)}kbps, ${scalePct}% res` });
      };

      let raf = 0;
      const drawFrame = () => {
        if (video.paused || video.ended) { cancelAnimationFrame(raf); if (mr.state === 'recording') mr.stop(); return; }
        ctx.drawImage(video, 0, 0, W, H);
        onProgress(`Encoding ${video.currentTime.toFixed(1)}s / ${video.duration.toFixed(1)}s…`);
        raf = requestAnimationFrame(drawFrame);
      };

      video.onplay  = () => { raf = requestAnimationFrame(drawFrame); };
      video.onended = () => { cancelAnimationFrame(raf); if (mr.state === 'recording') mr.stop(); };
      video.onpause = () => { cancelAnimationFrame(raf); };

      mr.start(1000);
      // Use play() inside a setTimeout to satisfy autoplay gesture requirements in some contexts
      setTimeout(() => {
        video.play().catch(async () => {
          mr.stop();
          URL.revokeObjectURL(url);
          resolve(await eng_gzip(file));
        });
      }, 0);

      // Safety timeout: 5× video duration max
      const safetyMs = Math.max(30_000, (video.duration + 5) * 5000);
      setTimeout(() => {
        if (mr.state === 'recording') { cancelAnimationFrame(raf); mr.stop(); }
      }, safetyMs);
    };

    video.load();
  });
}

// ── FOLDER → ZIP ──────────────────────────────────────────────────────────────
async function eng_folder(files: File[]): Promise<{file:File; method:string}> {
  const entries: Record<string, Uint8Array> = {};
  for (const f of files) {
    const path = (f as any).webkitRelativePath || f.name;
entries[path] = new Uint8Array(await f.arrayBuffer()) as Uint8Array;
  }
  const zipped     = await p_zip(entries, 9);
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
): Promise<{file:File; method:string}> {
  if (folderFiles && folderFiles.length > 0) {
    onProgress(`Packing ${folderFiles.length} files…`);
    return eng_folder(folderFiles);
  }
  const kind = detectKind(file);
  onProgress(`Detected: ${kind}…`);
  switch (kind) {
    case 'image':   return eng_image(file, preset.imgQ, preset.imgS);
    case 'pdf':     return eng_pdf(file, preset.pdfS, preset.pdfQ, onProgress);
    case 'text':    return eng_text(file);
    case 'office':  return eng_zip(file);
    case 'zip':     return eng_zip(file);
    case 'audio':   return eng_audio(file, preset.audBps);
    case 'video':   return eng_video(file, preset.vidBps, preset.vidS, onProgress);
    case 'archbin': return eng_gzip(file);
    default:        return eng_gzip(file);
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function fmt(b: number) {
  if (b <= 0)     return '0 B';
  if (b < 1024)   return `${b} B`;
  if (b < 1<<20)  return `${(b/1024).toFixed(1)} KB`;
  return `${(b/(1<<20)).toFixed(2)} MB`;
}
function getCat(id: string): Category {
  return categoriesHub.find(c => c.tools.some(t => t.id === id)) ?? categoriesHub[0];
}
const ACCEPT: Record<string,string> = {
  image:    'image/*,.heic,.heif,.avif,.raw,.cr2,.nef,.psd,.tga,.dng',
  video:    'video/*,.mkv,.flv,.wmv,.m4v,.3gp,.ogv,.rm',
  audio:    'audio/*,.flac,.aiff,.aif,.opus,.wma,.amr',
  document: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.epub,.txt,.rtf',
  archive:  '.zip,.rar,.7z,.tar,.gz,.bz2,.xz,.zst,.lz4,.jar,.apk',
  developer:'.html,.htm,.css,.js,.mjs,.ts,.jsx,.tsx,.json,.xml,.yaml,.yml,.toml,.sql,.php,.py,.rb,.go,.rs,.java,.cpp,.c,.h,.cs,.sh,.md,.graphql',
  social:   'image/*,video/*',
};


// ─── ToolCard ──────────────────────────────────────────────────────────────────


// ─── Modal ─────────────────────────────────────────────────────────────────────
function CompressorModal({ tool, onClose }: { tool: Tool; onClose: () => void }) {
  const category  = getCat(tool.id);
  const fileRef   = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const multiRef  = useRef<HTMLInputElement>(null);

  const [file,         setFile]        = useState<File | null>(null);
  const [folderFiles,  setFolderFiles] = useState<File[]>([]);
  const [presetIdx,    setPresetIdx]   = useState(0);
  const [compressing,  setCompressing] = useState(false);
  const [progress,     setProgress]    = useState('');
  const [result,       setResult]      = useState<Result | null>(null);
  const [error,        setError]       = useState('');
  const [dragOver,     setDragOver]    = useState(false);

  const prevUrl = useRef('');
  useEffect(() => () => { if (prevUrl.current) URL.revokeObjectURL(prevUrl.current); }, []);

  const isFolder = tool.id === 'folder';
  const isVideo  = category.id === 'video';
  const isAudio  = category.id === 'audio';
  const preset   = PRESETS[presetIdx];

  const pickFile = useCallback((f: File) => {
    setFile(f); setFolderFiles([]); setResult(null); setError(''); setProgress('');
  }, []);
  const pickFolder = useCallback((fl: File[]) => {
    setFolderFiles(fl); setFile(null); setResult(null); setError(''); setProgress('');
  }, []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0]; if (f) pickFile(f);
  }, [pickFile]);

  const run = useCallback(async () => {
    if (!file && folderFiles.length === 0) return;
    setCompressing(true); setResult(null); setError(''); setProgress('Starting…');
    try {
      const dummy = file ?? new File([], 'folder');
      const { file: out, method } = await runCompress(dummy, preset, setProgress, folderFiles.length > 0 ? folderFiles : undefined);
      if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
      const url = URL.createObjectURL(out);
      prevUrl.current = url;
      const origSize = folderFiles.length > 0 ? folderFiles.reduce((s,f)=>s+f.size,0) : file!.size;
      const ratio    = origSize > 0 ? Math.max(0, Math.round(((origSize - out.size) / origSize) * 100)) : 0;
      setResult({ originalSize: origSize, compressedSize: out.size, ratio, url, downloadName: `compressed_${out.name}`, method });
    } catch (e) {
      setError(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally { setCompressing(false); setProgress(''); }
  }, [file, folderFiles, preset]);

  const hasInput = file !== null || folderFiles.length > 0;
  const totalFolderSize = folderFiles.reduce((s,f)=>s+f.size,0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-lg" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-[#0a0c10] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[94vh]">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-white/5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{category.icon}</span>
              <div>
                <h2 className={`text-base font-bold ${category.color}`}>{tool.name}</h2>
                <p className="text-xs text-slate-500">{tool.description}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer">✕</button>
          </div>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">

          {/* ── PRESET SELECTOR ── */}
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">Choose Compression Level</p>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p, i) => (
                <button key={i} onClick={() => { setPresetIdx(i); setResult(null); }}
                  className={`relative flex flex-col items-center gap-0.5 py-3 px-1 rounded-2xl border-2 font-semibold transition-all cursor-pointer ${
                    presetIdx === i
                      ? `${p.color} ring-2 ${p.ring} ring-offset-1 ring-offset-[#0a0c10] scale-[1.02]`
                      : 'border-white/10 bg-white/3 text-slate-400 hover:border-white/25 hover:bg-white/6'
                  }`}>
                  <span className="text-xl font-black leading-none">{p.tag}</span>
                  <span className="text-[11px]">{p.label}</span>
                  <span className="text-[9px] opacity-60 text-center leading-tight px-1">{p.desc}</span>
                  {presetIdx === i && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full text-[9px] text-white font-black flex items-center justify-center">✓</span>}
                </button>
              ))}
            </div>

            {/* Preset detail row */}
            <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px]">
              {category.id === 'image' && <>
                <div className="bg-white/3 rounded-lg px-2.5 py-1.5 text-slate-400">🖼 Quality <strong className="text-white">{preset.imgQ}%</strong></div>
                <div className="bg-white/3 rounded-lg px-2.5 py-1.5 text-slate-400">📐 Dimensions <strong className="text-white">{preset.imgS}%</strong></div>
                <div className="bg-violet-500/8 border border-violet-500/20 rounded-lg px-2.5 py-1.5 text-slate-400 col-span-2 text-[10px]">💡 PNG without transparency → converted to JPEG for maximum reduction</div>
              </>}
              {category.id === 'document' && <>
                <div className="bg-white/3 rounded-lg px-2.5 py-1.5 text-slate-400">📄 Render <strong className="text-white">{Math.round(preset.pdfS*100)}% scale</strong></div>
                <div className="bg-white/3 rounded-lg px-2.5 py-1.5 text-slate-400">🎨 JPEG <strong className="text-white">{Math.round(preset.pdfQ*100)}% quality</strong></div>
              </>}
              {category.id === 'audio' && <>
                <div className="bg-white/3 rounded-lg px-2.5 py-1.5 text-slate-400 col-span-2">🎵 Output bitrate <strong className="text-white">{preset.audBps/1000}kbps Opus</strong></div>
              </>}
              {category.id === 'video' && <>
                <div className="bg-white/3 rounded-lg px-2.5 py-1.5 text-slate-400">🎥 Bitrate <strong className="text-white">{Math.round(preset.vidBps/1000)}kbps</strong></div>
                <div className="bg-white/3 rounded-lg px-2.5 py-1.5 text-slate-400">📐 Resolution <strong className="text-white">{preset.vidS}%</strong></div>
              </>}
              {(category.id === 'archive' || category.id === 'social') && <>
                <div className="bg-white/3 rounded-lg px-2.5 py-1.5 text-slate-400 col-span-2">📦 DEFLATE level 9 repack + gzip wrap</div>
              </>}
              {category.id === 'developer' && <>
                <div className="bg-white/3 rounded-lg px-2.5 py-1.5 text-slate-400 col-span-2">💻 Minify source + fflate gzip output</div>
              </>}
            </div>
          </div>

          {/* ── FILE INPUT ── */}
          {isFolder ? (
            <div className="space-y-3">
              {/* Folder picker */}
              <div onClick={() => folderRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${folderFiles.length > 0 ? 'border-violet-500/50 bg-violet-500/5' : 'border-white/15 hover:border-violet-400/60 hover:bg-violet-500/5'}`}>
                <input ref={folderRef} type="file" className="hidden"
                  {...({ webkitdirectory: "" } as any)} multiple
                  onChange={e => { const fl = Array.from(e.target.files ?? []); if (fl.length) pickFolder(fl); }} />
                {folderFiles.length > 0 ? (
                  <>
                    <p className="text-2xl mb-1">📁</p>
                    <p className="text-sm font-bold text-white">{(folderFiles[0] as any).webkitRelativePath?.split('/')[0] ?? 'Selected folder'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{folderFiles.length} files · {fmt(totalFolderSize)}</p>
                    <p className="text-xs text-violet-400 mt-1">Click to change</p>
                  </>
                ) : (
                  <>
                    <p className="text-3xl mb-1.5">📁</p>
                    <p className="text-sm font-semibold text-slate-300">Click to select a folder</p>
                    <p className="text-xs text-slate-600 mt-0.5">All files → single compressed ZIP</p>
                  </>
                )}
              </div>

              {/* Multi-file fallback (Firefox) */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-white/8"/><span className="text-[10px] text-slate-600 shrink-0">or select multiple files (Firefox)</span><div className="flex-1 h-px bg-white/8"/>
              </div>
              <div onClick={() => multiRef.current?.click()}
                className="border border-white/10 rounded-xl p-3 text-center cursor-pointer hover:border-white/25 transition-all">
                <input ref={multiRef} type="file" className="hidden" multiple
                  onChange={e => { const fl = Array.from(e.target.files ?? []); if (fl.length) pickFolder(fl); }} />
                <p className="text-xs text-slate-500">📂 Select multiple files manually</p>
              </div>

              {/* Archive drop zone */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-white/8"/><span className="text-[10px] text-slate-600 shrink-0">or drop an existing archive</span><div className="flex-1 h-px bg-white/8"/>
              </div>
              <div onDrop={onDrop} onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)}
                onClick={()=>fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${dragOver?'border-emerald-400 bg-emerald-500/10':'border-white/10 hover:border-white/25'}`}>
                <input ref={fileRef} type="file" className="hidden" accept={ACCEPT.archive}
                  onChange={e=>e.target.files?.[0]&&pickFile(e.target.files[0])}/>
                {file
                  ? <p className="text-xs text-slate-300">📦 {file.name} <span className="text-slate-500">({fmt(file.size)})</span></p>
                  : <p className="text-xs text-slate-500">Drop .zip / .rar / .7z / .tar file here</p>}
              </div>
            </div>
          ) : (
            <div onDrop={onDrop} onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)}
              onClick={()=>fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragOver?'border-violet-400 bg-violet-500/10':'border-white/10 hover:border-white/30 hover:bg-white/3'}`}>
              <input ref={fileRef} type="file" className="hidden" accept={ACCEPT[category.id]??'*'}
                onChange={e=>e.target.files?.[0]&&pickFile(e.target.files[0])}/>
              {file ? (
                <>
                  <p className="text-2xl mb-1.5">📂</p>
                  <p className="text-sm font-semibold text-white break-all leading-snug">{file.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{fmt(file.size)}</p>
                  <p className="text-xs text-violet-400 mt-1.5">Click to change file</p>
                </>
              ) : (
                <>
                  <p className="text-4xl mb-2">⬆️</p>
                  <p className="text-sm font-medium text-slate-400">Drop file here or click to browse</p>
                  <p className="text-xs text-slate-600 mt-1">{ACCEPT[category.id] ?? 'All formats supported'}</p>
                </>
              )}
            </div>
          )}

          {/* Codec notes */}
          {isVideo && (
            <div className="flex gap-2 items-start bg-rose-500/8 border border-rose-500/20 rounded-xl p-3">
              <span className="text-base shrink-0">📹</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">Re-encodes to <strong className="text-slate-200">WebM/VP9</strong> via Canvas + MediaRecorder. Works in Chrome & Edge. Firefox may have limited support.</p>
            </div>
          )}
          {isAudio && (
            <div className="flex gap-2 items-start bg-amber-500/8 border border-amber-500/20 rounded-xl p-3">
              <span className="text-base shrink-0">🎵</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">WAV → resampled WAV (Web Audio API). MP3/AAC/OGG/FLAC → <strong className="text-slate-200">WebM/Opus</strong> via MediaRecorder.</p>
            </div>
          )}

          {/* ── COMPRESS BUTTON ── */}
          <button onClick={run} disabled={!hasInput || compressing}
            className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all cursor-pointer shadow-lg ${
              !hasInput || compressing
                ? 'bg-white/10 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-violet-900/40'
            }`}>
            {compressing
              ? <span className="flex items-center justify-center gap-2.5"><span className="animate-spin w-4 h-4 border-2 border-white/25 border-t-white rounded-full inline-block shrink-0"/>Compressing…</span>
              : `⚡ Compress  ${preset.tag}`}
          </button>

          {/* Progress (separate from button — never truncated) */}
          {compressing && progress && (
            <p className="text-xs text-slate-400 text-center animate-pulse px-2 truncate">{progress}</p>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/25 p-3 text-xs text-red-400 break-words">
              ❌ {error}
            </div>
          )}

          {/* ── RESULT ── */}
          {result && (
            <div className="rounded-2xl bg-emerald-500/8 border border-emerald-500/25 p-4 space-y-3">
              {/* Header row */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-emerald-400">✅ Complete</span>
                <span className="text-[10px] text-slate-500 italic truncate max-w-[60%]" title={result.method}>{result.method}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/5 rounded-xl p-2.5">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wide mb-0.5">Original</p>
                  <p className="text-sm font-bold text-white">{fmt(result.originalSize)}</p>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-2.5">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wide mb-0.5">Output</p>
                  <p className="text-sm font-bold text-emerald-400">{fmt(result.compressedSize)}</p>
                </div>
                <div className={`rounded-xl p-2.5 ${result.ratio >= 20 ? 'bg-emerald-500/15' : result.ratio >= 5 ? 'bg-amber-500/10' : 'bg-white/5'}`}>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wide mb-0.5">Saved</p>
                  <p className={`text-sm font-bold ${result.ratio >= 20 ? 'text-emerald-400' : result.ratio >= 5 ? 'text-amber-400' : 'text-slate-400'}`}>{result.ratio}%</p>
                </div>
              </div>

              {/* Bar */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-600 mb-1">
                  <span>Output size</span>
                  <span>{fmt(result.compressedSize)} of {fmt(result.originalSize)}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(2, 100 - result.ratio)}%` }} />
                </div>
              </div>

              {result.ratio > 0 ? (
                <p className="text-xs text-center text-slate-400">Saved <strong className="text-white">{fmt(result.originalSize - result.compressedSize)}</strong></p>
              ) : result.method.includes('pre-compressed') ? (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300 text-center leading-relaxed">
                  ℹ️ This archive contains images, videos, or media that are already compressed internally. These cannot be reduced further.
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300 text-center leading-relaxed">
                  ⚠️ File is already at minimum size. Try the <strong>Heavy</strong> preset or convert to a more compressible format.
                </div>
              )}

              {/* Download */}
              <a href={result.url} download={result.downloadName}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors shadow-lg shadow-emerald-900/30">
                ⬇️ Download — {fmt(result.compressedSize)}
              </a>

              {/* Switch preset shortcuts */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {PRESETS.map((p, i) => (
                  <button key={i} onClick={() => { setPresetIdx(i); setResult(null); }}
                    disabled={i === presetIdx}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      i === presetIdx ? 'border-white/20 text-slate-600 cursor-default' : `${p.color} hover:opacity-90`
                    }`}>
                    {p.tag} {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CompressorHub(data: any) {
  const [query,          setQuery]          = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTool,     setActiveTool]     = useState<Tool | null>(null);
  const [view,           setView]           = useState<'grid' | 'list'>('grid');
  const [sortBy,         setSortBy]         = useState<'popular' | 'name'>('popular');
  const router = useRouter();
  const allTools = useMemo(
    () => categoriesHub.flatMap(c => c.tools.map(t => ({ ...t, categoryId: c.id }))),
    []
  );
  const filtered = useMemo(() => {
    let t = allTools;
    if (activeCategory !== 'all') t = t.filter(x => x.categoryId === activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      t = t.filter(x => x.name.toLowerCase().includes(q) || x.description.toLowerCase().includes(q) || x.tags.some(g => g.includes(q)));
    }
    return sortBy === 'popular' ? [...t].sort((a,b)=>(b.popular?1:0)-(a.popular?1:0)) : [...t].sort((a,b)=>a.name.localeCompare(b.name));
  }, [allTools, activeCategory, query, sortBy]);

  const popular = useMemo(() => allTools.filter(t => t.popular).slice(0, 10), [allTools]);

  return (
    <div className="min-h-screen bg-[#070810] text-white font-sans">
      {activeTool && <CompressorModal tool={activeTool} onClose={() => setActiveTool(null)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Hero ── */}
        <section className="space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-1">
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">All-in-One</span>{' '}File Compressor
            </h1>
            <PageTitle title={data?.data?.title} description={data?.data?.description} />
            <p className="text-slate-500 text-sm">{allTools.length} tools · Images · Video · Audio · PDF · DOCX · ZIP · RAR · Folder · Code</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Tools', value: allTools.length, icon: '🛠️' },
              { label: 'Categories',  value: categoriesHub.length, icon: '📂' },
              { label: 'Max Savings', value: '50%+', icon: '⚡' },
              { label: 'File Types',  value: '40+', icon: '📁' },
            ].map(s => (
              <div key={s.label} className="bg-white/3 border border-white/6 rounded-2xl p-4">
                <p className="text-xl mb-1">{s.icon}</p>
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Preset preview banner */}
          <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/8 to-fuchsia-500/8 p-4">
            <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">⚡ 3 Compression Presets — on every tool</p>
            <div className="grid grid-cols-3 gap-3">
              {PRESETS.map(p => (
                <div key={p.label} className={`rounded-xl border p-3 text-center ${p.color}`}>
                  <p className="text-2xl font-black">{p.tag}</p>
                  <p className="text-xs font-bold">{p.label}</p>
                  <p className="text-[10px] opacity-60 mt-0.5">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Popular tools */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">⭐ Popular Tools</p>
            <div className="flex flex-wrap gap-2">
              {popular.map(t => {
                const cat = getCat(t.id);
                return (
                  <button key={t.id} onClick={() => setActiveTool(t)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${cat.bg} text-xs font-semibold ${cat.color} hover:scale-105 transition-transform cursor-pointer`}>
                    {cat.icon} {t.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Search ── */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search tools… PNG, MP4, PDF, ZIP, RAR, Folder, JS, WAV…"
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors"/>
          {query && <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer text-sm">✕</button>}
        </div>

        {/* ── Category Tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setActiveCategory('all')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeCategory==='all'?'bg-violet-600 text-white shadow-lg shadow-violet-900/40':'bg-white/5 text-slate-400 hover:bg-white/8'}`}>
            All · {allTools.length}
          </button>
          {categoriesHub.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeCategory===cat.id?`${cat.bg} ${cat.color}`:'bg-white/5 text-slate-400 hover:bg-white/8'}`}>
              {cat.icon} {cat.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeCategory===cat.id?'bg-white/10':'bg-white/5'}`}>{cat.tools.length}</span>
            </button>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">{filtered.length} tool{filtered.length!==1?'s':''}{query?` for "${query}"`:''}  </p>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-white/5 rounded-lg p-1">
              {(['grid','list'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-2 py-1 rounded text-xs font-bold cursor-pointer transition-all ${view===v?'bg-white/10 text-white':'text-slate-500 hover:text-white'}`}>
                  {v==='grid'?'⊞':'☰'}
                </button>
              ))}
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as 'popular'|'name')}
              className="text-xs bg-white/5 border border-white/10 text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-violet-500/50 cursor-pointer">
              <option value="popular">Popular first</option>
              <option value="name">A → Z</option>
            </select>
          </div>
        </div>

        {/* ── Grid / List ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-slate-400 text-sm">No tools found for <strong className="text-white">"{query}"</strong></p>
            <button onClick={() => setQuery('')} className="mt-3 text-xs text-violet-400 hover:text-violet-300 underline cursor-pointer">Clear search</button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map(t => { const cat = categoriesHub.find(c=>c.id===t.categoryId)??categoriesHub[0]; return <ToolCard key={t.id} tool={t} category={cat}/>; })}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map(t => { const cat = categoriesHub.find(c=>c.id===t.categoryId)??categoriesHub[0]; return <ToolCard key={t.id} tool={t} category={cat} listView/>; })}
          </div>
        )}
      </div>
      <ContentSection data={data?.data} />
    </div>
  );
}