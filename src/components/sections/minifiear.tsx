"use client";

import { useState } from "react";

export default function MinifierPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  // ---------------- Minifier Functions ------------------ //

  const minifyXML = (str: string) =>
    str.replace(/>\s+</g, "><").replace(/\s{2,}/g, " ").trim();

  const minifyJS = (str: string) =>
    str
      .replace(/\/\/.*$/gm, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\s+/g, " ")
      .replace(/\s*([{}();,:=+\-<>])\s*/g, "$1")
      .trim();

  const minifyCSS = (str: string) =>
    str
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\s+/g, " ")
      .replace(/\s*([{}:;,])\s*/g, "$1")
      .replace(/;}/g, "}")
      .trim();

  const minifyJSON = (str: string) => {
    try {
      return JSON.stringify(JSON.parse(str));
    } catch {
      return "Invalid JSON";
    }
  };

  const minifySQL = (str: string) =>
    str
      .replace(/--.*$/gm, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\s+/g, " ")
      .trim();

  const minifyHTML = (str: string) =>
    str
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/>\s+</g, "><")
      .replace(/\s{2,}/g, " ")
      .trim();

  const minifyLua = (str: string) =>
    str
      .replace(/--\[\[[\s\S]*?]]/g, "")
      .replace(/--.*$/gm, "")
      .replace(/\s+/g, " ")
      .trim();

  const minifyText = (str: string) => str.replace(/\s+/g, " ").trim();

  // ---------------- Run Minifier ------------------ //

  const runTool = () => {
    if (!selectedTool) return;

    const tools: any = {
      xml: minifyXML,
      js: minifyJS,
      css: minifyCSS,
      json: minifyJSON,
      sql: minifySQL,
      html: minifyHTML,
      lua: minifyLua,
      text: minifyText,
    };

    setOutput(tools[selectedTool](input));
  };

  // ---------------- UI Buttons List ------------------ //

  const tools = [
    { id: "xml", label: "XML Minifier" },
    { id: "js", label: "JS Minifier" },
    { id: "css", label: "CSS Minifier" },
    { id: "json", label: "JSON Minifier" },
    { id: "sql", label: "SQL Minifier" },
    { id: "html", label: "HTML Minifier" },
    { id: "lua", label: "LUA Minifier" },
    { id: "text", label: "Text Minifier" },
  ];

  // ---------------- UI ------------------ //

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-8">
        Code Minifier Tools
      </h1>

      {/* Tool Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-10">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setSelectedTool(tool.id)}
            className={`px-6 py-3 rounded-lg border shadow-sm hover:bg-gray-200 transition ${
              selectedTool === tool.id
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-800"
            }`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      {/* Input + Output */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Input Box */}
        <div>
          <h2 className="mb-2 text-lg font-semibold">Input</h2>
          <textarea
            className="w-full h-64 p-4 border rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Paste your code here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {/* Output Box */}
        <div>
          <h2 className="mb-2 text-lg font-semibold">Output</h2>
          <textarea
            className="w-full h-64 p-4 border rounded-lg shadow-sm bg-gray-50"
            readOnly
            value={output}
          />
        </div>
      </div>

      {/* Run Button */}
      <div className="text-center mt-8">
        <button
          onClick={runTool}
          disabled={!selectedTool}
          className={`px-10 py-3 rounded-lg text-white text-lg ${
            selectedTool
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Minify Now
        </button>
      </div>
    </div>
  );
}
