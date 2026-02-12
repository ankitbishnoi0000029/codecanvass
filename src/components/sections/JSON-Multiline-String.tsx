"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * JsonMultilineTool.tsx
 *
 * - Plain React + TypeScript single-file component
 * - Tailwind CSS classes are used for styling (you must have Tailwind configured)
 *
 * Behavior:
 * - Left textarea: input JSON
 * - Middle: controls (File, URL, Auto Update, Convert, Split threshold, Split Long Values, Download)
 * - Right textarea: output JSON (formatted)
 *
 * Convert to Multiline: inserts literal "\n" in string values every threshold characters.
 * Split Long Values: replaces long string values with array of chunks (strings) each <= threshold.
 */

function chunkString(str: string, size: number): string[] {
  const result: string[] = [];
  for (let i = 0; i < str.length; i += size) {
    result.push(str.slice(i, i + size));
  }
  return result;
}

function convertStringsToMultiline(obj: any, threshold: number): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") {
    if (threshold > 0 && obj.length > threshold) {
      // Insert literal newline characters
      return chunkString(obj, threshold).join("\\n");
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((v) => convertStringsToMultiline(v, threshold));
  }
  if (typeof obj === "object") {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = convertStringsToMultiline(v, threshold);
    }
    return out;
  }
  return obj;
}

function splitStringsToArray(obj: any, threshold: number): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") {
    if (threshold > 0 && obj.length > threshold) {
      return chunkString(obj, threshold);
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((v) => splitStringsToArray(v, threshold));
  }
  if (typeof obj === "object") {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = splitStringsToArray(v, threshold);
    }
    return out;
  }
  return obj;
}

export default function JsonMultilineTool(){
  const [inputJson, setInputJson] = useState<string>(""); // raw input text
  const [outputJson, setOutputJson] = useState<string>(""); // formatted output
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true);
  const [threshold, setThreshold] = useState<number>(20);
  const [lastError, setLastError] = useState<string | null>(null);

  const leftRef = useRef<HTMLTextAreaElement | null>(null);
  const rightRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Convert and set output as pretty JSON
  const handleConvertToMultiline = (src?: string) => {
    setLastError(null);
    const raw = src !== undefined ? src : inputJson;
    if (!raw.trim()) {
      setOutputJson("");
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      const converted = convertStringsToMultiline(parsed, Math.max(0, Math.floor(threshold)));
      setOutputJson(JSON.stringify(converted, null, 2));
    } catch (err: any) {
      setLastError(err?.message || "Invalid JSON");
    }
  };

  const handleSplitLongValues = (src?: string) => {
    setLastError(null);
    const raw = src !== undefined ? src : inputJson;
    if (!raw.trim()) {
      setOutputJson("");
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      const converted = splitStringsToArray(parsed, Math.max(0, Math.floor(threshold)));
      setOutputJson(JSON.stringify(converted, null, 2));
    } catch (err: any) {
      setLastError(err?.message || "Invalid JSON");
    }
  };

  // Auto update on input change
  useEffect(() => {
    if (!autoUpdate) return;
    // small debounce
    const t = setTimeout(() => {
      handleConvertToMultiline();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputJson, threshold, autoUpdate]);

  // File load
  const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      setInputJson(text);
      if (autoUpdate) {
        handleConvertToMultiline(text);
      }
    };
    reader.readAsText(f);
    // reset input so same file can be picked again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Load from URL (CORS required)
  const handleLoadURL = async () => {
    const url = prompt("Enter URL of JSON (must be CORS-enabled):");
    if (!url) return;
    try {
      const resp = await fetch(url);
      const text = await resp.text();
      setInputJson(text);
      if (autoUpdate) handleConvertToMultiline(text);
    } catch (err) {
      alert("Failed to load URL. Check CORS and URL correctness.");
    }
  };

  // Download output
  const handleDownload = () => {
    if (!outputJson) {
      alert("Nothing to download.");
      return;
    }
    const blob = new Blob([outputJson], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "multiline.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy output
  const handleCopyOutput = async () => {
    try {
      await navigator.clipboard.writeText(outputJson);
      alert("Copied output to clipboard");
    } catch {
      alert("Copy failed. Select and copy manually.");
    }
  };

  // Pretty-format input (helpful)
  const handleFormatInput = () => {
    try {
      const parsed = JSON.parse(inputJson || "{}");
      const pretty = JSON.stringify(parsed, null, 2);
      setInputJson(pretty);
    } catch {
      alert("Invalid JSON — cannot format.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">JSON Multiline String</h1>

        <div className="flex gap-6">
          {/* LEFT EDITOR */}
          <div className="flex-1 bg-white rounded-md shadow-sm border border-gray-200">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
              <div className="text-sm text-gray-600">Input</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFormatInput}
                  className="text-xs px-2 py-1 border rounded bg-gray-100"
                >
                  Format
                </button>
                <span className="text-xs text-gray-400">Ln: 1 Col: 1</span>
              </div>
            </div>
            <textarea
              ref={leftRef}
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              placeholder='Paste JSON here (e.g. {"a":"long string"...})'
              className="w-full h-[560px] p-4 text-sm font-mono resize-none outline-none"
            />
          </div>

          {/* MIDDLE CONTROLS */}
          <div className="w-80 bg-white rounded-md shadow-sm border border-gray-200 p-4 flex flex-col items-stretch">
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <label className="relative overflow-hidden flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,text/*"
                    onChange={handleLoadFile}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-sm px-3 py-2 border rounded text-center bg-gray-100">File</div>
                </label>

                <button
                  onClick={handleLoadURL}
                  className="px-3 py-2 border rounded text-sm bg-white"
                >
                  URL
                </button>
              </div>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoUpdate}
                  onChange={(e) => setAutoUpdate(e.target.checked)}
                />
                <span>Auto Update</span>
              </label>

              <div className="mt-3">
                <button
                  onClick={() => handleConvertToMultiline()}
                  className="w-full bg-emerald-400 hover:bg-emerald-500 text-white py-2 rounded"
                >
                  Convert to Multiline
                </button>
              </div>

              <div className="mt-2">
                <label className="block text-xs text-gray-600 mb-1">Split Length Threshold</label>
                <input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full p-2 border rounded text-sm"
                />
              </div>

              <div className="mt-2">
                <button
                  onClick={() => handleSplitLongValues()}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 rounded"
                >
                  Split Long Values
                </button>
              </div>

              <div className="mt-3">
                <button
                  onClick={handleDownload}
                  className="w-full py-2 border rounded text-sm bg-white"
                >
                  Download
                </button>
              </div>

              <div className="mt-3 text-center text-sm text-blue-600">
                <a href="#" onClick={(e) => e.preventDefault()}>
                  JSON Sorter
                </a>
              </div>

              {lastError && (
                <div className="mt-3 text-sm text-red-600 break-words">
                  Error: {lastError}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT EDITOR */}
          <div className="flex-1 bg-white rounded-md shadow-sm border border-gray-200">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
              <div className="text-sm text-gray-600">Output</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(outputJson).then(() => {
                      alert("Copied output");
                    });
                  }}
                  className="text-xs px-2 py-1 border rounded bg-gray-100"
                >
                  Copy
                </button>
                <span className="text-xs text-gray-400">Ln: 1 Col: 1</span>
              </div>
            </div>
            <textarea
              ref={rightRef}
              value={outputJson}
              onChange={(e) => setOutputJson(e.target.value)}
              placeholder="Output JSON will appear here"
              className="w-full h-[560px] p-4 text-sm font-mono resize-none outline-none"
            />
            <div className="p-3 border-t border-gray-100 text-sm text-gray-500">
              Size: {new Blob([outputJson || ""], { type: "application/json" }).size} B, {outputJson.length} Characters
              <div className="mt-2">
                <button
                  onClick={handleCopyOutput}
                  className="mr-2 px-3 py-1 border rounded text-sm"
                >
                  Copy To Clipboard
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1 border rounded text-sm bg-gray-50"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* small footer */}
        <div className="mt-6 text-sm text-gray-600">
          Tip: Use <code>Split Long Values</code> to convert long strings into arrays. Use <code>Convert to Multiline</code> to insert literal <code>\n</code> inside strings.
        </div>
      </div>
    </div>
  );
}
