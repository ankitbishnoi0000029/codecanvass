"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { Loader2, Download, RefreshCcw, Palette, Sparkles, Zap, Shield, Upload } from "lucide-react";

export function BackgroundRemover() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState("transparent");
  const [customColor, setCustomColor] = useState("#ffffff");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLibraryReady, setIsLibraryReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const presetColors = [
    { name: "Transparent", value: "transparent", gradient: "repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%)" },
    { name: "White", value: "#ffffff" },
    { name: "Black", value: "#000000" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#a855f7" },
    { name: "Red", value: "#ef4444" },
    { name: "Green", value: "#10b981" },
    { name: "Gradient", value: "gradient", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      title: "Lightning Fast",
      description: "Remove backgrounds in seconds with AI-powered technology"
    },
    {
      icon: <Sparkles className="w-6 h-6 text-purple-600" />,
      title: "Studio Quality",
      description: "Professional results with perfect edge detection"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "100% Private",
      description: "All processing happens in your browser - no uploads"
    },
    {
      icon: <Palette className="w-6 h-6 text-pink-600" />,
      title: "Custom Backgrounds",
      description: "Choose from presets or add your own custom colors"
    }
  ];

  // Initialize the library with proper configuration
  useEffect(() => {
    let mounted = true;

    const initLibrary = async () => {
      try {
        // Dynamic import with proper error handling
        const bgRemoval = await import("@imgly/background-removal");

        if (!mounted) return;

        // Preload the configuration
        await bgRemoval.preload({
          model: "isnet_fp16",
        });

        if (mounted) {
          setIsLibraryReady(true);
        }
      } catch (err) {
        console.error("Library initialization error:", err);
        if (mounted) {
          setError("Failed to initialize AI model. Please refresh the page.");
        }
      }
    };

    initLibrary();

    return () => {
      mounted = false;
    };
  }, []);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isLibraryReady) {
      setError("AI model is still loading. Please wait a moment and try again.");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => setOriginalImage(event.target?.result as string);
    reader.readAsDataURL(file);

    setIsProcessing(true);
    setProgress(0);
    setProcessedImage(null);

    let progressInterval: ReturnType<typeof setInterval> | null = null;

    try {
      progressInterval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? prev : prev + 10));
      }, 300);

      // Import and use the function
      const { removeBackground } = await import("@imgly/background-removal");

      const blob = await removeBackground(file, {
        model: "isnet_fp16",
        output: {
          format: "image/png",
          quality: 1,
        },
        progress: (key, current, total) => {
          void key;
          const percentage = total ? Math.round((current / total) * 100) : 0;
          setProgress(Math.min(percentage, 90));
        },
      });

      setProgress(100);

      const url = URL.createObjectURL(blob);
      setProcessedImage(url);
    } catch (err) {
      console.error('Background removal error:', err);
      setError(
        "Error removing background. This might be due to:\n" +
        "1. Image format not supported\n" +
        "2. Model files couldn't be loaded\n" +
        "3. Browser compatibility issue\n\n" +
        "Please try refreshing the page or using a different image."
      );
      setProgress(0);
    } finally {
      if (progressInterval) clearInterval(progressInterval);
      setIsProcessing(false);
    }
  };

  const getBackgroundStyle = () => {
    const selected = presetColors.find((c) => c.value === backgroundColor);
    if (selected?.gradient) return { backgroundImage: selected.gradient };
    if (backgroundColor === "custom") return { backgroundColor: customColor };
    if (backgroundColor === "transparent")
      return {
        backgroundImage: "repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%)",
        backgroundSize: "20px 20px"
      };
    return { backgroundColor };
  };

  const handleDownload = () => {
    if (!processedImage || !canvasRef.current) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      canvas.width = img.width;
      canvas.height = img.height;

      if (backgroundColor === "transparent") {
        // Keep transparent
      } else if (backgroundColor === "gradient") {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#667eea");
        gradient.addColorStop(1, "#764ba2");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (backgroundColor === "custom") {
        ctx.fillStyle = customColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `bg-removed-${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    };
    img.src = processedImage;
  };

  const handleReset = () => {
    if (processedImage) {
      URL.revokeObjectURL(processedImage);
    }
    setOriginalImage(null);
    setProcessedImage(null);
    setProgress(0);
    setBackgroundColor("transparent");
    setShowColorPicker(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      if (processedImage) {
        URL.revokeObjectURL(processedImage);
      }
    };
  }, [processedImage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles size={16} />
            AI-Powered Background Removal
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Remove Background
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              In Seconds
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Professional quality background removal powered by AI. No signup required, completely free, and all processing happens in your browser.
          </p>
        </div>
      </div>

      {/* Main Tool */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">

          {!originalImage ? (
            <div className="p-12">
              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="font-medium text-red-700 whitespace-pre-line">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 text-sm text-red-600 underline hover:no-underline"
                  >
                    Refresh Page
                  </button>
                </div>
              )}

              {/* Loading State */}
              {!isLibraryReady && !error && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin text-blue-600" size={20} />
                    <div>
                      <p className="font-medium text-blue-700">Loading AI Model...</p>
                      <p className="text-sm text-blue-600 mt-1">This may take 10-60 seconds on first load (downloading the model & WASM files)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-200 ${isLibraryReady && !error
                    ? 'border-gray-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50/30'
                    : 'border-gray-200 opacity-50 cursor-not-allowed'
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="upload"
                  disabled={!isLibraryReady || !!error}
                />
                <label
                  htmlFor="upload"
                  className={`flex flex-col items-center ${isLibraryReady && !error ? 'cursor-pointer' : 'cursor-not-allowed'
                    }`}
                >
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-20 h-20 rounded-2xl flex items-center justify-center mb-4">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  <span className="text-2xl font-semibold text-gray-900 mb-2">
                    {isLibraryReady ? "Upload Your Image" : "Preparing AI Model..."}
                  </span>
                  <p className="text-gray-500 mb-4">
                    {isLibraryReady ? "Drag and drop or click to browse" : "Please wait while we load the background removal AI"}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>Supports: PNG, JPG, JPEG, WebP</span>
                    <span>•</span>
                    <span>Max 10MB</span>
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <div className="p-8 space-y-8">

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="font-medium text-red-700 whitespace-pre-line">{error}</p>
                  <button
                    onClick={handleReset}
                    className="mt-2 text-sm text-red-600 underline hover:no-underline"
                  >
                    Try another image
                  </button>
                </div>
              )}

              {/* Processing Progress */}
              {isProcessing && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex justify-between items-center text-blue-700 text-sm font-medium mb-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      <span>Processing your image with AI...</span>
                    </div>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Image Comparison */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-gray-900 font-semibold text-sm uppercase tracking-wider">Original Image</h3>
                  <div className="bg-gray-100 border-2 border-gray-200 rounded-2xl overflow-hidden aspect-square">
                    <img src={originalImage} className="object-contain w-full h-full" alt="original" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-gray-900 font-semibold text-sm uppercase tracking-wider">
                      {processedImage ? "Background Removed" : "Processing..."}
                    </h3>

                    {processedImage && (
                      <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                      >
                        <Palette size={16} />
                        <span>Change Background</span>
                      </button>
                    )}
                  </div>

                  <div className="relative border-2 border-gray-200 rounded-2xl overflow-hidden aspect-square">
                    {processedImage ? (
                      <div className="w-full h-full flex items-center justify-center p-4" style={getBackgroundStyle()}>
                        <img src={processedImage} className="object-contain max-h-full max-w-full" alt="result" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full bg-gray-50">
                        <Loader2 className="animate-spin text-blue-500 w-12 h-12 mb-4" />
                        <p className="text-gray-500 font-medium">Removing background...</p>
                        <p className="text-gray-400 text-sm mt-2">This may take 10-20 seconds</p>
                      </div>
                    )}
                  </div>

                  {/* Color Picker */}
                  {showColorPicker && processedImage && (
                    <div className="p-5 border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm">Choose Background Color</h4>
                      <div className="flex gap-2 flex-wrap mb-4">
                        {presetColors.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setBackgroundColor(color.value)}
                            className={`w-12 h-12 rounded-xl border-2 transition-all hover:scale-110 ${backgroundColor === color.value
                                ? "border-blue-500 ring-4 ring-blue-200 scale-110"
                                : "border-gray-300 hover:border-gray-400"
                              }`}
                            style={
                              color.gradient
                                ? { backgroundImage: color.gradient }
                                : {
                                  backgroundColor: color.value === "transparent" ? "white" : color.value,
                                  backgroundImage: color.value === "transparent" ? "repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%)" : "none",
                                  backgroundSize: "10px 10px"
                                }
                            }
                            title={color.name}
                          />
                        ))}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Custom Color</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={customColor}
                            onChange={(e) => {
                              setCustomColor(e.target.value);
                              setBackgroundColor("custom");
                            }}
                            className="h-12 w-16 cursor-pointer rounded-lg border-2 border-gray-300"
                          />
                          <input
                            type="text"
                            value={customColor}
                            onChange={(e) => {
                              setCustomColor(e.target.value);
                              setBackgroundColor("custom");
                            }}
                            placeholder="#FFFFFF"
                            className="border-2 border-gray-300 rounded-lg px-4 py-2 text-sm font-mono flex-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-medium"
                >
                  <RefreshCcw size={18} />
                  <span>Upload New Image</span>
                </button>

                {processedImage && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-xl"
                  >
                    <Download size={18} />
                    <span>Download Image</span>
                  </button>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      {!originalImage && (
        <div className="max-w-6xl mx-auto px-6 mb-16">
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="bg-gray-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Benefits Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose Our Background Remover?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Results</h3>
              <p className="text-blue-100">Get professional quality background removal in just seconds. No waiting, no hassle.</p>
            </div>
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">100% Secure</h3>
              <p className="text-blue-100">Your images never leave your device. All processing happens locally in your browser.</p>
            </div>
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Technology</h3>
              <p className="text-blue-100">Advanced AI ensures perfect edge detection and studio-quality results every time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-gray-600">
        <p className="flex items-center justify-center gap-2">
          <Sparkles size={16} className="text-yellow-500" />
          <span className="font-medium">100% Free Forever</span>
          <span>•</span>
          <span>No Watermarks</span>
          <span>•</span>
          <span>Unlimited Usage</span>
        </p>
      </div>
    </div>
  );
}