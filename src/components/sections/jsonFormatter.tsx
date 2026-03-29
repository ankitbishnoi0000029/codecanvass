'use client';
import { getMeta, getNavbar } from '@/actions/dbAction';
import { dataType } from '@/utils/types/uiTypes';
import React, { useEffect, useState } from 'react';
import Meta from './meta';

function JsonFormatterTool() {
  const [inputJson, setInputJson] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [tabSpace, setTabSpace] = useState('2');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConvertDropdown, setShowConvertDropdown] = useState(false);
  const [showFixModal, setShowFixModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [list, setList] = useState<dataType | null>(null);

  const fetchData = async () => {
    try {
      const response = await getNavbar('json');
      setList(response);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Clear output when input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputJson(e.target.value);
    setOutputJson('');
    setError('');
    setSuccess('');
  };

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(''), 3000);
    } else {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const validateJson = () => {
    setError('');
    setSuccess('');
    if (!inputJson.trim()) {
      showToast('Please enter JSON data', true);
      return;
    }
    try {
      JSON.parse(inputJson);
      showToast('✓ Valid JSON');
    } catch (e) {
      const errMsg = (e as Error).message;
      showToast('Invalid JSON: ' + errMsg, true);
      setErrorMessage(errMsg);
      setShowFixModal(true);
    }
  };

  const autoFixJSON = () => {
    setShowFixModal(false);
    let fixed = inputJson.trim();

    try {
      const lines = fixed.split('\n').filter((line) => line.trim());

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
          showToast('✓ JSON Auto-Fixed & Beautified!');
          return;
        }
      }

      const parsed = JSON.parse(fixed);
      const formatted = JSON.stringify(parsed, null, parseInt(tabSpace));
      setOutputJson(formatted);
      showToast('✓ JSON Formatted Successfully!');
    } catch (e) {
      try {
        fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
        fixed = fixed.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
        fixed = fixed.replace(/'/g, '"');

        const parsed = JSON.parse(fixed);
        const formatted = JSON.stringify(parsed, null, parseInt(tabSpace));
        setInputJson(fixed);
        setOutputJson(formatted);
        showToast('✓ JSON Auto-Fixed & Beautified!');
      } catch (finalError) {
        showToast('❌ Unable to auto-fix. Please check your JSON manually.', true);
      }
    }
  };

  const formatBeautify = () => {
    setError('');
    setSuccess('');
    if (!inputJson.trim()) {
      showToast('Please enter JSON data', true);
      return;
    }
    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, parseInt(tabSpace));
      setOutputJson(formatted);
      showToast('✓ JSON Beautified Successfully');
    } catch (e) {
      const errMsg = (e as Error).message;
      showToast('Error: ' + errMsg, true);
      setErrorMessage(errMsg);
      setShowFixModal(true);
    }
  };

  const minifyCompact = () => {
    setError('');
    setSuccess('');
    if (!inputJson.trim()) {
      showToast('Please enter JSON data', true);
      return;
    }
    try {
      const parsed = JSON.parse(inputJson);
      const minified = JSON.stringify(parsed);
      setOutputJson(minified);
      showToast('✓ JSON Minified Successfully');
    } catch (e) {
      const errMsg = (e as Error).message;
      showToast('Error: ' + errMsg, true);
      setErrorMessage(errMsg);
      setShowFixModal(true);
    }
  };

  const copyToClipboard = () => {
    if (!outputJson) return;
    navigator.clipboard.writeText(outputJson);
    showToast('✓ Copied to Clipboard');
  };

  const downloadJson = () => {
    if (!outputJson) return;
    const blob = new Blob([outputJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ Downloaded');
  };

  const clearAll = () => {
    setInputJson('');
    setOutputJson('');
    setError('');
    setSuccess('');
  };

  const uploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setInputJson(result);
          setOutputJson('');
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
    setOutputJson('');
  };

  const convertToXML = () => {
    setError('');
    setSuccess('');
    if (!inputJson.trim()) {
      showToast('Please enter JSON data', true);
      return;
    }
    try {
      const parsed = JSON.parse(inputJson);
      const xml = jsonToXML(parsed);
      setOutputJson(xml);
      showToast('✓ Converted to XML');
      setShowConvertDropdown(false);
    } catch (e) {
      const errMsg = (e as Error).message;
      showToast('Error: ' + errMsg, true);
    }
  };

  const convertToCSV = () => {
    setError('');
    setSuccess('');
    if (!inputJson.trim()) {
      showToast('Please enter JSON data', true);
      return;
    }
    try {
      const parsed = JSON.parse(inputJson);
      const csv = jsonToCSV(parsed);
      setOutputJson(csv);
      showToast('✓ Converted to CSV');
      setShowConvertDropdown(false);
    } catch (e) {
      const errMsg = (e as Error).message;
      showToast('Error: ' + errMsg, true);
    }
  };

  const convertToYAML = () => {
    setError('');
    setSuccess('');
    if (!inputJson.trim()) {
      showToast('Please enter JSON data', true);
      return;
    }
    try {
      const parsed = JSON.parse(inputJson);
      const yaml = jsonToYAML(parsed);
      setOutputJson(yaml);
      showToast('✓ Converted to YAML');
      setShowConvertDropdown(false);
    } catch (e) {
      const errMsg = (e as Error).message;
      showToast('Error: ' + errMsg, true);
    }
  };

  const jsonToXML = (obj: any, indent = 0) => {
    let xml = '';
    const spaces = '  '.repeat(indent);
    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        xml += `${spaces}<item>\n${jsonToXML(item, indent + 1)}${spaces}</item>\n`;
      });
    } else if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        if (typeof value === 'object' && value !== null) {
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
      if (obj.length === 0) return '';
      const headers = Object.keys(obj[0]);
      let csv = headers.join(',') + '\n';
      obj.forEach((row) => {
        csv +=
          headers
            .map((header) => {
              const value = row[header];
              return typeof value === 'string' ? `"${value}"` : value;
            })
            .join(',') + '\n';
      });
      return csv;
    } else if (typeof obj === 'object') {
      const headers = Object.keys(obj);
      let csv = headers.join(',') + '\n';
      csv += headers
        .map((key) => {
          const value = obj[key];
          return typeof value === 'string' ? `"${value}"` : value;
        })
        .join(',');
      return csv;
    }
    return String(obj);
  };

  const jsonToYAML = (obj: any, indent = 0) => {
    let yaml = '';
    const spaces = '  '.repeat(indent);
    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        if (typeof item === 'object' && item !== null) {
          yaml += `${spaces}-\n${jsonToYAML(item, indent + 1)}`;
        } else {
          yaml += `${spaces}- ${item}\n`;
        }
      });
    } else if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        if (typeof value === 'object' && value !== null) {
          yaml += `${spaces}${key}:\n${jsonToYAML(value, indent + 1)}`;
        } else {
          yaml += `${spaces}${key}: ${value}\n`;
        }
      });
    }
    return yaml;
  };

  // Parse FAQ data if available
  let faqItems: { question: string; answer: string }[] = [];
  if (list?.FAQ) {
    try {
      faqItems = JSON.parse(list.FAQ);
    } catch (e) {
      console.error('Failed to parse FAQ', e);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      {/* Toast notifications */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
          {error}
        </div>
      )}
      {success && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
          {success}
        </div>
      )}

      {/* Auto-fix Modal */}
      {showFixModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
              <h2 className="text-2xl font-bold text-white text-center">❌ JSON Error Detected!</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 text-center mb-6 text-lg">
                Error: <strong>{errorMessage}</strong>
                <br />
                <br />
                Do you want to automatically fix it?
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

      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-5xl font-bold text-center text-white my-2 drop-shadow-lg">
          JSON Formatter & Converter
        </h1>
        <p className="text-center text-white/90 mb-2 text-lg max-w-2xl mx-auto">
          Instantly format, validate, and convert your JSON data with ease!
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Input Panel */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col h-full border border-white/20">
            <div className="bg-white/20 px-4 py-3 flex items-center justify-between rounded-t-2xl">
              <span className="text-white font-bold text-lg">Input</span>
              <button
                onClick={loadSample}
                className="bg-white/30 hover:bg-white/40 text-white px-3 py-1 rounded-lg text-sm font-semibold transition-all"
              >
                📝 Sample
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <textarea
                value={inputJson}
                onChange={handleInputChange}
                className="w-full h-full p-4 font-mono text-sm bg-white/90 focus:outline-none resize-none text-gray-800 rounded-b-2xl"
                placeholder="Paste your JSON here..."
              />
            </div>
          </div>

          {/* Actions Panel */}
          <div className="lg:col-span-2 flex flex-col gap-3 h-full">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col gap-3 p-4 flex-1 border border-white/20">
              <div className="relative">
                <button className="w-full bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all">
                  📁 Upload Data
                </button>
                <input
                  type="file"
                  accept=".json"
                  onChange={uploadFile}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              <button
                onClick={validateJson}
                className="bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all"
              >
                ✅ Validate
              </button>

              <select
                value={tabSpace}
                onChange={(e) => setTabSpace(e.target.value)}
                className="bg-white/20 text-white py-3 px-4 rounded-xl font-semibold text-sm border-none focus:ring-0"
              >
                <option value="2" className="text-gray-800">2 Spaces</option>
                <option value="4" className="text-gray-800">4 Spaces</option>
              </select>

              <button
                onClick={formatBeautify}
                className="bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all"
              >
                ✨ Format / Beautify
              </button>

              <button
                onClick={minifyCompact}
                className="bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all"
              >
                🔽 Minify / Compact
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowConvertDropdown(!showConvertDropdown)}
                  className="w-full bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all"
                >
                  🔄 Convert JSON to-
                </button>

                {showConvertDropdown && (
                  <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-10">
                    <button
                      onClick={convertToXML}
                      className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-gray-800 font-semibold text-sm transition-all"
                    >
                      📄 JSON to XML
                    </button>
                    <button
                      onClick={convertToCSV}
                      className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-gray-800 font-semibold text-sm transition-all"
                    >
                      📊 JSON to CSV
                    </button>
                    <button
                      onClick={convertToYAML}
                      className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-gray-800 font-semibold text-sm transition-all"
                    >
                      📝 JSON to YAML
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={downloadJson}
                disabled={!outputJson}
                className="bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
              >
                💾 Download
              </button>
               <button
            onClick={clearAll}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-xl font-bold text-sm shadow-lg transition-all"
          >
            🗑️ Clear All
          </button>

              <div className="mt-auto pt-4 border-t border-white/30">
                <div className="text-center text-white/80">
                  <p className="font-bold text-sm mb-1">JSON Full Form</p>
                  <p className="text-xs">JavaScript Object Notation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col h-full border border-white/20">
            <div className="bg-white/20 px-4 py-3 flex items-center justify-between rounded-t-2xl">
              <span className="text-white font-bold text-lg">Output</span>
              <button
                onClick={copyToClipboard}
                disabled={!outputJson}
                className="text-white hover:bg-white/30 p-2 rounded-lg transition-all disabled:opacity-50"
                title="Copy"
              >
                📋
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <textarea
                value={outputJson}
                readOnly
                className="w-full h-full p-4 font-mono text-sm bg-white/90 focus:outline-none resize-none text-gray-800 rounded-b-2xl"
                placeholder="Output will appear here..."
              />
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        {faqItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <h3 className="text-sm font-semibold text-red-600 bg-white px-2 py-1 rounded-xl mb-3 flex items-start gap-2 ">
                    <span className="text-indigo-300">Q{index + 1}.</span>
                    {item.question}
                  </h3>
                  <p className="text-emerald-700 bg-stone-50 px-2 py-1 rounded-xl font-bold leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meta Information */}
        <div className="mt-8 text-center text-white/60 text-sm">
          <Meta selectedData={list} />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-20px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        .animate-fade-in-out {
          animation: fadeInOut 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}

export { JsonFormatterTool };
export default JsonFormatterTool;
