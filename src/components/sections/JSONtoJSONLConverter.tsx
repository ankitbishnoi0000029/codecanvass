"use client";

import React, { useEffect, useRef, useState } from "react";

type NullableString = string | null;

export default function JSONtoJSONLConverter(){
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [auto, setAuto] = useState<boolean>(true);
  const [lastError, setLastError] = useState<NullableString>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Convert JSON -> JSONL
  const convert = (src?: string) => {
    setLastError(null);
    const raw = src !== undefined ? src : input;
    if (!raw.trim()) {
      setOutput("");
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      let jsonl = "";

      if (Array.isArray(parsed)) {
        jsonl = parsed.map((it) => JSON.stringify(it)).join("\n");
      } else {
        // single object -> single-line JSON (JSONL can contain single-line)
        jsonl = JSON.stringify(parsed);
      }

      setOutput(jsonl);
    } catch (err: any) {
      setOutput("");
      setLastError(err?.message ?? "Invalid JSON");
    }
  };

  // Auto-convert when input changes (debounced)
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => convert(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, auto]);

  // File load handler
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const txt = String(reader.result || "");
      setInput(txt);
      if (auto) convert(txt);
    };
    reader.readAsText(f);
    // reset file input value to allow same file to be picked again
    if (fileRef.current) fileRef.current.value = "";
  };

  // Load from URL (CORS must allow)
  const handleLoadURL = async () => {
    const url = prompt("Enter URL of JSON (CORS-enabled):");
    if (!url) return;
    try {
      const res = await fetch(url);
      const text = await res.text();
      setInput(text);
      if (auto) convert(text);
    } catch {
      alert("Failed to load URL. Check CORS and URL.");
    }
  };

  const handleDownload = () => {
    if (!output) {
      alert("Nothing to download");
      return;
    }
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "output.jsonl";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleCopyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      alert("Copied output to clipboard");
    } catch {
      alert("Copy failed — please select and copy manually.");
    }
  };

  const handleSample = () => {
    const sample = `[
  { "id": 1, "name": "Alice", "bio": "This is a long bio for Alice." },
  { "id": 2, "name": "Bob", "bio": "Bob's bio goes here." }
]`;
    setInput(sample);
    if (auto) convert(sample);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setLastError(null);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-8">
      <div className="max-w-[1400px] mx-auto bg-white rounded-xl shadow-sm p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">JSON to JSONL Converter</h1>
        </div>

        {/* 3-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT editor */}
          <div className="border rounded-lg overflow-hidden">
            {/* toolbar mimic */}
            <div className="flex items-center justify-between bg-[#616161] text-white px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <button
                  className="px-2 py-1 bg-transparent hover:opacity-90 rounded"
                  onClick={() => {
                    // small toolbar sample: format input if valid JSON
                    try {
                      const parsed = JSON.parse(input || "{}");
                      setInput(JSON.stringify(parsed, null, 2));
                    } catch {
                      alert("Invalid JSON — cannot format");
                    }
                  }}
                >
                  Sample
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // copy input
                    try {
                      navigator.clipboard.writeText(input);
                    } catch {}
                  }}
                  title="Copy"
                >
                  📋
                </button>
                <button
                  onClick={() => {
                    setInput((s) => {
                      try {
                        const parsed = JSON.parse(s || "{}");
                        return JSON.stringify(parsed, null, 2);
                      } catch {
                        return s;
                      }
                    });
                  }}
                  title="Beautify"
                >
                  🔧
                </button>
              </div>
            </div>

            {/* textarea */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste or type your JSON here..."
              className="w-full h-[480px] p-4 font-mono text-sm outline-none resize-none"
            />
            <div className="px-3 py-2 text-xs text-gray-500 border-t">Ln: 1 Col: 0</div>
          </div>

          {/* MIDDLE controls */}
          <div className="flex flex-col items-center gap-4 border rounded-lg p-6">
            {/* File + URL */}
            <div className="w-full flex flex-col gap-3">
              <label className="relative overflow-hidden">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".json,text/*"
                  onChange={handleFile}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-full text-center py-2 border rounded bg-white">File</div>
              </label>

              <button
                onClick={handleLoadURL}
                className="w-full py-2 border rounded bg-white"
              >
                URL
              </button>

              <label className="inline-flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={auto}
                  onChange={() => setAuto((v) => !v)}
                />
                <span className="ml-2 text-sm">Auto Update</span>
              </label>
            </div>

            {/* Main action */}
            <button
              onClick={() => convert()}
              className="w-full bg-teal-400 hover:bg-teal-500 text-white py-3 rounded font-semibold"
            >
              JSON to JSONL
            </button>

            {/* Secondary actions */}
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={handleDownload}
                className="w-full py-2 border rounded bg-white"
              >
                Download
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleSample}
                  className="flex-1 py-2 border rounded bg-white text-sm"
                >
                  Sample
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 py-2 border rounded bg-white text-sm"
                >
                  Clear
                </button>
              </div>

              <button
                onClick={handleCopyOutput}
                className="w-full py-2 border rounded bg-white"
              >
                Copy Output
              </button>
            </div>

            <div className="mt-2 text-xs text-gray-500">JSON Sorter</div>

            {lastError && (
              <div className="mt-3 text-sm text-red-600 break-words">{lastError}</div>
            )}
          </div>

          {/* RIGHT output */}
          <div className="border rounded-lg overflow-hidden">
            {/* toolbar mimic */}
            <div className="flex items-center justify-between bg-[#616161] text-white px-3 py-2 text-sm">
              <div>Output</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // clear output
                    setOutput("");
                  }}
                >
                  🗑
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(output);
                  }}
                >
                  📋
                </button>
              </div>
            </div>

            <textarea
              value={output}
              readOnly
              className="w-full h-[480px] p-4 font-mono text-sm outline-none resize-none bg-white"
            />

            <div className="px-3 py-2 text-xs text-gray-500 border-t">
              Size: {new Blob([output || ""], { type: "text/plain" }).size} B, {output.length} Characters
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
