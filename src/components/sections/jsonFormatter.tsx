"use client"
import React, { useState } from "react";

function JsonFormatterTool() {
  const [inputJson, setInputJson] = useState("");
  const [outputJson, setOutputJson] = useState("");
  const [tabSpace, setTabSpace] = useState("2");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConvertDropdown, setShowConvertDropdown] = useState(false);
  const [showFixModal, setShowFixModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Clear output when input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputJson(e.target.value);
    setOutputJson("");
    setError("");
    setSuccess("");
  };

  const validateJson = () => {
    setError("");
    setSuccess("");
    if (!inputJson.trim()) {
      setError("Please enter JSON data");
      return;
    }
    try {
      JSON.parse(inputJson);
      setSuccess("✓ Valid JSON");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      const errMsg = (e as Error).message;
      setError("Invalid JSON: " + errMsg);
      setErrorMessage(errMsg);
      setShowFixModal(true);
    }
  };

  const autoFixJSON = () => {
    setShowFixModal(false);
    let fixed = inputJson.trim();
    
    try {
      const lines = fixed.split('\n').filter(line => line.trim());
      
      if (lines.length > 1) {
        const objects = [];
        let currentObj = '';
        let braceCount = 0;
        
        for (const line of lines) {
          currentObj += line + '\n';
          for (const char of line) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
          }
          
          if (braceCount === 0 && currentObj.trim()) {
            try {
              const obj = JSON.parse(currentObj);
              objects.push(obj);
              currentObj = '';
            } catch (e) {
              // Continue
            }
          }
        }
        
        if (objects.length > 0) {
          const formatted = JSON.stringify(objects, null, parseInt(tabSpace));
          setOutputJson(formatted);
          setInputJson(JSON.stringify(objects));
          setSuccess("✓ JSON Auto-Fixed & Beautified!");
          setError("");
          setTimeout(() => setSuccess(""), 3000);
          return;
        }
      }
      
      const parsed = JSON.parse(fixed);
      const formatted = JSON.stringify(parsed, null, parseInt(tabSpace));
      setOutputJson(formatted);
      setSuccess("✓ JSON Formatted Successfully!");
      setError("");
      setTimeout(() => setSuccess(""), 3000);
      
    } catch (e) {
      try {
        fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
        fixed = fixed.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
        fixed = fixed.replace(/'/g, '"');
        
        const parsed = JSON.parse(fixed);
        const formatted = JSON.stringify(parsed, null, parseInt(tabSpace));
        setInputJson(fixed);
        setOutputJson(formatted);
        setSuccess("✓ JSON Auto-Fixed & Beautified!");
        setError("");
        setTimeout(() => setSuccess(""), 3000);
      } catch (finalError) {
        setError("❌ Unable to auto-fix. Please check your JSON manually.");
        setTimeout(() => setError(""), 4000);
      }
    }
  };

  const formatBeautify = () => {
    setError("");
    setSuccess("");
    if (!inputJson.trim()) {
      setError("Please enter JSON data");
      return;
    }
    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, parseInt(tabSpace));
      setOutputJson(formatted);
      setSuccess("✓ JSON Beautified Successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      const errMsg = (e as Error).message;
      setError("Error: " + errMsg);
      setErrorMessage(errMsg);
      setShowFixModal(true);
    }
  };

  const minifyCompact = () => {
    setError("");
    setSuccess("");
    if (!inputJson.trim()) {
      setError("Please enter JSON data");
      return;
    }
    try {
      const parsed = JSON.parse(inputJson);
      const minified = JSON.stringify(parsed);
      setOutputJson(minified);
      setSuccess("✓ JSON Minified Successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      const errMsg = (e as Error).message;
      setError("Error: " + errMsg);
      setErrorMessage(errMsg);
      setShowFixModal(true);
    }
  };

  const copyToClipboard = () => {
    if (!outputJson) return;
    navigator.clipboard.writeText(outputJson);
    setSuccess("✓ Copied to Clipboard");
    setTimeout(() => setSuccess(""), 2000);
  };

  const downloadJson = () => {
    if (!outputJson) return;
    const blob = new Blob([outputJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
    setSuccess("✓ Downloaded");
    setTimeout(() => setSuccess(""), 2000);
  };

  const clearAll = () => {
    setInputJson("");
    setOutputJson("");
    setError("");
    setSuccess("");
  };

  const uploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setInputJson(result);
          setOutputJson("");
        }
      };
      reader.readAsText(file);
    }
  };

  const loadSample = () => {
    const sample = `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "country": "USA"
  },
  "hobbies": ["reading", "coding", "traveling"]
}`;
    setInputJson(sample);
    setOutputJson("");
  };

  const convertToXML = () => {
    setError("");
    setSuccess("");
    if (!inputJson.trim()) {
      setError("Please enter JSON data");
      return;
    }
    try {
      const parsed = JSON.parse(inputJson);
      const xml = jsonToXML(parsed);
      setOutputJson(xml);
      setSuccess("✓ Converted to XML");
      setTimeout(() => setSuccess(""), 3000);
      setShowConvertDropdown(false);
    } catch (e) {
      const errMsg = (e as Error).message;
      setError("Error: " + errMsg);
    }
  };

  const convertToCSV = () => {
    setError("");
    setSuccess("");
    if (!inputJson.trim()) {
      setError("Please enter JSON data");
      return;
    }
    try {
      const parsed = JSON.parse(inputJson);
      const csv = jsonToCSV(parsed);
      setOutputJson(csv);
      setSuccess("✓ Converted to CSV");
      setTimeout(() => setSuccess(""), 3000);
      setShowConvertDropdown(false);
    } catch (e) {
      const errMsg = (e as Error).message;
      setError("Error: " + errMsg);
    }
  };

  const convertToYAML = () => {
    setError("");
    setSuccess("");
    if (!inputJson.trim()) {
      setError("Please enter JSON data");
      return;
    }
    try {
      const parsed = JSON.parse(inputJson);
      const yaml = jsonToYAML(parsed);
      setOutputJson(yaml);
      setSuccess("✓ Converted to YAML");
      setTimeout(() => setSuccess(""), 3000);
      setShowConvertDropdown(false);
    } catch (e) {
      const errMsg = (e as Error).message;
      setError("Error: " + errMsg);
    }
  };

  const jsonToXML = (obj: any, indent = 0) => {
    let xml = "";
    const spaces = "  ".repeat(indent);
    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        xml += `${spaces}<item>\n${jsonToXML(item, indent + 1)}${spaces}</item>\n`;
      });
    } else if (typeof obj === "object" && obj !== null) {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        if (typeof value === "object" && value !== null) {
          xml += `${spaces}<${key}>\n${jsonToXML(value, indent + 1)}${spaces}</${key}>\n`;
        } else {
          xml += `${spaces}<${key}>${value}</${key}>\n`;
        }
      });
    }
    return xml;
  };

  const jsonToCSV = (obj: any) => {
    if (Array.isArray(obj)) {
      if (obj.length === 0) return "";
      const headers = Object.keys(obj[0]);
      let csv = headers.join(",") + "\n";
      obj.forEach((row) => {
        csv += headers.map((header) => {
          const value = row[header];
          return typeof value === "string" ? `"${value}"` : value;
        }).join(",") + "\n";
      });
      return csv;
    } else if (typeof obj === "object") {
      const headers = Object.keys(obj);
      let csv = headers.join(",") + "\n";
      csv += headers.map((key) => {
        const value = obj[key];
        return typeof value === "string" ? `"${value}"` : value;
      }).join(",");
      return csv;
    }
    return String(obj);
  };

  const jsonToYAML = (obj: any, indent = 0) => {
    let yaml = "";
    const spaces = "  ".repeat(indent);
    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        if (typeof item === "object" && item !== null) {
          yaml += `${spaces}-\n${jsonToYAML(item, indent + 1)}`;
        } else {
          yaml += `${spaces}- ${item}\n`;
        }
      });
    } else if (typeof obj === "object" && obj !== null) {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        if (typeof value === "object" && value !== null) {
          yaml += `${spaces}${key}:\n${jsonToYAML(value, indent + 1)}`;
        } else {
          yaml += `${spaces}${key}: ${value}\n`;
        }
      });
    }
    return yaml;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-600">
      {showFixModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
              <h2 className="text-2xl font-bold text-white text-center">❌ JSON Error Detected!</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 text-center mb-6 text-lg">
                Error: <strong>{errorMessage}</strong>
                <br/><br/>
                Kya aap automatically fix karna chahte hain?
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={autoFixJSON}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg transform hover:scale-105 transition-all"
                >
                  ✓ Yes, Fix It!
                </button>
                <button
                  onClick={() => setShowFixModal(false)}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg transform hover:scale-105 transition-all"
                >
                  ✗ No, Thanks
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-[1600px] mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-120px)]">
          <div className="lg:col-span-5 bg-white rounded-lg shadow-xl flex flex-col h-full">
            <div className="bg-slate-700 px-4 py-2 flex items-center gap-2 rounded-t-lg flex-shrink-0">
              <span className="text-white font-bold text-lg mr-2">Input</span>
              <div className="flex items-center gap-2 flex-1">
                <button className="text-white hover:bg-slate-600 p-1 rounded" title="Format">≡</button>
                <button className="text-white hover:bg-slate-600 p-1 rounded" title="Align">☰</button>
                <button className="text-white hover:bg-slate-600 p-1 rounded" title="Sort">⇅</button>
              </div>
              <button onClick={loadSample} className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded text-sm font-semibold">
                Sample
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <textarea
                value={inputJson}
                onChange={handleInputChange}
                className="w-full h-full p-4 font-mono text-sm focus:outline-none resize-none bg-gray-50"
                placeholder="Paste your JSON here..."
              />
            </div>
            <div className="px-4 py-2 bg-gray-100 text-xs text-gray-600 flex-shrink-0">
              Ln: 1 Col: 1
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-3 h-full">
            <div className="bg-teal-500 rounded-lg shadow-xl flex flex-col gap-3 p-4 flex-1">
              <div className="relative">
                <button className="w-full bg-white hover:bg-gray-100 text-teal-700 py-3 px-4 rounded-lg font-bold text-sm border-2 border-teal-300">
                  Upload Data
                </button>
                <input type="file" accept=".json" onChange={uploadFile} className="absolute inset-0 opacity-0 cursor-pointer"/>
              </div>

              <button onClick={validateJson} className="bg-white hover:bg-gray-100 text-teal-700 py-3 px-4 rounded-lg font-bold text-sm border-2 border-teal-300">
                Validate
              </button>

              <select value={tabSpace} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTabSpace(e.target.value)} className="bg-white text-teal-700 py-3 px-4 rounded-lg font-bold text-sm border-2 border-teal-300">
                <option value="2">2 Tab Space</option>
                <option value="4">4 Tab Space</option>
              </select>

              <button onClick={formatBeautify} className="bg-white hover:bg-gray-100 text-teal-700 py-3 px-4 rounded-lg font-bold text-sm border-2 border-teal-300">
                Format / Beautify
              </button>

              <button onClick={minifyCompact} className="bg-white hover:bg-gray-100 text-teal-700 py-3 px-4 rounded-lg font-bold text-sm border-2 border-teal-300">
                Minify / Compact
              </button>

              <div className="relative">
                <button onClick={() => setShowConvertDropdown(!showConvertDropdown)} className="w-full bg-white hover:bg-gray-100 text-teal-700 py-3 px-4 rounded-lg font-bold text-sm border-2 border-teal-300">
                  Convert JSON to-
                </button>

                {showConvertDropdown && (
                  <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border-2 border-teal-300 overflow-hidden z-10">
                    <button onClick={convertToXML} className="w-full text-left px-4 py-3 hover:bg-teal-50 text-gray-800 font-semibold text-sm border-b border-gray-200">
                      JSON to XML
                    </button>
                    <button onClick={convertToCSV} className="w-full text-left px-4 py-3 hover:bg-teal-50 text-gray-800 font-semibold text-sm border-b border-gray-200">
                      JSON to CSV
                    </button>
                    <button onClick={convertToYAML} className="w-full text-left px-4 py-3 hover:bg-teal-50 text-gray-800 font-semibold text-sm">
                      JSON to YAML
                    </button>
                  </div>
                )}
              </div>

              <button onClick={downloadJson} disabled={!outputJson} className="bg-white hover:bg-gray-100 text-teal-700 py-3 px-4 rounded-lg font-bold text-sm border-2 border-teal-300 disabled:opacity-50">
                Download
              </button>

              <div className="mt-auto pt-4 border-t-2 border-white/30">
                <div className="text-center text-white">
                  <p className="font-bold text-sm mb-1">JSON Full Form</p>
                  <p className="text-xs">JavaScript Object Notation</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-100 border-2 border-red-400 text-red-700 px-3 py-2 rounded-lg text-xs">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border-2 border-green-400 text-green-700 px-3 py-2 rounded-lg text-xs">
                  {success}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-lg shadow-xl flex flex-col h-full">
            <div className="bg-slate-700 px-4 py-2 flex items-center gap-2 rounded-t-lg flex-shrink-0">
              <span className="text-white font-bold text-lg mr-2">Output</span>
              <div className="flex items-center gap-2 flex-1">
                <button className="text-white hover:bg-slate-600 p-1 rounded">≡</button>
                <button className="text-white hover:bg-slate-600 p-1 rounded">☰</button>
              </div>
              <button onClick={copyToClipboard} disabled={!outputJson} className="text-white hover:bg-slate-600 p-1 rounded disabled:opacity-50" title="Copy">
                📋
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <textarea
                value={outputJson}
                readOnly
                className="w-full h-full p-4 font-mono text-sm bg-gray-50 resize-none focus:outline-none"
                placeholder="Output will appear here..."
              />
            </div>
            <div className="px-4 py-2 bg-gray-100 text-xs text-gray-600 flex-shrink-0">
              Ln: 1 Col: 1
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-4 justify-center">
          <button onClick={clearAll} className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-lg font-bold text-sm shadow-lg">
            Clear All
          </button>
        </div>
      </main>
    </div>
  );
}

export { JsonFormatterTool };
export default JsonFormatterTool;