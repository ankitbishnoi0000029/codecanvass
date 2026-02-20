"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload,
  X,
  Check,
  Download,
  Link as LinkIcon,
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  Globe,
  Film,
  AlertCircle,
  Share2,
  QrCode,
  Copy,
  ArrowLeft,
  Clock,
} from "lucide-react";

// ==================== Types ====================
interface ReceivedFile {
  blob: Blob;
  name: string;
  size: number;
}

interface FileInfo {
  name: string;
  size: number;
  type: string;
}

interface VideoDownloadResult {
  success: boolean;
  url?: string;
  title?: string;
  error?: string;
}

// ==================== Main Component ====================
export default function RandomToolsPage() {
  // ---------- State ----------
  const [mode, setMode] = useState<"upload" | "share" | "receive">("upload");
  const [uploadMode, setUploadMode] = useState<"file" | "video">("file");

  // File sharing
  const [file, setFile] = useState<File | null>(null);
  const [shareLink, setShareLink] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [peerId, setPeerId] = useState("");
  const [status, setStatus] = useState<"disconnected" | "waiting" | "connected">("disconnected");
  const [progress, setProgress] = useState(0);
  const [receivedFile, setReceivedFile] = useState<ReceivedFile | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Video downloader
  const [videoUrl, setVideoUrl] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadResult, setDownloadResult] = useState<VideoDownloadResult | null>(null);

  // Refs
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const connectionRef = useRef<RTCDataChannel | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const receivedChunksRef = useRef<string[]>([]);
  const fileInfoRef = useRef<FileInfo | null>(null);
  const peerIdRef = useRef("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // ---------- Init ----------
  useEffect(() => {
    const id = Math.random().toString(36).substring(2, 10);
    setPeerId(id);
    peerIdRef.current = id;

    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get("share");
    if (shareId) {
      setMode("receive");
      setTimeout(() => initializeReceiver(shareId), 50);
    }

    return () => {
      cleanupConnections();
      window.removeEventListener("storage", handleStorageEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Helpers ----------
  const generateQRCode = (text: string) => {
    const size = 200;
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
  };

  const cleanupConnections = () => {
    try {
      connectionRef.current?.close();
    } catch (e) { }
    try {
      peerRef.current?.close();
    } catch (e) { }
    connectionRef.current = null;
    peerRef.current = null;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // ---------- WebRTC Signalling via localStorage ----------
  const handleStorageEvent = useCallback(
    (e: StorageEvent) => {
      if (!peerIdRef.current) return;
      const shareId = peerIdRef.current;

      if (e.key === `share-${shareId}-answer` && e.newValue) {
        try {
          const answer = JSON.parse(e.newValue);
          if (peerRef.current && peerRef.current.signalingState !== "stable") {
            peerRef.current.setRemoteDescription(new RTCSessionDescription(answer)).catch(console.warn);
          }
        } catch (err) {
          console.error("Error setting remote answer:", err);
        }
      }

      if (e.key === `share-${shareId}-candidates` && e.newValue) {
        try {
          const candidates = JSON.parse(e.newValue);
          if (peerRef.current && Array.isArray(candidates)) {
            candidates.forEach((cand: any) => {
              peerRef.current?.addIceCandidate(new RTCIceCandidate(cand)).catch(console.warn);
            });
          }
        } catch (err) {
          console.error("Error adding ICE candidates:", err);
        }
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, [handleStorageEvent]);

  // ---------- Sender ----------
  const initializeSender = async () => {
    if (!file) return;
    cleanupConnections();

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });
    peerRef.current = pc;
    const shareId = peerIdRef.current;

    localStorage.removeItem(`share-${shareId}-offer`);
    localStorage.removeItem(`share-${shareId}-answer`);
    localStorage.removeItem(`share-${shareId}-candidates`);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const existing = localStorage.getItem(`share-${shareId}-candidates`);
        const candidates = existing ? JSON.parse(existing) : [];
        candidates.push(event.candidate.toJSON());
        localStorage.setItem(`share-${shareId}-candidates`, JSON.stringify(candidates));
      }
    };

    const channel = pc.createDataChannel("fileTransfer", { ordered: true });
    setupDataChannel(channel, "sender");

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    localStorage.setItem(`share-${shareId}-offer`, JSON.stringify(offer));

    const domain = window.location.origin;
    const link = `${domain}?share=${shareId}`;
    setShareLink(link);
    setQrCode(generateQRCode(link));

    localStorage.setItem(
      `share-${shareId}-fileinfo`,
      JSON.stringify({
        name: file.name,
        size: file.size,
        type: file.type,
      })
    );

    setMode("share");
    setStatus("waiting");

    const checkAnswer = setInterval(() => {
      const answerData = localStorage.getItem(`share-${shareId}-answer`);
      if (answerData && peerRef.current) {
        try {
          const answer = JSON.parse(answerData);
          if (peerRef.current.signalingState !== "stable") {
            peerRef.current.setRemoteDescription(new RTCSessionDescription(answer)).then(() => {
              setStatus("connected");
            });
          }
        } catch (e) {
          console.warn("Error setting answer from poll:", e);
        } finally {
          clearInterval(checkAnswer);
        }
      }
    }, 500);
  };

  // ---------- Receiver ----------
  const initializeReceiver = async (shareId: string) => {
    try {
      const offerData = localStorage.getItem(`share-${shareId}-offer`);
      if (!offerData) {
        alert("Share link expired or invalid.");
        return;
      }

      cleanupConnections();

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });
      peerRef.current = pc;

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const existing = localStorage.getItem(`share-${shareId}-candidates`);
          const candidates = existing ? JSON.parse(existing) : [];
          candidates.push(event.candidate.toJSON());
          localStorage.setItem(`share-${shareId}-candidates`, JSON.stringify(candidates));
        }
      };

      pc.ondatachannel = (event) => {
        setupDataChannel(event.channel, "receiver");
      };

      const offer = JSON.parse(offerData);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      localStorage.setItem(`share-${shareId}-answer`, JSON.stringify(answer));

      const fileInfoData = localStorage.getItem(`share-${shareId}-fileinfo`);
      if (fileInfoData) {
        fileInfoRef.current = JSON.parse(fileInfoData);
      }

      setStatus("connected");
    } catch (err: any) {
      console.error("initializeReceiver error:", err);
      alert("Connection failed: " + (err?.message || err));
    }
  };

  // ---------- Data channel ----------
  const setupDataChannel = (channel: RTCDataChannel, role: string) => {
    connectionRef.current = channel;

    channel.onopen = () => {
      setStatus("connected");
      if (role === "sender") sendFile();
    };

    channel.onclose = () => setStatus("disconnected");

    if (role === "receiver") {
      channel.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "fileInfo") {
            fileInfoRef.current = data;
            receivedChunksRef.current = [];
            setProgress(0);
          } else if (data.type === "chunk") {
            receivedChunksRef.current.push(data.data);
            const currentProgress = (receivedChunksRef.current.length / data.totalChunks) * 100;
            setProgress(Math.round(currentProgress));

            if (receivedChunksRef.current.length === data.totalChunks) {
              const byteArrays = receivedChunksRef.current.map((b64) => {
                const binary = atob(b64);
                const len = binary.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
                return bytes;
              });
              if (fileInfoRef.current) {
                const blob = new Blob(byteArrays, { type: fileInfoRef.current.type });
                setReceivedFile({
                  blob,
                  name: fileInfoRef.current.name,
                  size: fileInfoRef.current.size,
                });
                setProgress(100);
              }
            }
          }
        } catch (error) {
          console.error("Error parsing data channel message:", error);
        }
      };
    }
  };

  // ---------- Send file ----------
  const sendFile = async () => {
    if (!file || !connectionRef.current || connectionRef.current.readyState !== "open") return;

    setProgress(0);

    connectionRef.current.send(
      JSON.stringify({
        type: "fileInfo",
        name: file.name,
        size: file.size,
        mimeType: file.type,
      })
    );

    const chunkSize = 16 * 1024; // 16KB
    const totalChunks = Math.ceil(file.size / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const arr = new Uint8Array(reader.result as ArrayBuffer);
            let binary = "";
            const block = 0x8000;
            for (let j = 0; j < arr.length; j += block) {
              const slice = arr.subarray(j, j + block);
              binary += String.fromCharCode.apply(null, Array.from(slice));
            }
            resolve(btoa(binary));
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(chunk);
      });

      connectionRef.current.send(
        JSON.stringify({
          type: "chunk",
          data: base64,
          totalChunks,
        })
      );

      setProgress(Math.round(((i + 1) / totalChunks) * 100));
      await new Promise((r) => setTimeout(r, 8));
    }
  };

  // ---------- File select ----------
  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile) {
      setFile(selectedFile);
      initializeSender();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      alert("Copy failed");
    }
  };

  const downloadReceivedFile = () => {
    if (!receivedFile) return;
    const url = URL.createObjectURL(receivedFile.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = receivedFile.name || "download";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetApp = () => {
    setMode("upload");
    setUploadMode("file");
    setFile(null);
    setShareLink("");
    setQrCode("");
    setProgress(0);
    setReceivedFile(null);
    setStatus("disconnected");
    setVideoUrl("");
    setDownloading(false);
    setDownloadProgress(0);
    setDownloadResult(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    cleanupConnections();
    if (peerIdRef.current) {
      localStorage.removeItem(`share-${peerIdRef.current}-offer`);
      localStorage.removeItem(`share-${peerIdRef.current}-answer`);
      localStorage.removeItem(`share-${peerIdRef.current}-candidates`);
      localStorage.removeItem(`share-${peerIdRef.current}-fileinfo`);
    }
  };

  // ---------- 🎥 IMPROVED VIDEO DOWNLOADER (Cobalt API) ----------
  const downloadVideo = async () => {
    if (!videoUrl.trim()) {
      setDownloadResult({ success: false, error: "Please enter a URL" });
      return;
    }

    setDownloading(true);
    setDownloadProgress(10);
    setDownloadResult(null);

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // 1. Request video information from Cobalt API
      const apiUrl = "https://co.wuk.sh/api/json";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: videoUrl,
          downloadMode: "auto",
          audioFormat: "mp3",
          videoQuality: "max",
          isAudioOnly: false,
        }),
        signal,
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      if (data.status !== "success" || !data.url) {
        throw new Error(data.text || "Could not extract video");
      }

      setDownloadProgress(40);

      // 2. Fetch the actual video blob
      const videoResponse = await fetch(data.url, { signal });
      if (!videoResponse.ok) throw new Error("Failed to download video");

      const videoBlob = await videoResponse.blob();
      setDownloadProgress(80);

      // 3. Generate filename from title or URL
      let filename = "video.mp4";
      if (data.title) {
        filename = data.title.replace(/[^\w\s]/gi, "").trim() + ".mp4";
      } else {
        const urlParts = new URL(videoUrl);
        filename = urlParts.hostname.replace("www.", "") + "_" + Date.now() + ".mp4";
      }

      // 4. Trigger download
      const blobUrl = URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setDownloadProgress(100);
      setDownloadResult({
        success: true,
        title: data.title || filename,
        url: data.url,
      });
    } catch (error: any) {
      if (error.name === "AbortError") {
        setDownloadResult({ success: false, error: "Download cancelled" });
      } else {
        setDownloadResult({ success: false, error: error.message || "Download failed" });
      }
    } finally {
      setDownloading(false);
      abortControllerRef.current = null;
    }
  };

  const cancelDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setDownloading(false);
    }
  };

  // ==================== UI ====================

  // Receive mode
  if (mode === "receive") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {!receivedFile ? (
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-slate-700">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4 shadow-lg shadow-orange-500/50">
                  <Download size={36} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Receiving File</h2>
                <p className="text-slate-400">Waiting for sender...</p>
              </div>

              {status === "connected" && progress > 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Downloading...</span>
                      <span className="font-semibold text-orange-400">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-4 rounded-full transition-all duration-300 shadow-lg shadow-orange-500/50"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {status !== "connected" && (
                <div className="text-center py-6">
                  <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-slate-400 mt-4">Establishing connection...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-slate-700">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-4 shadow-lg shadow-green-500/50">
                  <Check size={36} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">File Received!</h2>
              </div>

              <div className="bg-slate-700/50 backdrop-blur-sm rounded-xl p-5 mb-6 border border-slate-600">
                <p className="text-white font-semibold text-lg truncate">{receivedFile.name}</p>
                <p className="text-slate-400 text-sm mt-1">{formatFileSize(receivedFile.size)}</p>
              </div>

              <button
                onClick={downloadReceivedFile}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 flex items-center justify-center gap-2"
              >
                <Download size={22} />
                Save to Device
              </button>

              <button
                onClick={resetApp}
                className="w-full mt-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all"
              >
                Share Another File
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Share mode
  if (mode === "share") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-slate-700 relative">
            <button
              onClick={resetApp}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-all hover:rotate-90 duration-300"
            >
              <X size={24} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1 truncate">{file?.name}</h2>
              <p className="text-slate-400 text-lg">{formatFileSize(file?.size || 0)}</p>
            </div>

            <div className="bg-slate-700/50 backdrop-blur-sm rounded-xl p-4 mb-6 font-mono text-sm text-slate-300 break-all border border-slate-600">
              {shareLink}
            </div>

            {qrCode && (
              <div className="bg-white rounded-xl p-5 mb-6 flex justify-center shadow-lg">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => copyToClipboard(shareLink)}
                className="bg-gradient-to-br from-green-600 to-green-700 rounded-full p-4 flex items-center justify-center transition-all shadow-lg hover:scale-105"
                title="Copy link"
              >
                <Copy size={20} className="text-white" />
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: "Share file", url: shareLink }).catch(() => { });
                  } else {
                    copyToClipboard(shareLink);
                  }
                }}
                className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-full p-4 flex items-center justify-center transition-all shadow-lg hover:scale-105"
                title="Share"
              >
                <Share2 size={20} className="text-white" />
              </button>
              <button
                onClick={() => window.open(shareLink, "_blank")}
                className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-full p-4 flex items-center justify-center transition-all shadow-lg hover:scale-105"
                title="Open link"
              >
                <Globe size={20} className="text-white" />
              </button>
            </div>

            <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-yellow-500 font-semibold mb-2 flex items-center gap-2">
                <AlertCircle size={18} /> Please note:
              </p>
              <p className="text-yellow-200 text-sm leading-relaxed">
                Closing this page will stop sharing. Keep it open until the receiver finishes.
              </p>
            </div>

            {status === "connected" && progress > 0 && (
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Sending...</span>
                  <span className="font-semibold text-orange-400">{progress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-4 rounded-full transition-all duration-300 shadow-lg shadow-orange-500/50"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main menu (upload mode)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Mode Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-slate-800/60 backdrop-blur-sm p-1 rounded-2xl border border-slate-700 inline-flex">
            <button
              onClick={() => setUploadMode("file")}
              className={`px-8 py-3 rounded-xl font-medium transition-all ${uploadMode === "file"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                  : "text-slate-400 hover:text-white"
                }`}
            >
              <Upload className="inline mr-2" size={18} />
              Share Files
            </button>
            <button
              onClick={() => setUploadMode("video")}
              className={`px-8 py-3 rounded-xl font-medium transition-all ${uploadMode === "video"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                  : "text-slate-400 hover:text-white"
                }`}
            >
              <Film className="inline mr-2" size={18} />
              Download Videos
            </button>
          </div>
        </div>

        {uploadMode === "file" ? (
          /* ---------- FILE SHARING ---------- */
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-1">
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) handleFileSelect(selectedFile);
                }}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`bg-slate-800/50 backdrop-blur-sm rounded-3xl border-4 border-dashed ${isDragging ? "border-orange-500 bg-slate-700/50 scale-105" : "border-slate-600"
                  } p-16 cursor-pointer hover:border-orange-500 hover:bg-slate-700/50 transition-all duration-300 shadow-2xl`}
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-6 shadow-lg shadow-orange-500/50 animate-pulse">
                    <Upload size={48} className="text-white" />
                  </div>
                  <p className="text-white text-2xl font-semibold mb-3">Drop your file here</p>
                  <p className="text-slate-400 text-lg">or click to browse</p>
                </div>
              </div>
            </div>

            <div className="text-white space-y-6 order-2">
              <div>
                <h1 className="text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  Share files directly from your device
                </h1>
                <p className="text-slate-300 text-xl">
                  Send files of any size directly from your device without ever storing anything online.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 hover:border-orange-500 transition-all">
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="bg-orange-500/10 p-2 rounded-lg">
                      <Upload size={20} className="text-orange-500" />
                    </div>
                    <span className="font-medium">No size limit</span>
                  </div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 hover:border-orange-500 transition-all">
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="bg-orange-500/10 p-2 rounded-lg">
                      <Share2 size={20} className="text-orange-500" />
                    </div>
                    <span className="font-medium">Peer‑to‑peer</span>
                  </div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 hover:border-orange-500 transition-all">
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="bg-orange-500/10 p-2 rounded-lg">
                      <QrCode size={20} className="text-orange-500" />
                    </div>
                    <span className="font-medium">QR code ready</span>
                  </div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 hover:border-orange-500 transition-all">
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="bg-orange-500/10 p-2 rounded-lg">
                      <Download size={20} className="text-orange-500" />
                    </div>
                    <span className="font-medium">Encrypted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ---------- 🎥 IMPROVED VIDEO DOWNLOADER ---------- */
          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-slate-700">
              <h2 className="text-3xl font-bold text-white mb-6 text-center bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Download Videos & Shorts
              </h2>
              <p className="text-slate-400 text-center mb-8">
                Paste any link from YouTube, Instagram, Facebook, TikTok, or Twitter/X – including <span className="text-orange-400 font-semibold">shorts, reels, and stories</span>.
              </p>

              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/..."
                  className="flex-1 px-6 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  disabled={downloading}
                />
                {downloading ? (
                  <button
                    onClick={cancelDownload}
                    className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
                  >
                    <X size={20} />
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={downloadVideo}
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    Download
                  </button>
                )}
              </div>

              {downloading && (
                <div className="mb-6 space-y-2">
                  <div className="flex justify-between text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock size={16} /> Fetching video...
                    </span>
                    <span className="font-semibold text-orange-400">{downloadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-4 rounded-full transition-all duration-300 shadow-lg shadow-orange-500/50"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {downloadResult && (
                <div
                  className={`rounded-xl p-4 ${downloadResult.success
                      ? "bg-green-900/30 border border-green-600/50 text-green-400"
                      : "bg-red-900/30 border border-red-600/50 text-red-400"
                    }`}
                >
                  <p className="font-semibold flex items-center gap-2">
                    {downloadResult.success ? <Check size={18} /> : <AlertCircle size={18} />}
                    {downloadResult.success ? "Download complete!" : downloadResult.error}
                  </p>
                  {downloadResult.success && downloadResult.title && (
                    <p className="text-sm mt-1 text-slate-300">Title: {downloadResult.title}</p>
                  )}
                </div>
              )}

              <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { icon: Youtube, name: "YouTube", color: "red" },
                  { icon: Instagram, name: "Instagram", color: "pink" },
                  { icon: Facebook, name: "Facebook", color: "blue" },
                  { icon: Film, name: "TikTok", color: "cyan" },
                  { icon: Twitter, name: "Twitter/X", color: "sky" },
                ].map(({ icon: Icon, name, color }) => (
                  <div
                    key={name}
                    className={`bg-slate-700/30 backdrop-blur-sm rounded-xl p-3 text-center border border-slate-600 hover:border-${color}-500 transition-all`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-1 text-${color}-500`} />
                    <span className="text-xs text-slate-300">{name}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-500 text-center mt-6">
                Powered by the open‑source Cobalt API. Downloads are saved directly to your device.
                If a video fails, the platform may have changed; please try again later.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}