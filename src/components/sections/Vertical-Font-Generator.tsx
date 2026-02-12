"use client";

import React, { useState, useRef } from "react";

type Mode = "characters" | "words" | "statement";

export default function VerticalFontGenerator(){
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [mode, setMode] = useState<Mode>("characters");
  const [horizontalSep, setHorizontalSep] = useState<string>("");
  const [verticalSep, setVerticalSep] = useState<string>("\\n");
  const [autoHorizontal, setAutoHorizontal] = useState<boolean>(true);

  const outputRef = useRef<HTMLTextAreaElement | null>(null);

  // ESCAPE sequence parser
  const parseEscape = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\r/g, "\r");
  };

  // MAIN CONVERT FUNCTION
  const handleConvert = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    let parts: string[] = [];

    if (mode === "characters") {
      parts = [...input]; // simple split by characters
    } else if (mode === "words") {
      parts = input.trim().split(/\s+/g);
    } else {
      parts = input
        .split(/(?<=[.!?;:\u0964\u0965])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const vSep = parseEscape(verticalSep);
    const hSep = autoHorizontal ? parseEscape(horizontalSep) : "";

    // Build final output
    const finalOutput = parts
      .map((p) => p + (hSep || ""))
      .join(vSep || "\n");

    setOutput(finalOutput);

    setTimeout(() => {
      outputRef.current?.focus();
    }, 50);
  };

  // COPY
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      alert("Copied!");
    } catch {
      alert("Copy failed!");
    }
  };

  // DOWNLOAD
  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "vertical-text.txt";
    a.click();

    URL.revokeObjectURL(url);
  };

  // FILE LOAD
  const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const reader = new FileReader();
    reader.onload = () => {
      setInput(String(reader.result || ""));
    };
    reader.readAsText(f);
  };

  // LOAD URL
  const handleLoadURL = () => {
    const url = prompt("Enter text file URL:");
    if (!url) return;

    fetch(url)
      .then((r) => r.text())
      .then((t) => setInput(t))
      .catch(() => alert("Failed to load URL."));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-8">
        {/* HEADER */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Vertical Font Generator</h1>
          <div className="text-sm text-gray-500">Sample</div>
        </header>

        {/* INPUT */}
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Input Text
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter Text to convert to Vertical Text"
          className="w-full h-40 p-4 border border-teal-300 rounded-md focus:ring-2 focus:ring-teal-400 resize-none"
        />

        {/* OPTIONS ROW */}
        <div className="flex items-center justify-between mt-4 mb-4">
          <div className="flex items-center space-x-4">
            {/* radio buttons */}
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={mode === "characters"}
                onChange={() => setMode("characters")}
              />
              <span className="ml-2">by Characters</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={mode === "words"}
                onChange={() => setMode("words")}
              />
              <span className="ml-2">by Words</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={mode === "statement"}
                onChange={() => setMode("statement")}
              />
              <span className="ml-2">by Statement</span>
            </label>
          </div>

          <div className="text-sm text-gray-500">
            Size : {output.length} chars
          </div>
        </div>

        {/* SEPARATORS + BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Horizontal */}
          <div>
            <label className="block mb-1 text-sm text-gray-700">
              Horizontal Separator
            </label>
            <input
              value={horizontalSep}
              onChange={(e) => setHorizontalSep(e.target.value)}
              placeholder="Horizontal Separator"
              className="w-full p-2 border rounded-md"
            />

            <label className="inline-flex items-center mt-2">
              <input
                type="checkbox"
                checked={autoHorizontal}
                onChange={(e) => setAutoHorizontal(e.target.checked)}
              />
              <span className="ml-2 text-sm">Auto</span>
            </label>
          </div>

          {/* Vertical */}
          <div>
            <label className="block mb-1 text-sm text-gray-700">
              Vertical Separator
            </label>
            <input
              value={verticalSep}
              onChange={(e) => setVerticalSep(e.target.value)}
              placeholder="\\n"
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleConvert}
              className="bg-teal-500 text-white px-4 py-2 rounded-md shadow hover:bg-teal-600"
            >
              Convert
            </button>

            <label className="relative overflow-hidden bg-gray-100 px-4 py-2 rounded-md cursor-pointer border">
              <input
                type="file"
                onChange={handleLoadFile}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              File..
            </label>

            <button
              onClick={handleLoadURL}
              className="px-4 py-2 border rounded-md"
            >
              Load URL
            </button>
          </div>
        </div>

        {/* OUTPUT */}
        <label className="block mt-6 mb-2 text-sm font-medium text-gray-700">
          Output Text
        </label>
        <textarea
          ref={outputRef}
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          className="w-full h-40 p-4 border border-blue-300 rounded-md resize-none"
        />

        {/* FOOTER BUTTONS */}
        <div className="flex justify-center space-x-6 mt-6">
          <button
            onClick={handleCopy}
            className="px-6 py-2 border rounded-md"
          >
            Copy To Clipboard
          </button>

          <button
            onClick={handleDownload}
            className="px-6 py-2 bg-gray-100 border rounded-md"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
