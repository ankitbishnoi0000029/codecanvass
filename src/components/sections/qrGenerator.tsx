"use client";

import { useState } from "react";
import { Download, Globe, FileText, FileImage, Sparkles, Zap, Shield, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function QRGenerator() {
  const [activeTab, setActiveTab] = useState("website");
  const [inputValue, setInputValue] = useState("");
  const [qrText, setQrText] = useState("Scan me!");
  const [textColor, setTextColor] = useState("#0f172a");
  const [qrColor, setQrColor] = useState("#111111");
  const [bgColor, setBgColor] = useState("#ffffff");

  const tabs = [
    { id: "website", label: "Website", icon: Globe },
    { id: "text", label: "Text", icon: FileText },
    { id: "pdf", label: "PDF", icon: FileText },
    { id: "image", label: "Images", icon: FileImage },
  ];

  const features = [
    { icon: <Zap className="w-5 h-5" />, text: "Instant Generation" },
    { icon: <Shield className="w-5 h-5" />, text: "100% Secure" },
    { icon: <Sparkles className="w-5 h-5" />, text: "High Quality" },
  ];

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    canvas.width = 1000;
    canvas.height = 1000;

    img.onload = () => {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 100, 100, 800, 800);

      const link = document.createElement("a");
      link.download = "qrcode-" + Date.now() + ".png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    const base64 = btoa(unescape(encodeURIComponent(svgData)));
    img.src = "data:image/svg+xml;base64," + base64;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles size={16} />
            AI-Powered QR Generator
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Professional QR Code Generator
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Create stunning, customizable QR codes in seconds - completely free
          </p>
        </div>
      </div>

      {/* Features Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap justify-center gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-700">
                <div className="text-blue-600">{feature.icon}</div>
                <span className="font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* LEFT SIDE */}
          <div className="space-y-6">
            {/* Input Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">1</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Design Your QR Code</h2>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* QR Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                    Select QR Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center justify-center gap-3 px-6 py-4 text-sm font-semibold rounded-2xl border-2 transition-all duration-300 ${
                            activeTab === tab.id
                              ? "border-blue-500 text-blue-700 bg-blue-50 shadow-lg scale-105"
                              : "border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:scale-102"
                          }`}
                        >
                          <Icon size={20} />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Input Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                    {activeTab === "website"
                      ? "Website URL"
                      : activeTab === "text"
                      ? "Your Text"
                      : activeTab === "pdf"
                      ? "PDF Link"
                      : "Image URL"}
                  </label>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={
                      activeTab === "website"
                        ? "https://example.com"
                        : activeTab === "text"
                        ? "Enter your text here..."
                        : activeTab === "pdf"
                        ? "https://example.com/document.pdf"
                        : "https://example.com/image.jpg"
                    }
                    className="w-full border-2 border-gray-300 rounded-2xl px-6 py-4 text-base focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                  {inputValue && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 px-4 py-2 rounded-xl">
                      <Check size={18} className="text-green-600" />
                      Ready to generate
                    </div>
                  )}
                </div>

                {/* Display Text */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                    Display Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                    placeholder="Scan me!"
                    className="w-full border-2 border-gray-300 rounded-2xl px-6 py-4 text-base focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Color Pickers */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                    Customize Colors
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200 hover:border-blue-300 transition-all">
                      <span className="block text-xs font-bold text-gray-700 mb-3 text-center uppercase">Text</span>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full h-16 rounded-xl cursor-pointer border-2 border-white shadow-lg hover:scale-105 transition-transform"
                      />
                      <span className="block text-xs text-gray-500 font-mono text-center mt-2">{textColor}</span>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200 hover:border-blue-300 transition-all">
                      <span className="block text-xs font-bold text-gray-700 mb-3 text-center uppercase">QR Code</span>
                      <input
                        type="color"
                        value={qrColor}
                        onChange={(e) => setQrColor(e.target.value)}
                        className="w-full h-16 rounded-xl cursor-pointer border-2 border-white shadow-lg hover:scale-105 transition-transform"
                      />
                      <span className="block text-xs text-gray-500 font-mono text-center mt-2">{qrColor}</span>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200 hover:border-blue-300 transition-all">
                      <span className="block text-xs font-bold text-gray-700 mb-3 text-center uppercase">Background</span>
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-full h-16 rounded-xl cursor-pointer border-2 border-white shadow-lg hover:scale-105 transition-transform"
                      />
                      <span className="block text-xs text-gray-500 font-mono text-center mt-2">{bgColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
              <h3 className="text-2xl font-bold mb-6">Why Choose Us?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">High Resolution Output</p>
                    <p className="text-blue-100 text-sm">Download QR codes in crisp 1000x1000px quality</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Full Customization</p>
                    <p className="text-blue-100 text-sm">Choose your own colors for text, QR, and background</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Instant & Free</p>
                    <p className="text-blue-100 text-sm">Generate unlimited QR codes without any cost</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:sticky lg:top-8 space-y-6">
            {/* Preview Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">2</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Preview & Download</h2>
                </div>
              </div>

              <div className="p-8">
                {/* QR Display */}
                <div
                  className="rounded-3xl p-12 mb-6 flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-gray-300"
                  style={{ backgroundColor: bgColor }}
                >
                  {inputValue ? (
                    <div className="flex flex-col items-center gap-6">
                      <p
                        className="font-bold text-xl"
                        style={{ color: textColor }}
                      >
                        {qrText}
                      </p>
                      <div className="bg-white p-6 rounded-2xl shadow-2xl">
                        <QRCodeSVG
                          id="qr-code-svg"
                          value={inputValue}
                          size={260}
                          level="H"
                          fgColor={qrColor}
                          bgColor="transparent"
                          className="transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <div className="text-8xl mb-6">🎨</div>
                      <p className="text-xl font-semibold text-gray-600 mb-2">
                        Ready to Create
                      </p>
                      <p className="text-sm text-gray-400">
                        Enter your content on the left to generate your QR code
                      </p>
                    </div>
                  )}
                </div>

                {/* Download Button */}
                {inputValue && (
                  <button
                    onClick={downloadQR}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg py-5 rounded-2xl hover:from-blue-700 hover:to-purple-700 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Download size={24} />
                    Download QR Code
                  </button>
                )}
              </div>
            </div>

            {/* Info Card */}
            {!inputValue && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">💡</div>
                  <div>
                    <p className="font-semibold text-amber-900 mb-2">Pro Tip</p>
                    <p className="text-sm text-amber-800">
                      Start by selecting a QR type and entering your content. Your QR code will appear instantly with live preview!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600 flex items-center justify-center gap-2 flex-wrap">
            <Sparkles size={18} className="text-yellow-500" />
            <span className="font-semibold">100% Free</span>
            <span>•</span>
            <span>Unlimited QR Codes</span>
            <span>•</span>
            <span>No Watermark</span>
          </p>
        </div>
      </div>
    </div>
  );
}