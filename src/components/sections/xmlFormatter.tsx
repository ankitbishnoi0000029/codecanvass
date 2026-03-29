'use client';
import { getNavbar } from '@/actions/dbAction';
import { dataType } from '@/utils/types/uiTypes';
import React, { useState, useRef, useEffect } from 'react';
import Meta from './meta';

export function XmlFormatterPage() {
  const [inputXml, setInputXml] = useState('');
  const [outputXml, setOutputXml] = useState('');
  const [tabSpace, setTabSpace] = useState('2');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [list, setList] = useState<dataType[]>([]);

  const fetchData = async () => {
    try {
      const response = await getNavbar('xml');
      setList(response);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toast helpers
  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(''), 3000);
    } else {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputXml(e.target.value);
    setOutputXml('');
    setError('');
    setSuccess('');
  };

  const validateXml = () => {
    setError('');
    setSuccess('');
    if (!inputXml.trim()) {
      showToast('Please enter XML data', true);
      return;
    }
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(inputXml, 'text/xml');
      const parseError = xmlDoc.getElementsByTagName('parsererror');

      if (parseError.length > 0) {
        showToast('Invalid XML: ' + parseError[0].textContent, true);
      } else {
        showToast('✓ Valid XML');
      }
    } catch (e: unknown) {
      showToast('Error: ' + (e instanceof Error ? e.message : String(e)), true);
    }
  };

  const formatBeautify = () => {
    setError('');
    setSuccess('');
    if (!inputXml.trim()) {
      showToast('Please enter XML data', true);
      return;
    }
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(inputXml, 'text/xml');
      const parseError = xmlDoc.getElementsByTagName('parsererror');

      if (parseError.length > 0) {
        showToast('Invalid XML', true);
        return;
      }

      const formatted = formatXml(inputXml, parseInt(tabSpace));
      setOutputXml(formatted);
      showToast('✓ XML Formatted Successfully');
    } catch (e: unknown) {
      showToast('Error: ' + (e instanceof Error ? e.message : String(e)), true);
    }
  };

  const formatXml = (xml: string, spaces: number) => {
    const PADDING = ' '.repeat(spaces);
    const reg = /(>)(<)(\/*)/g;
    let pad = 0;

    xml = xml.replace(reg, '$1\n$2$3');

    return xml
      .split('\n')
      .map((node) => {
        let indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
          indent = 0;
        } else if (node.match(/^<\/\w/)) {
          if (pad !== 0) {
            pad -= 1;
          }
        } else if (node.match(/^<\w([^>]*[^\/])?>.*$/)) {
          indent = 1;
        } else {
          indent = 0;
        }

        const padding = PADDING.repeat(pad);
        pad += indent;

        return padding + node;
      })
      .join('\n');
  };

  const minifyCompact = () => {
    setError('');
    setSuccess('');
    if (!inputXml.trim()) {
      showToast('Please enter XML data', true);
      return;
    }
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(inputXml, 'text/xml');
      const parseError = xmlDoc.getElementsByTagName('parsererror');

      if (parseError.length > 0) {
        showToast('Invalid XML', true);
        return;
      }

      const minified = inputXml.replace(/>\s+</g, '><').trim();
      setOutputXml(minified);
      showToast('✓ XML Minified Successfully');
    } catch (e: unknown) {
      showToast('Error: ' + (e instanceof Error ? e.message : String(e)), true);
    }
  };

  const xmlToJson = () => {
    setError('');
    setSuccess('');
    if (!inputXml.trim()) {
      showToast('Please enter XML data', true);
      return;
    }
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(inputXml, 'text/xml');
      const parseError = xmlDoc.getElementsByTagName('parsererror');

      if (parseError.length > 0) {
        showToast('Invalid XML', true);
        return;
      }

      const json = xmlToJsonConverter(xmlDoc.documentElement);
      setOutputXml(JSON.stringify(json, null, 2));
      showToast('✓ Converted to JSON');
    } catch (e: unknown) {
      showToast('Error: ' + (e instanceof Error ? e.message : String(e)), true);
    }
  };

  const xmlToJsonConverter = (xml: Element): Record<string, any> | string | null => {
    if (xml.nodeType === 3) {
      return xml.nodeValue;
    }

    const result: Record<string, any> = {};

    if (xml.nodeType === 1) {
      if (xml.attributes && xml.attributes.length > 0) {
        result['@attributes'] = {};
        for (let j = 0; j < xml.attributes.length; j++) {
          const attribute = xml.attributes.item(j);
          if (attribute) {
            result['@attributes'][attribute.nodeName] = attribute.nodeValue;
          }
        }
      }
    }

    if (xml.hasChildNodes()) {
      for (let i = 0; i < xml.childNodes.length; i++) {
        const item = xml.childNodes.item(i);
        if (!item) continue;

        if (item.nodeType === 1) {
          const tagName = item.nodeName;
          const converted = xmlToJsonConverter(item as Element);

          if (typeof result[tagName] === 'undefined') {
            result[tagName] = converted;
          } else {
            if (!Array.isArray(result[tagName])) {
              const old = result[tagName];
              result[tagName] = [old];
            }
            result[tagName].push(converted);
          }
        } else if (item.nodeType === 3 && item.nodeValue && item.nodeValue.trim()) {
          return item.nodeValue.trim();
        }
      }
    }
    return result;
  };

  const showXmlTree = () => {
    setError('');
    setSuccess('');
    if (!inputXml.trim()) {
      showToast('Please enter XML data', true);
      return;
    }
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(inputXml, 'text/xml');
      const parseError = xmlDoc.getElementsByTagName('parsererror');

      if (parseError.length > 0) {
        showToast('Invalid XML', true);
        return;
      }

      const tree = buildXmlTree(xmlDoc.documentElement, 0);
      setOutputXml(tree);
      showToast('✓ XML Tree Generated');
    } catch (e: unknown) {
      showToast('Error: ' + (e instanceof Error ? e.message : String(e)), true);
    }
  };

  const buildXmlTree = (node: Element, level: number): string => {
    const indent = '  '.repeat(level);
    let tree = '';

    if (node.nodeType === 1) {
      tree += `${indent}├─ <${node.nodeName}>\n`;
      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        if (child.nodeType === 1) {
          tree += buildXmlTree(child as Element, level + 1);
        } else if (child.nodeType === 3 && child.nodeValue && child.nodeValue.trim()) {
          tree += `${indent}  └─ "${child.nodeValue.trim()}"\n`;
        }
      }
    }

    return tree;
  };

  const copyToClipboard = () => {
    if (!outputXml) return;
    navigator.clipboard.writeText(outputXml);
    showToast('✓ Copied to Clipboard');
  };

  const downloadXml = () => {
    if (!outputXml) return;
    const blob = new Blob([outputXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.xml';
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ Downloaded');
  };

  const clearAll = () => {
    setInputXml('');
    setOutputXml('');
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
          setInputXml(result);
          setOutputXml('');
          showToast('✓ File Loaded Successfully');
        }
      };
      reader.readAsText(file);
    }
  };

  const loadSample = () => {
    const sample = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="cooking">
    <title lang="en">Everyday Italian</title>
    <author>Giada De Laurentiis</author>
    <year>2005</year>
    <price>30.00</price>
  </book>
  <book category="children">
    <title lang="en">Harry Potter</title>
    <author>J K. Rowling</author>
    <year>2005</year>
    <price>29.99</price>
  </book>
</bookstore>`;
    setInputXml(sample);
    setOutputXml('');
    showToast('✓ Sample Loaded');
  };

  // Parse FAQ data if available
  let faqItems: { question: string; answer: string }[] = [];
  if (list && list.length > 0 && list[0]?.FAQ) {
    try {
      faqItems = JSON.parse(list[0].FAQ);
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

      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-4xl font-bold text-center text-white my-2 drop-shadow-lg">
          XML Formatter & Converter
        </h1>
        <p className="text-center text-white/90 mb-2 text-lg max-w-2xl mx-auto">
          Instantly format, validate, and convert your XML data with ease!
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
                value={inputXml}
                onChange={handleInputChange}
                className="w-full h-full p-4 font-mono text-sm bg-white/90 focus:outline-none resize-none text-gray-800 rounded-b-2xl"
                placeholder="Paste your XML here..."
              />
            </div>
          </div>

          {/* Actions Panel */}
          <div className="lg:col-span-2 flex flex-col gap-3 h-full">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col gap-3 p-4 flex-1 border border-white/20">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xml"
                onChange={uploadFile}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all"
              >
                📁 Upload Data
              </button>

              <select
                value={tabSpace}
                onChange={(e) => setTabSpace(e.target.value)}
                className="bg-white/20 text-white py-3 px-4 rounded-xl font-semibold text-sm border-none focus:ring-0"
              >
                <option value="2" className="text-gray-800">
                  2 Spaces
                </option>
                <option value="4" className="text-gray-800">
                  4 Spaces
                </option>
              </select>

              <button
                onClick={validateXml}
                className="bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all"
              >
                ✅ Validate
              </button>

              <button
                onClick={formatBeautify}
                className="bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all"
              >
                ✨ Format / Beautify
              </button>

              <button
                onClick={showXmlTree}
                className="bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all"
              >
                🌳 XML Tree
              </button>

              <button
                onClick={minifyCompact}
                className="bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all"
              >
                🔽 Minify / Compact
              </button>

              <button
                onClick={xmlToJson}
                className="bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all"
              >
                🔄 XML to JSON
              </button>

              <button
                onClick={downloadXml}
                disabled={!outputXml}
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
                  <p className="font-bold text-sm mb-1">XML Full Form</p>
                  <p className="text-xs">Extensible Markup Language</p>
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
                disabled={!outputXml}
                className="text-white hover:bg-white/30 p-2 rounded-lg transition-all disabled:opacity-50"
                title="Copy"
              >
                📋
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <textarea
                value={outputXml}
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
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <h3 className="text-xl font-semibold text-white mb-3 flex items-start gap-2">
                    <span className="text-indigo-300">Q{index + 1}.</span>
                    {item.question}
                  </h3>
                  <p className="text-white/80 leading-relaxed">{item.answer}</p>
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
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          10% {
            opacity: 1;
            transform: translateY(0);
          }
          90% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px);
          }
        }
        .animate-fade-in-out {
          animation: fadeInOut 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
