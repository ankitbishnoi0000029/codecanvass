"use client";
import { useState } from "react";
import {
  Download,
  Search,
  Video,
  Music,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Play,
  Share2,
  Trash2,
  Clock,
  Film,
} from "lucide-react";

export  function VideoDownloder() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("home");
  const [error, setError] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const extractVideoId = (videoUrl: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /(?:facebook\.com\/.*\/videos\/)([0-9]+)/,
      /(?:instagram\.com\/.*\/p\/)([^\/\n?#]+)/,
      /(?:tiktok\.com\/.*\/video\/)([0-9]+)/,
    ];
    for (let pattern of patterns) {
      const match = videoUrl.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const detectPlatform = (videoUrl: string) => {
    if (videoUrl.includes("youtube")) return "YouTube";
    if (videoUrl.includes("facebook")) return "Facebook";
    if (videoUrl.includes("instagram")) return "Instagram";
    if (videoUrl.includes("twitter") || videoUrl.includes("x.com"))
      return "Twitter";
    if (videoUrl.includes("tiktok")) return "TikTok";
    if (videoUrl.includes("vimeo")) return "Vimeo";
    if (videoUrl.includes("dailymotion")) return "Dailymotion";
    return "Unknown";
  };

  const handleSearch = () => {
    if (!url.trim()) {
      setError("Please enter a valid URL");
      setTimeout(() => setError(""), 2500);
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      setError("Invalid URL. Try again.");
      setTimeout(() => setError(""), 2500);
      return;
    }

    setLoading(true);
    setError("");

    setTimeout(() => {
      const platform = detectPlatform(url);

      const mockVideoInfo = {
        id: Date.now(),
        videoId,
        platform,
        title: `${platform} Video: HD Quality Content`,
        thumbnail: `https://via.placeholder.com/640x360/${Math.floor(
          Math.random() * 16777215
        ).toString(16)}/ffffff?text=${platform}`,
        duration: `${Math.floor(Math.random() * 10) + 3}:${Math.floor(
          Math.random() * 60
        )
          .toString()
          .padStart(2, "0")}`,
        channel: `${platform} Creator`,
        views: `${(Math.random() * 5 + 0.5).toFixed(1)}M`,
        uploadDate: `${Math.floor(Math.random() * 7) + 1} days ago`,
        url,
        formats: [
          { id: 1, quality: "1080p Full HD", size: "125 MB", type: "video", resolution: "1920x1080", format: "MP4" },
          { id: 2, quality: "720p HD", size: "75 MB", type: "video", resolution: "1280x720", format: "MP4" },
          { id: 3, quality: "480p", size: "45 MB", type: "video", resolution: "854x480", format: "MP4" },
          { id: 4, quality: "360p", size: "25 MB", type: "video", resolution: "640x360", format: "MP4" },
          { id: 5, quality: "Audio Only (MP3)", size: "5 MB", type: "audio", bitrate: "320kbps", format: "MP3" },
        ],
      };

      setVideoInfo(mockVideoInfo);
      setLoading(false);

      setSearchHistory((prev) => {
        const filtered = prev.filter((u) => u !== url);
        return [url, ...filtered].slice(0, 10);
      });
    }, 1500);
  };

  const handleDownload = (format: any) => {
    const newDownload = {
      id: Date.now(),
      videoId: videoInfo.videoId,
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      platform: videoInfo.platform,
      format: format.quality,
      size: format.size,
      type: format.type,
      fileFormat: format.format,
      progress: 0,
      status: "downloading",
      timestamp: new Date().toLocaleString(),
      downloadSpeed: "0 MB/s",
      timeRemaining: "Calculating...",
    };

    setDownloads((prev) => [newDownload, ...prev]);

    let currentProgress = 0;

    const interval = setInterval(() => {
      setDownloads((prev) =>
        prev.map((d) => {
          if (d.id === newDownload.id) {
            if (d.progress < 100) {
              currentProgress = Math.min(
                d.progress + Math.random() * 14 + 3,
                100
              );
              const speed = (Math.random() * 3 + 1).toFixed(1);
              const remaining = Math.max(
                0,
                Math.floor((100 - currentProgress) / 10)
              );
              return {
                ...d,
                progress: Math.floor(currentProgress),
                downloadSpeed: `${speed} MB/s`,
                timeRemaining:
                  remaining > 0 ? `${remaining}s remaining` : "Almost done...",
              };
            } else {
              clearInterval(interval);
              return {
                ...d,
                status: "completed",
                downloadSpeed: "Complete",
                timeRemaining: "Done",
              };
            }
          }
          return d;
        })
      );
    }, 380);
  };

  const removeDownload = (id: number) => {
    setDownloads((prev) => prev.filter((d) => d.id !== id));
  };

  const clearAllDownloads = () => {
    setDownloads([]);
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return "from-red-500 to-orange-500";
    if (progress < 70) return "from-orange-500 to-yellow-500";
    return "from-green-500 to-emerald-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
      <div className="max-w-4xl mx-auto pb-24">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 px-6 py-5 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
                <Film className="animate-pulse" />
                SnapTube Pro
              </h1>
              <p className="text-white text-opacity-90 text-sm">
                Fast & Free Video Downloader
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3 hover:bg-opacity-30 transition-all cursor-pointer">
              <Download className="text-white" size={28} />
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="px-4 pt-4">

          {activeTab === "home" && (
            <div>
              {/* Search Section */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                  <Search size={24} className="text-purple-600" />
                  Download Any Video
                </h2>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste video URL here..."
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />

                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 hover:scale-105"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search size={20} />
                        Search
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg mb-4 animate-pulse border border-red-200">
                    <AlertCircle size={20} />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}

                {searchHistory.length > 0 && !videoInfo && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
                        <Clock size={16} /> Recent Searches
                      </p>
                      <button
                        onClick={() => setSearchHistory([])}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="space-y-1">
                      {searchHistory.slice(0, 3).map((historyUrl, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setUrl(historyUrl);
                            setActiveTab("home");
                          }}
                          className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-purple-50 rounded-lg text-sm text-gray-600 truncate transition-colors"
                        >
                          {historyUrl}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Video Details */}
              {videoInfo && (
                <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
                  <div className="flex gap-4 mb-6">
                    <div className="relative">
                      <img
                        src={videoInfo.thumbnail}
                        className="w-48 h-28 object-cover rounded-lg shadow-md"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-60 rounded-full p-3">
                          <Play className="text-white" size={28} />
                        </div>
                      </div>

                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {videoInfo.duration}
                      </div>

                      <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                        {videoInfo.platform}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h2 className="font-bold text-lg mb-2 text-gray-800">
                        {videoInfo.title}
                      </h2>

                      <p className="text-gray-600 text-sm">{videoInfo.channel}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {videoInfo.views} • {videoInfo.uploadDate}
                      </p>

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => {
                            setUrl("");
                            setVideoInfo(null);
                          }}
                          className="text-purple-600 text-sm font-medium flex items-center gap-1"
                        >
                          <Search size={14} /> New Search
                        </button>

                        <button className="text-gray-600 text-sm font-medium flex items-center gap-1">
                          <Share2 size={14} /> Share
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-lg">
                      <Download size={20} />
                      Select Quality & Download:
                    </h3>

                    {videoInfo.formats.map((format: any) => (
                      <div
                        key={format.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border hover:border-purple-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-lg ${
                              format.type === "video"
                                ? "bg-purple-100"
                                : "bg-pink-100"
                            }`}
                          >
                            {format.type === "video" ? (
                              <Video size={24} className="text-purple-600" />
                            ) : (
                              <Music size={24} className="text-pink-600" />
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              {format.quality}
                            </p>
                            <p className="text-sm text-gray-500">
                              {format.size} •{" "}
                              {format.type === "video"
                                ? format.resolution
                                : format.bitrate}{" "}
                              • {format.format}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDownload(format)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg flex items-center gap-2 hover:scale-105"
                        >
                          <Download size={18} /> Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DOWNLOAD PAGE */}
          {activeTab === "downloads" && (
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Download size={28} className="text-purple-600" />
                  My Downloads
                </h2>

                {downloads.length > 0 && (
                  <button
                    onClick={clearAllDownloads}
                    className="text-red-500 text-sm font-medium hover:bg-red-50 px-3 py-2 rounded-lg flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Clear All
                  </button>
                )}
              </div>

              {downloads.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4">
                    <Download size={56} className="text-purple-400" />
                  </div>

                  <p className="text-xl font-semibold text-gray-600 mb-2">
                    No downloads yet
                  </p>
                  <p className="text-sm">
                    Start downloading videos from the Home tab
                  </p>

                  <button
                    onClick={() => setActiveTab("home")}
                    className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:shadow-lg"
                  >
                    Browse Videos
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {downloads.map((download) => (
                    <div
                      key={download.id}
                      className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-lg transition-all"
                    >
                      <div className="flex gap-4 mb-3">
                        <img
                          src={download.thumbnail}
                          className="w-24 h-16 object-cover rounded-lg"
                        />

                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 truncate">
                            {download.title}
                          </p>

                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              {download.platform}
                            </span>
                            <span>{download.format}</span>
                            <span>•</span>
                            <span>{download.size}</span>
                            <span>•</span>
                            <span>{download.fileFormat}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => removeDownload(download.id)}
                          className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      {download.status === "downloading" ? (
                        <div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                            <div
                              className={`bg-gradient-to-r ${getProgressColor(
                                download.progress
                              )} h-3 rounded-full transition-all`}
                              style={{ width: `${download.progress}%` }}
                            ></div>
                          </div>

                          <div className="flex justify-between text-xs">
                            <p className="text-gray-600 font-medium">
                              {download.downloadSpeed}
                            </p>
                            <p className="text-purple-600 font-bold">
                              {download.progress}%
                            </p>
                            <p className="text-gray-500">
                              {download.timeRemaining}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle size={20} />
                            <span className="font-semibold text-sm">
                              Download Complete!
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button className="text-purple-600 text-sm font-medium hover:underline">
                              Open
                            </button>
                            <button className="text-gray-600 text-sm font-medium hover:underline">
                              Share
                            </button>
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-2">
                        {download.timestamp}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t">
        <div className="max-w-4xl mx-auto flex justify-around py-3">

          {[
            { id: "home", icon: Search, label: "Home" },
            { id: "downloads", icon: Download, label: "Downloads", badge: downloads.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center px-8 py-2 rounded-xl ${
                activeTab === tab.id
                  ? "text-purple-600 bg-purple-50 scale-105"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="relative">
                <tab.icon size={24} />

                {(tab.badge ?? 0) > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                    {(tab.badge ?? 0) > 9 ? "9+" : (tab.badge ?? 0)}
                  </span>
                )}
              </div>

              <span className="text-xs font-semibold">{tab.label}</span>
            </button>
          ))}

        </div>
      </div>
    </div>
  );
}
