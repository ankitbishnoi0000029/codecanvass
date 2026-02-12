"use client";

import { useState } from "react";

export default function HtmlToJsxConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [auto, setAuto] = useState(true);
  const [urlInput, setUrlInput] = useState("");

  // Convert HTML → JSX
  const convertHTMLtoJSX = () => {
    try {
      let jsx = input;

      jsx = jsx.replace(/class=/g, "className=");
      jsx = jsx.replace(/for=/g, "htmlFor=");
      jsx = jsx.replace(/<br>/g, "<br />");
      jsx = jsx.replace(/<hr>/g, "<hr />");

      setOutput(jsx);
    } catch (e) {
      setOutput("Invalid HTML");
    }
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInput(text);
      if (auto) convertHTMLtoJSX();
    };
    reader.readAsText(file);
  };

  // Fetch HTML from URL
  const fetchFromURL = async () => {
    if (!urlInput.trim()) return alert("Please enter a valid URL");
    try {
      const res = await fetch(`/api/fetch-html?url=${encodeURIComponent(urlInput)}`);
      const data = await res.text();
      setInput(data);
      if (auto) convertHTMLtoJSX();
    } catch (error) {
      alert("Failed to fetch HTML from URL");
    }
  };

  return (
    <div className="w-full flex justify-center bg-gray-100 py-10">
      <div className="w-full max-w-[1400px] bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold mb-6">HTML to JSX Converter</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEFT HTML INPUT */}
          <div className="border rounded-lg shadow-sm">
            <div className="p-2 bg-gray-100 border-b text-sm font-medium">HTML Input</div>

            <textarea
              className="w-full h-[500px] p-3 outline-none font-mono text-sm"
              placeholder="Paste HTML here..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (auto) convertHTMLtoJSX();
              }}
            />
          </div>

          {/* CENTER CONTROLS */}
          <div className="flex flex-col border rounded-lg shadow-sm p-6 gap-4 items-center justify-start w-full">
            {/* File Upload */}
            <label className="w-full">
              <div className="bg-gray-200 py-2 px-4 rounded-lg w-full font-medium text-center cursor-pointer">
                Upload File
              </div>
              <input type="file" accept=".html,.txt" className="hidden" onChange={handleFileUpload} />
            </label>

            {/* URL Input */}
            <input
              type="text"
              placeholder="Enter URL..."
              className="w-full border rounded-lg p-2 text-sm"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
            <button
              onClick={fetchFromURL}
              className="bg-gray-200 py-2 px-4 rounded-lg w-full font-medium"
            >
              Fetch URL
            </button>

            {/* Auto Update */}
            <label className="flex items-center gap-2 w-full">
              <input
                type="checkbox"
                checked={auto}
                onChange={() => setAuto(!auto)}
              />
              <span className="text-sm font-medium">Auto Update</span>
            </label>

            {/* Convert Button */}
            <button
              onClick={convertHTMLtoJSX}
              className="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold"
            >
              HTML to JSX
            </button>

            {/* Download Button */}
            <button
              onClick={() => {
                const blob = new Blob([output], { type: "text/plain" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "output.jsx";
                link.click();
              }}
              className="w-full bg-gray-200 py-3 rounded-lg font-semibold"
            >
              Download
            </button>
          </div>

          {/* JSX OUTPUT */}
          <div className="border rounded-lg shadow-sm">
            <div className="p-2 bg-gray-100 border-b text-sm font-medium">JSX Output</div>
            <textarea
              className="w-full h-[500px] p-3 outline-none font-mono text-sm"
              value={output}
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}
