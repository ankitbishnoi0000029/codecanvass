"use client";

import React, { useEffect, useRef, useState } from "react";

type Mode = "decimal" | "hex" | "binary";
type Separator = "space" | "newline";

function textToAsciiArray(text: string, mode: Mode): string[] {
  const arr: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);

    if (mode === "decimal") arr.push(String(code));
    else if (mode === "hex") arr.push(code.toString(16).padStart(2, "0"));
    else arr.push(code.toString(2).padStart(8, "0")); // binary
  }

  return arr;
}

export default function AsciiConverter() {
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true);
  const [mode, setMode] = useState<Mode>("decimal");
  const [separator, setSeparator] = useState<Separator>("space");
  const [status, setStatus] = useState<string>("");

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const outputRef = useRef<HTMLTextAreaElement | null>(null);

  // Convert function
  function convertNow() {
    try {
      const arr = textToAsciiArray(input, mode);
      const sep = separator === "space" ? " " : "\n";

      const out =
        mode === "hex"
          ? arr.map((v) => v.toUpperCase()).join(sep)
          : arr.join(sep);

      setOutput(out);
      setStatus(`Converted ${input.length} chars`);
    } catch {
      setStatus("Conversion error");
    }
  }

  // Auto update 
  useEffect(() => {
    if (autoUpdate) convertNow();
  }, [input, mode, separator, autoUpdate]);

  // File load
  const onFileChange = (file?: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setInput(String(reader.result ?? ""));
      setStatus(`Loaded file: ${file.name}`);
    };
    reader.onerror = () => setStatus("File read error");
    reader.readAsText(file);
  };

  // URL load
  const loadFromUrl = async (url: string) => {
    try {
      setStatus("Fetching...");
      const res = await fetch(url);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const txt = await res.text();
      setInput(txt);
      setStatus(`Loaded from URL`);
    } catch (e) {
      setStatus(`Fetch failed: ${(e as Error).message}`);
    }
  };

  // Copy output
  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setStatus("Output copied to clipboard");
    } catch {
      setStatus("Copy failed");
    }
  };

  // Download output
  const downloadOutput = (filename = "ascii.txt") => {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
    setStatus("Download started");
  };

  return (
    <div style={{ display: "flex", gap: 18 }}>
      
      {/* Left side: Input */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
          <strong>Input</strong>
          <span style={{ fontSize: 13, color: "#666" }}>{`Chars: ${input.length}`}</span>
        </div>

        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste or type your data here..."
          style={{
            width: "100%",
            height: 420,
            borderRadius: 6,
            border: "1px solid #ccc",
            padding: 12,
            fontFamily: "monospace",
            fontSize: 14,
            resize: "vertical",
            boxSizing: "border-box",
            background: "#fafafa",
          }}
        />

        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="file"
              accept=".txt,*/*"
              onChange={(e) => onFileChange(e.target.files?.[0])}
            />
            <span style={{ fontSize: 13 }}>File</span>
          </label>

          {/* URL loader */}
          <input
            type="text"
            placeholder="Load from URL (https://...)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const v = (e.target as HTMLInputElement).value;
                if (v) loadFromUrl(v);
              }
            }}
            style={{ padding: "6px 8px", width: 280 }}
          />
          <button
            onClick={() => {
              const active = document.activeElement as HTMLInputElement | null;
              if (active?.value) loadFromUrl(active.value);
            }}
            style={{ padding: "6px 10px" }}
          >
            Load
          </button>

          {/* Auto update */}
          <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={autoUpdate}
              onChange={(e) => setAutoUpdate(e.target.checked)}
            />
            <span style={{ fontSize: 13 }}>Auto Update</span>
          </label>
        </div>
      </div>

      {/* Middle Controls */}
      <div style={{ width: 360, borderRadius: 8, border: "1px solid #e6e6e6", padding: 16 }}>
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <button
            onClick={convertNow}
            style={{
              background: "#00bfa6",
              color: "#fff",
              padding: "10px 18px",
              borderRadius: 6,
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
            }}
          >
            Code to ASCII
          </button>
        </div>

        {/* Mode */}
        <label style={{ fontWeight: 600 }}>Output Format</label>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <label><input type="radio" checked={mode === "decimal"} onChange={() => setMode("decimal")} /> Decimal</label>
          <label><input type="radio" checked={mode === "hex"} onChange={() => setMode("hex")} /> Hex</label>
          <label><input type="radio" checked={mode === "binary"} onChange={() => setMode("binary")} /> Binary</label>
        </div>

        {/* Separator */}
        <label style={{ fontWeight: 600, marginTop: 12, display: "block" }}>Separator</label>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <label><input type="radio" checked={separator === "space"} onChange={() => setSeparator("space")} /> Space</label>
          <label><input type="radio" checked={separator === "newline"} onChange={() => setSeparator("newline")} /> Newline</label>
        </div>

        {/* Buttons */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setInput(""); setOutput(""); setStatus(""); }} style={{ flex: 1 }}>New</button>
            <button onClick={() => setInput("")} style={{ flex: 1 }}>Clear Input</button>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={() => { setOutput(""); setStatus(""); }} style={{ flex: 1 }}>Clear Output</button>
            <button
              onClick={() => {
                setInput(output);
                if (autoUpdate) convertNow();
              }}
              style={{ flex: 1 }}
            >
              Use Output as Input
            </button>
          </div>
        </div>

        <button onClick={copyOutput} style={{ width: "100%", marginTop: 14 }}>Copy Output</button>
        <button onClick={() => downloadOutput()} style={{ width: "100%", marginTop: 8 }}>Download</button>

        <div style={{ marginTop: 12, fontSize: 13, color: "#666" }}>{status}</div>
      </div>

      {/* Right: Output */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
          <strong>Output</strong>
          <span style={{ fontSize: 13, color: "#666" }}>
            {`Ln: ${output ? output.split("\n").length : 0} Tokens`}
          </span>
        </div>

        <textarea
          ref={outputRef}
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          placeholder="Output will appear here..."
          style={{
            width: "100%",
            height: 420,
            borderRadius: 6,
            border: "1px solid #ccc",
            padding: 12,
            fontFamily: "monospace",
            fontSize: 14,
            boxSizing: "border-box",
          }}
        />
      </div>

    </div>
  );
}
