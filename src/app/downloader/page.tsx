"use client";

import { useState } from "react";
import {
  Download,
  Search,
  Video,
  Music,
  Image,
  Loader2,
  AlertCircle,
  X,
  Play,
} from "lucide-react";

export default function SnapTubeTray() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [platform, setPlatform] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  // ------------------------------
  //  Detect Platform
  // ------------------------------
  const detectPlatform = (videoUrl: string): string => {
    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be"))
      return "YouTube";
    if (videoUrl.includes("facebook.com")) return "Facebook";
    if (videoUrl.includes("instagram.com")) return "Instagram";
    if (videoUrl.includes("twitter.com") || videoUrl.includes("x.com"))
      return "Twitter";
    if (videoUrl.includes("tiktok.com")) return "TikTok";
    if (videoUrl.includes("vimeo.com")) return "Vimeo";
    return "Unknown";
  };

  // ------------------------------
  //  Extract Video ID
  // ------------------------------
  const extractVideoId = (videoUrl: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /(?:facebook\.com\/.*\/videos\/)([0-9]+)/,
      /(?:instagram\.com\/.*\/p\/)([^\/\n?#]+)/,
      /(?:tiktok\.com\/.*\/video\/)([0-9]+)/,
    ];

    for (const pattern of patterns) {
      const match = videoUrl.match(pattern);
      if (match) return match[1];
    }

    return null;
  };

  // ------------------------------
  //  Handle Search
  // ------------------------------
  const handleSearch = () => {
    if (!url.trim()) {
      setError("Please paste a valid URL");
      setTimeout(() => setError(""), 2000);
      return;
    }

    const detected = detectPlatform(url);
    const id = extractVideoId(url);

    if (!id) {
      setError("Invalid video URL");
      setTimeout(() => setError(""), 2000);
      return;
    }

    setPlatform(detected);
    setVideoId(id);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  // ------------------------------
  //  Reset
  // ------------------------------
  const handleClear = () => {
    setUrl("");
    setPlatform(null);
    setVideoId(null);
    setError("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center">
        SnapTube Tray Downloader
      </h1>

      {/* Input Box */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Paste video URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg p-3"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 rounded-lg flex items-center gap-2"
        >
          <Search size={18} /> Search
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 mb-3">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Loader */}
      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 className="animate-spin" size={28} />
        </div>
      )}

      {/* Result Box */}
      {!loading && platform && videoId && (
        <div className="border rounded-lg p-5 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Platform: {platform}</h2>
            <button onClick={handleClear} className="text-gray-500">
              <X size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <Play /> <span>Video ID: {videoId}</span>
          </div>

          <button className="w-full bg-green-600 text-white p-3 rounded-lg flex items-center justify-center gap-2">
            <Download size={18} /> Download Video
          </button>
        </div>
      )}
    </div>
  );
}
