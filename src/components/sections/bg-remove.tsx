'use client';

import Image from 'next/image';
import React, { useRef, useState, useCallback, DragEvent, ChangeEvent } from 'react';

type Stage = 'idle' | 'processing' | 'done' | 'error';

// Colour options
const BG_OPTIONS = [
  { label: 'Transparent', value: 'transparent', bgClass: 'bg-checker' },
  { label: 'White', value: '#ffffff', bgClass: 'bg-white' },
  { label: 'Black', value: '#000000', bgClass: 'bg-black' },
  { label: 'Light gray', value: '#e5e5e5', bgClass: 'bg-gray-300' },
  { label: 'Sky blue', value: '#dbeafe', bgClass: 'bg-blue-100' },
  { label: 'Mint', value: '#dcfce7', bgClass: 'bg-green-100' },
];

// Compose result onto optional solid background
async function compositeOnBg(blob: Blob, bgCol: string): Promise<string> {
  const bmp = await createImageBitmap(blob);
  const c = document.createElement('canvas');
  c.width = bmp.width;
  c.height = bmp.height;
  const ctx = c.getContext('2d')!;
  if (bgCol !== 'transparent') {
    ctx.fillStyle = bgCol;
    ctx.fillRect(0, 0, c.width, c.height);
  }
  ctx.drawImage(bmp, 0, 0);
  bmp.close();
  return c.toDataURL('image/png');
}

export default function BGRemover() {
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const [progMsg, setProgMsg] = useState('');
  const [original, setOriginal] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [bgCol, setBgCol] = useState('transparent');

  const fileRef = useRef<HTMLInputElement>(null);
  const resultBlob = useRef<Blob | null>(null);

  // Re-composite when bg colour changes
  const applyBg = useCallback(async (col: string) => {
    if (!resultBlob.current) return;
    const url = await compositeOnBg(resultBlob.current, col);
    setResult(url);
  }, []);

  // Process image
  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a PNG, JPG, or WEBP image.');
        setStage('error');
        return;
      }

      setError('');
      setProgress(0);
      setProgMsg('Loading model…');
      setStage('processing');

      const originalUrl = URL.createObjectURL(file);
      setOriginal(originalUrl);

      try {
        const { removeBackground } = await import('@imgly/background-removal');

        const blob = await removeBackground(file, {
          progress: (key: string, current: number, total: number) => {
            const pct = Math.round((current / total) * 100);
            setProgress(pct);
            if (key.includes('fetch') || key.includes('load')) {
              setProgMsg(`Loading AI model… ${pct}%`);
            } else {
              setProgMsg(`Removing background… ${pct}%`);
            }
          },
          // model: "isnet", // lightweight and fast model
          model: 'isnet_fp16', // larger but more accurate, especially on complex backgrounds

          output: { format: 'image/png', quality: 1 },
        });

        resultBlob.current = blob;
        const url = await compositeOnBg(blob, bgCol);
        setResult(url);
        setStage('done');
        setProgress(100);
      } catch (e) {
        console.error(e);
        setError(
          // "@imgly/background-removal not installed. Run: npm i @imgly/background-removal""
          // "
          ''
        );
        setStage('error');
      }
    },
    [bgCol]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const handleBgChange = (val: string) => {
    setBgCol(val);
    if (stage === 'done') applyBg(val);
  };

  const handleReset = () => {
    setStage('idle');
    setOriginal(null);
    setResult(null);
    setError('');
    setProgress(0);
    setProgMsg('');
    resultBlob.current = null;
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result;
    a.download = 'background-removed.png';
    a.click();
  };

  const isWorking = stage === 'processing';

  return (
    <>
      {/* Font imports and custom checkerboard style */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap');
        .bg-checker {
          background: repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 0 0 / 10px 10px;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 text-gray-800 font-['Inter',sans-serif]">
        <div className="text-center pt-12 pb-8 px-4">
          <div className="w-16 h-16 mx-auto bg-white border border-gray-200 rounded-2xl shadow-md flex items-center justify-center mb-6 overflow-hidden">
            {/* <Image src="/image/bg.png" width={72} height={72} alt="logo" /> */}
          </div>
          <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-gray-900">
            Remove backgrounds
            <br />
            instantly with AI
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto mt-4 text-sm sm:text-base">
            Professional‑grade results powered by a real neural segmentation model. Runs 100% in
            your browser
          </p>
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-5 py-2 text-xs text-gray-600 mt-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            ONNX Neural Model · Runs in Browser
          </div>
        </div>

        {/* Main */}
        <div className="max-w-3xl mx-auto px-4 pb-16">
          {/* Background picker */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-xs text-gray-500">Result background:</span>
            {BG_OPTIONS.map(({ label, value, bgClass }) => (
              <button
                key={value}
                title={label}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 shadow-sm ${bgClass} ${
                  bgCol === value ? 'border-indigo-500' : 'border-gray-300'
                }`}
                style={value.startsWith('#') ? { backgroundColor: value } : undefined}
                onClick={() => handleBgChange(value)}
              />
            ))}
          </div>

          {/* Dropzone */}
          <div
            className={`relative bg-white border-2 border-dashed rounded-2xl min-h-[380px] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all shadow-sm ${
              dragOver
                ? 'border-indigo-400 bg-indigo-50/50'
                : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => stage === 'idle' && fileRef.current?.click()}
          >
            {/* checkerboard pattern (transparent hint) */}
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl opacity-10"
              style={{
                backgroundImage:
                  'linear-gradient(45deg,#ccc 25%,transparent 25%), linear-gradient(-45deg,#ccc 25%,transparent 25%), linear-gradient(45deg,transparent 75%,#ccc 75%), linear-gradient(-45deg,transparent 75%,#ccc 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0',
              }}
            />

            {stage === 'idle' && (
              <>
                <button
                  className="relative z-10 bg-indigo-500 text-white rounded-full px-8 py-4 font-semibold flex items-center gap-2 shadow-md hover:bg-indigo-600 hover:-translate-y-0.5 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileRef.current?.click();
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.5" />
                    <line
                      x1="8"
                      y1="5"
                      x2="8"
                      y2="11"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="5"
                      y1="8"
                      x2="11"
                      y2="8"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Start from a photo
                </button>
                <p className="relative z-10 text-sm text-gray-500">
                  Or drop an image here · PNG / JPG / WEBP
                </p>
              </>
            )}

            {isWorking && (
              <div className="relative z-10 w-4/5 flex flex-col items-center gap-5">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-sm text-gray-600">{progMsg || 'Processing…'}</p>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {stage === 'done' && original && result && (
              <div className="relative z-10 w-full" onClick={(e) => e.stopPropagation()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                  <div className="bg-gray-100 rounded-xl overflow-hidden relative shadow-sm">
                    <span className="absolute top-2 left-2 bg-white/80 text-gray-700 text-[0.65rem] px-2 py-0.5 rounded-full uppercase tracking-wide border border-gray-200">
                      Original
                    </span>
                    <img src={original} alt="Original" className="w-full h-56 object-contain" />
                  </div>
                  <div className="bg-[repeating-conic-gradient(#e5e5e5_0%_25%,#f5f5f5_0%_50%)] bg-[length:12px_12px] rounded-xl overflow-hidden relative shadow-sm">
                    <span className="absolute top-2 left-2 bg-white/80 text-gray-700 text-[0.65rem] px-2 py-0.5 rounded-full uppercase tracking-wide border border-gray-200">
                      Result
                    </span>
                    <img src={result} alt="Result" className="w-full h-56 object-contain" />
                  </div>
                </div>
                <div className="flex gap-3 p-4 pt-0">
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-indigo-500 text-white rounded-lg py-3 font-semibold shadow-sm hover:bg-indigo-600 transition"
                  >
                    ↓ Download PNG
                  </button>
                  <button
                    onClick={handleReset}
                    className="bg-white text-gray-600 rounded-lg px-6 py-3 font-medium border border-gray-200 shadow-sm hover:bg-gray-50 hover:text-gray-800 transition"
                  >
                    Try another
                  </button>
                </div>
              </div>
            )}

            {stage === 'error' && (
              <div className="relative z-10 text-center p-6" onClick={(e) => e.stopPropagation()}>
                <div className="text-4xl mb-3">⚠️</div>
                {/* <p className="text-red-500 font-semibold">Package not installed</p> */}
                <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2">{error}</p>
                <div className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 font-mono text-sm text-indigo-600 mt-4 shadow-inner">
                  Please change image formet to PNG, JPG or WEBP and try again.
                </div>
                <button
                  onClick={handleReset}
                  className="mt-6 bg-white text-gray-600 rounded-lg px-6 py-3 font-medium border border-gray-200 shadow-sm hover:bg-gray-50 hover:text-gray-800 transition"
                >
                  Try again
                </button>
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="mt-5 bg-white border border-gray-200 rounded-xl p-5 text-xs text-gray-600 leading-relaxed shadow-sm">
            <strong className="text-gray-800">🧠 How it works:</strong> Uses{' '}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-600">
              @imgly/background-removal
            </code>{' '}
            — a real ONNX neural segmentation model (RMBG / U²‑Net) compiled to WebAssembly. Handles
            hair, fur, complex edges, and busy backgrounds accurately. First run downloads the model
            (~40 MB, cached after that).
          </div>
        </div>

        {/* How it works */}
        <div className="max-w-3xl mx-auto px-4 pb-20">
          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-5">
            How it works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="font-extrabold text-4xl text-indigo-500 mb-3">01</div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Upload any image. Your file is processed entirely in‑browser — zero server calls,
                full privacy.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="font-extrabold text-4xl text-indigo-500 mb-3">02</div>
              <p className="text-sm text-gray-600 leading-relaxed">
                A real U²‑Net / RMBG neural model (ONNX + WASM) segments the foreground with
                pixel‑accurate results.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="font-extrabold text-4xl text-indigo-500 mb-3">03</div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Choose a background colour or keep it transparent, then download your clean PNG.
              </p>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </>
  );
}
