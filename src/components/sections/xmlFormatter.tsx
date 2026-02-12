"use client"
import React, { useState, useRef } from 'react';

export function XmlFormatterPage() {
  const [inputXml, setInputXml] = useState('');
  const [outputXml, setOutputXml] = useState('');
  const [tabSpace, setTabSpace] = useState('2');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

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
      setError('Please enter XML data');
      return;
    }
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(inputXml, 'text/xml');
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      
      if (parseError.length > 0) {
        setError('Invalid XML: ' + parseError[0].textContent);
      } else {
        setSuccess('✓ Valid XML');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (e: unknown) {
      setError('Error: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const formatBeautify = () => {
    setError('');
    setSuccess('');
    if (!inputXml.trim()) {
      setError('Please enter XML data');
      return;
    }
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(inputXml, 'text/xml');
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      
      if (parseError.length > 0) {
        setError('Invalid XML');
        return;
      }
      
      const formatted = formatXml(inputXml, parseInt(tabSpace));
      setOutputXml(formatted);
      setSuccess('✓ XML Formatted Successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: unknown) {
      setError('Error: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const formatXml = (xml: string, spaces: number) => {
    const PADDING = ' '.repeat(spaces);
    const reg = /(>)(<)(\/*)/g;
    let pad = 0;
    
    xml = xml.replace(reg, '$1\n$2$3');
    
    return xml.split('\n').map((node) => {
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
    }).join('\n');
  };

  const minifyCompact = () => {
    setError('');
    setSuccess('');
    if (!inputXml.trim()) {
      setError('Please enter XML data');
      return;
    }
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(inputXml, 'text/xml');
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      
      if (parseError.length > 0) {
        setError('Invalid XML');
        return;
      }
      
      const minified = inputXml.replace(/>\s+</g, '><').trim();
      setOutputXml(minified);
      setSuccess('✓ XML Minified Successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: unknown) {
      setError('Error: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const xmlToJson = () => {
    setError('');
    setSuccess('');
    if (!inputXml.trim()) {
      setError('Please enter XML data');
      return;
    }
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(inputXml, 'text/xml');
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      
      if (parseError.length > 0) {
        setError('Invalid XML');
        return;
      }
      
      const json = xmlToJsonConverter(xmlDoc.documentElement);
      setOutputXml(JSON.stringify(json, null, 2));
      setSuccess('✓ Converted to JSON');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: unknown) {
      setError('Error: ' + (e instanceof Error ? e.message : String(e)));
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
      setError('Please enter XML data');
      return;
    }
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(inputXml, 'text/xml');
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      
      if (parseError.length > 0) {
        setError('Invalid XML');
        return;
      }
      
      const tree = buildXmlTree(xmlDoc.documentElement, 0);
      setOutputXml(tree);
      setSuccess('✓ XML Tree Generated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: unknown) {
      setError('Error: ' + (e instanceof Error ? e.message : String(e)));
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
    setSuccess('✓ Copied to Clipboard');
    setTimeout(() => setSuccess(''), 2000);
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
    setSuccess('✓ Downloaded');
    setTimeout(() => setSuccess(''), 2000);
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
          setSuccess('✓ File Loaded Successfully');
          setTimeout(() => setSuccess(''), 2000);
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
    setSuccess('✓ Sample Loaded');
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-600">
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
                value={inputXml}
                onChange={handleInputChange}
                className="w-full h-full p-4 font-mono text-sm focus:outline-none resize-none bg-gray-50"
                placeholder="Paste your XML here..."
              />
            </div>
            <div className="px-4 py-2 bg-gray-100 text-xs text-gray-600 flex-shrink-0">
              Ln: 1 Col: 1
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-3 h-full">
            <div className="bg-teal-500 rounded-lg shadow-xl flex flex-col gap-3 p-4 flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xml"
                onChange={uploadFile}
                className="hidden"
              />
              <button
                onClick={() => (fileInputRef.current as any)?.click()}
                className="bg-white hover:bg-gray-100 text-teal-700 py-3 px-4 rounded-lg font-bold text-sm border-2 border-teal-300"
              >
                Upload Data
              </button>

              <select
                value={tabSpace}
                onChange={(e) => setTabSpace(e.target.value)}
                className="bg-white text-teal-700 py-3 px-4 rounded-lg font-bold text-sm border-2 border-teal-300"
              >
                <option value="2">2 Tab Space</option>
                <option value="4">4 Tab Space</option>
              </select>

              <button
                onClick={validateXml}
                className="bg-white hover:bg-gray-100 text-teal-700 py-3 px-4 rounded-lg font-bold text-sm border-2 border-teal-300"
              >
                Validate
              </button>

              <button
                onClick={formatBeautify}
                className="bg-white hover:bg-gray-100 text-teal-700 py-3 px-4 rounded-lg font-bold text-sm border-2 border-teal-300"
              >
                Format / Beautify
              </button>

              <button
                onClick={showXmlTree}
                className="bg-white hover:bg-gray-100 text-teal-700 py-3 px-4 rounded-lg font-bold text-sm border-2 border-teal-300"
              >
                XML Tree
              </button>

              <button
                onClick={minifyCompact}
                className="bg-white hover:bg-gray-100 text-teal-700 py-3 px-4 rounded-lg font-bold text-sm border-2 border-teal-300"
              >
                Minify / Compact
              </button>

              <button
                onClick={xmlToJson}
                className="bg-white hover:bg-gray-100 text-teal-700 py-3 px-4 rounded-lg font-bold text-sm border-2 border-teal-300"
              >
                XML to JSON
              </button>

              <button
                onClick={downloadXml}
                disabled={!outputXml}
                className="bg-white hover:bg-gray-100 text-teal-700 py-3 px-4 rounded-lg font-bold text-sm border-2 border-teal-300 disabled:opacity-50"
              >
                Download
              </button>

              <div className="mt-auto pt-4 border-t-2 border-white/30">
                <div className="text-center text-white">
                  <p className="font-bold text-sm mb-1">XML Full Form</p>
                  <p className="text-xs">Extensible Markup Language</p>
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
              <button onClick={copyToClipboard} disabled={!outputXml} className="text-white hover:bg-slate-600 p-1 rounded disabled:opacity-50" title="Copy">
                📋
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <textarea
                value={outputXml}
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
