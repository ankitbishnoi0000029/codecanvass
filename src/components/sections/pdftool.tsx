 // @ts-nocheck
"use client"
import React, { useState } from 'react';
import { FileText, Image, Lock, Droplets, RotateCw, Scissors, FileStack, FileDown, FileType, Code, Shield, FileCheck, Eye, Crop, Sparkles, Edit } from 'lucide-react';

export default function ILovePDF() {
  const [selectedTool, setSelectedTool] = useState(null);
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);

  const allTools = [
    { id: 'merge', name: 'Merge PDF', icon: FileStack, desc: 'Combine PDF files', color: 'bg-red-500' },
    { id: 'split', name: 'Split PDF', icon: Scissors, desc: 'Separate one page or a whole set', color: 'bg-orange-500' },
    { id: 'compress', name: 'Compress PDF', icon: FileDown, desc: 'Reduce file size while optimizing', color: 'bg-yellow-500' },
    { id: 'pdf-to-word', name: 'PDF to Word', icon: FileType, desc: 'Easily convert PDF to DOC/DOCX', color: 'bg-blue-500' },
    { id: 'pdf-to-powerpoint', name: 'PDF to PowerPoint', icon: FileType, desc: 'Turn your PDF into PPT', color: 'bg-orange-600' },
    { id: 'pdf-to-excel', name: 'PDF to Excel', icon: FileType, desc: 'Pull data from PDF to Excel', color: 'bg-green-600' },
    { id: 'word-to-pdf', name: 'Word to PDF', icon: FileType, desc: 'Convert Word documents to PDF', color: 'bg-blue-600' },
    { id: 'powerpoint-to-pdf', name: 'PowerPoint to PDF', icon: FileType, desc: 'Convert PPT to PDF', color: 'bg-red-600' },
    { id: 'excel-to-pdf', name: 'Excel to PDF', icon: FileType, desc: 'Convert Excel to PDF', color: 'bg-green-500' },
    { id: 'pdf-to-jpg', name: 'PDF to JPG', icon: Image, desc: 'Convert each PDF page into a JPG', color: 'bg-purple-500' },
    { id: 'jpg-to-pdf', name: 'JPG to PDF', icon: Image, desc: 'Convert JPG images to PDF', color: 'bg-purple-600' },
    { id: 'sign-pdf', name: 'Sign PDF', icon: Edit, desc: 'Sign your PDF files online', color: 'bg-indigo-500' },
    { id: 'watermark', name: 'Watermark', icon: Droplets, desc: 'Add watermark to PDF files', color: 'bg-cyan-500' },
    { id: 'rotate', name: 'Rotate PDF', icon: RotateCw, desc: 'Rotate your PDFs the way you need', color: 'bg-teal-500' },
    { id: 'unlock', name: 'Unlock PDF', icon: Lock, desc: 'Remove PDF password security', color: 'bg-gray-500' },
    { id: 'protect', name: 'Protect PDF', icon: Shield, desc: 'Protect PDF with password', color: 'bg-red-700' },
    { id: 'organize', name: 'Organize PDF', icon: FileCheck, desc: 'Sort pages of your PDF file', color: 'bg-pink-500' },
    { id: 'edit', name: 'Edit PDF', icon: Edit, desc: 'Add text, images or shapes', color: 'bg-blue-700' },
    { id: 'page-numbers', name: 'Page Numbers', icon: FileText, desc: 'Add page numbers to PDF', color: 'bg-indigo-600' },
    { id: 'html-to-pdf', name: 'HTML to PDF', icon: Code, desc: 'Convert webpages to PDF', color: 'bg-green-700' },
    { id: 'repair', name: 'Repair PDF', icon: Sparkles, desc: 'Repair a damaged PDF', color: 'bg-yellow-600' },
    { id: 'compare', name: 'Compare PDF', icon: Eye, desc: 'Compare two PDF files', color: 'bg-gray-600' },
    { id: 'crop', name: 'Crop PDF', icon: Crop, desc: 'Crop margins of PDF documents', color: 'bg-lime-500' },
    { id: 'pdf-to-pdfa', name: 'PDF to PDF/A', icon: FileCheck, desc: 'ISO-standardized PDF', color: 'bg-emerald-600' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files);
    setFiles([...files, ...newFiles]);
  };

  const selectTool = (tool) => {
    setSelectedTool(tool);
    setFiles([]);
  };

  const processFiles = () => {
    if (files.length === 0) {
      alert('Please select files first');
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      alert(`✅ Files processed with ${selectedTool.name}!\n\n⚠️ Note: This is a demo interface. Real PDF processing requires backend server with PDF libraries.`);
      setProcessing(false);
    }, 2000);
  };

  if (selectedTool) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 
                onClick={() => setSelectedTool(null)}
                className="text-2xl font-bold text-red-600 cursor-pointer hover:text-red-700"
              >
                iLovePDF
              </h1>
              <nav className="hidden md:flex gap-6">
                <button className="text-gray-600 hover:text-gray-900 font-medium">All PDF tools</button>
                <button className="text-gray-600 hover:text-gray-900 font-medium">Features</button>
                <button className="text-gray-600 hover:text-gray-900 font-medium">Pricing</button>
              </nav>
            </div>
            <div className="flex gap-3">
              <button className="text-gray-700 hover:text-gray-900 font-medium px-4 py-2">
                Log in
              </button>
              <button className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 font-medium">
                Sign up
              </button>
            </div>
          </div>
        </header>

        {/* Tool Page */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <button
            onClick={() => setSelectedTool(null)}
            className="text-red-600 hover:text-red-700 font-medium mb-6"
          >
            ← All tools
          </button>

          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 ${selectedTool.color} text-white rounded-2xl mb-4`}>
              <selectedTool.icon className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {selectedTool.name}
            </h1>
            <p className="text-lg text-gray-600">
              {selectedTool.desc}
            </p>
          </div>

          {/* Upload Area */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="border-4 border-dashed border-red-300 rounded-xl p-12 text-center bg-red-50 hover:bg-red-100 transition-colors">
              <input
                type="file"
                onChange={handleFileUpload}
                multiple={['merge', 'jpg-to-pdf', 'organize'].includes(selectedTool.id)}
                accept={selectedTool.id.includes('jpg') || selectedTool.id.includes('image') ? 'image/*' : '.pdf'}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <div className={`w-16 h-16 ${selectedTool.color} text-white rounded-full mx-auto mb-4 flex items-center justify-center`}>
                  <selectedTool.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Select PDF files
                </h3>
                <p className="text-gray-600 mb-4">
                  or drop PDFs here
                </p>
                <div className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 cursor-pointer">
                  Select PDF files
                </div>
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-6">
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-red-600" />
                        <div>
                          <p className="font-medium text-gray-800">{file.name}</p>
                          <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setFiles(files.filter((_, i) => i !== index))}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={processFiles}
                  disabled={processing}
                  className="w-full mt-6 bg-red-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : `${selectedTool.name} →`}
                </button>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <strong>💡 Demo Version:</strong> This is a frontend interface demonstration. Real PDF processing requires backend infrastructure with libraries like pdf-lib, PyPDF2, or PDFKit.
          </div>
        </div>
      </div>
    );
  }

  // Home Page
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-red-600">iLovePDF</h1>
            <nav className="hidden md:flex gap-6">
              <button className="text-gray-600 hover:text-gray-900 font-medium">All PDF tools</button>
              <button className="text-gray-600 hover:text-gray-900 font-medium">Features</button>
              <button className="text-gray-600 hover:text-gray-900 font-medium">Pricing</button>
            </nav>
          </div>
          <div className="flex gap-3">
            <button className="text-gray-700 hover:text-gray-900 font-medium px-4 py-2">
              Log in
            </button>
            <button className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 font-medium">
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-red-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Every tool you need to work<br />with PDFs in one place
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! 
            Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {allTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => selectTool(tool)}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-red-300 transition-all cursor-pointer group"
            >
              <div className={`w-12 h-12 ${tool.color} text-white rounded-lg mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <tool.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {tool.name}
              </h3>
              <p className="text-sm text-gray-600">
                {tool.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fast & Easy</h3>
              <p className="text-gray-600">Process files in seconds with our intuitive interface</p>
            </div>
            <div>
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure</h3>
              <p className="text-gray-600">Your files are encrypted and deleted after processing</p>
            </div>
            <div>
              <div className="text-4xl mb-4">☁️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cloud-based</h3>
              <p className="text-gray-600">Works on any device with internet connection</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
