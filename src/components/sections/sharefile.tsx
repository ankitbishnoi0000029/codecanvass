"use client"
import React, { useState, useEffect, useRef } from "react";
import { Upload, X, Check, Download, Link } from "lucide-react";

declare global {
  interface Window {
    shareData: Record<string, any>;
  }
}

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

export default function RandomToolsPage() {
  const [step, setStep] = useState<"upload" | "sharing" | "receiving">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [shareLink, setShareLink] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [peerId, setPeerId] = useState("");
  const [status, setStatus] = useState<"disconnected" | "waiting" | "connected">("disconnected");
  const [progress, setProgress] = useState(0);
  const [receivedFile, setReceivedFile] = useState<ReceivedFile | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const connectionRef = useRef<RTCDataChannel | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const receivedChunksRef = useRef<string[]>([]);
  const fileInfoRef = useRef<FileInfo | null>(null);
  const peerIdRef = useRef("");

  // ---- On mount: generate id and detect ?share= query ----
  useEffect(() => {
    const id = Math.random().toString(36).substring(2, 10);
    setPeerId(id);
    peerIdRef.current = id;

    // initialize global storage for in-page demo sharing
    window.shareData = window.shareData || {};

    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get("share");
    if (shareId) {
      setStep("receiving");
      // slight delay to allow global store initialization if sender in same page created just now
      setTimeout(() => initializeReceiver(shareId), 50);
    }

    // cleanup on unmount
    return () => {
      cleanupConnections();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- helpers ----
  const generateQRCode = (text: string) => {
    const size = 200;
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
      text
    )}`;
  };

  const cleanupConnections = () => {
    try {
      if (connectionRef.current && connectionRef.current.close) {
        connectionRef.current.close();
      }
    } catch (e) {}
    try {
      if (peerRef.current) {
        peerRef.current.close();
      }
    } catch (e) {}
    connectionRef.current = null;
    peerRef.current = null;
  };

  // ---- SENDER: create peer, datachannel, offer ----
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

    // maintain candidate arrays in the shareData for simple local-window signalling
    const shareId = peerIdRef.current;
    window.shareData[shareId] = window.shareData[shareId] || {};
    window.shareData[shareId].candidates = window.shareData[shareId].candidates || [];

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // push candidate where receiver can find and add it
        window.shareData[shareId].candidates.push(event.candidate.toJSON());
      }
    };

    // create data channel and setup handlers
    const channel = pc.createDataChannel("fileTransfer", { ordered: true });
    setupDataChannel(channel, "sender");

    // create offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // share minimal info in global object
    const domain = window.location.origin;
    const link = `${domain}?share=${shareId}`;
    setShareLink(link);
    setQrCode(generateQRCode(link));

    window.shareData[shareId].offer = offer;
    window.shareData[shareId].file = {
      name: file.name,
      size: file.size,
      type: file.type,
    };
    window.shareData[shareId].senderPC = pc;

    setStep("sharing");
    setStatus("waiting");

    // Poll for answer and for receiver ICE candidates (this is in-page demo signalling)
    // Wait for receiver to put answer into shareData[shareId].answer.
    const waitForAnswer = setInterval(async () => {
      const sd = window.shareData?.[shareId];
      if (sd && sd.answer && sd.answer.sdp) {
        clearInterval(waitForAnswer);
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sd.answer));
          setStatus("connected");
        } catch (err) {
          console.error("Error setting remote desc on sender:", err);
        }
      }
    }, 300);

    // Poll for remote ICE candidates from receiver (the receiver will push candidates to shareData[shareId].rCandidates)
    const waitForRCandidates = setInterval(async () => {
      const sd = window.shareData?.[shareId];
      if (sd && Array.isArray(sd.rCandidates) && sd.rCandidates.length > 0) {
        while (sd.rCandidates.length) {
          const cand = sd.rCandidates.shift();
          try {
            await pc.addIceCandidate(cand);
          } catch (e) {
            console.warn("sender addIceCandidate failed:", e);
          }
        }
      }
      // stop polling if pc closed
      if (!peerRef.current) clearInterval(waitForRCandidates);
    }, 300);
  };

  // ---- RECEIVER: read offer, create answer, connect ----
  const initializeReceiver = async (shareId: string) => {
    try {
      const sd = window.shareData?.[shareId];
      if (!sd || !sd.offer) {
        alert("Invalid or expired share link");
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

      // prepare arrays for exchanging candidates
      window.shareData[shareId] = window.shareData[shareId] || {};
      window.shareData[shareId].rCandidates = window.shareData[shareId].rCandidates || [];

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // push receiver candidate to rCandidates array for sender to consume
          window.shareData[shareId].rCandidates.push(event.candidate.toJSON());
        }
      };

      pc.ondatachannel = (event) => {
        setupDataChannel(event.channel, "receiver");
      };

      // set remote (sender's offer)
      await pc.setRemoteDescription(new RTCSessionDescription(sd.offer));

      // create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // store answer for sender to pick
      window.shareData[shareId].answer = answer;

      // Now poll for sender ICE candidates pushed into window.shareData[shareId].candidates
      const pollSenderCandidates = setInterval(async () => {
        const s = window.shareData?.[shareId];
        if (s && Array.isArray(s.candidates) && s.candidates.length > 0) {
          while (s.candidates.length) {
            const cand = s.candidates.shift();
            try {
              await pc.addIceCandidate(cand);
            } catch (e) {
              console.warn("receiver addIceCandidate failed:", e);
            }
          }
        }
        // stop if peer closed
        if (!peerRef.current) clearInterval(pollSenderCandidates);
      }, 300);

      // if file info existed on shareData, keep it for display (not strictly needed)
      if (sd.file) {
        fileInfoRef.current = sd.file;
      }

      setStatus("connected");
    } catch (err: any) {
      console.error("initializeReceiver error:", err);
      alert("Connection failed: " + (err?.message || err));
    }
  };

  // ---- Data channel setup for sender/receiver ----
  const setupDataChannel = (channel: RTCDataChannel, role: string) => {
    connectionRef.current = channel;

    channel.onopen = () => {
      setStatus("connected");
      if (role === "sender") {
        // start sending file when channel opens
        sendFile();
      }
    };

    channel.onclose = () => {
      setStatus("disconnected");
    };

    if (role === "receiver") {
      channel.onmessage = (event: MessageEvent) => {
        // two message types: JSON metadata (fileInfo, chunk meta) OR direct binary - but we always use JSON base64 here
        try {
          const data = JSON.parse(event.data);
          if (data.type === "fileInfo") {
            fileInfoRef.current = data;
            receivedChunksRef.current = [];
            setProgress(0);
          } else if (data.type === "chunk") {
            // data.data is base64 string
            receivedChunksRef.current.push(data.data);
            const currentProgress =
              (receivedChunksRef.current.length / data.totalChunks) * 100;
            setProgress(Math.round(currentProgress));

            if (receivedChunksRef.current.length === data.totalChunks) {
              // assemble
              const byteArrays = receivedChunksRef.current.map((b64) => {
                const binary = atob(b64);
                const len = binary.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
                return bytes;
              });
              // combine into single blob
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
    } else {
      // sender may choose to monitor messages as well (ack/nacks)
      channel.onmessage = (e: MessageEvent) => {
        // optional: handle acks here
        // console.log("sender got message:", e.data);
      };
    }
  };

  // ---- Sending file in chunks (sender) ----
  const sendFile = async () => {
    if (!file || !connectionRef.current || connectionRef.current.readyState !== "open") {
      console.warn("No file or datachannel not open yet.");
      return;
    }

    setProgress(0);

    // send file metadata first
    if (connectionRef.current) {
      connectionRef.current.send(
        JSON.stringify({
          type: "fileInfo",
          name: file.name,
          size: file.size,
          mimeType: file.type,
        })
      );
    }

    const chunkSize = 16 * 1024; // 16KB
    const totalChunks = Math.ceil(file.size / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      // read as arrayBuffer
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const arr = new Uint8Array(reader.result as ArrayBuffer);
            // convert to binary string then base64
            let binary = "";
            const block = 0x8000; // chunking to avoid stack issues on large arrays
            for (let j = 0; j < arr.length; j += block) {
              const slice = arr.subarray(j, j + block);
              binary += String.fromCharCode.apply(null, Array.from(slice));
            }
            const b64 = btoa(binary);
            resolve(b64);
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

      // small delay to avoid saturating channel
      await new Promise((r) => setTimeout(r, 8));
    }
  };

  // ---- file select / drag-drop handlers ----
  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile) {
      setFile(selectedFile);
      // initialize sender flow
      setTimeout(() => initializeSender(), 50);
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

  // ---- copy to clipboard ----
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      alert("Copy failed");
    }
  };

  // ---- download received file ----
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

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const resetApp = () => {
    setStep("upload");
    setFile(null);
    setShareLink("");
    setQrCode("");
    setProgress(0);
    setReceivedFile(null);
    setStatus("disconnected");
    try {
      if (connectionRef.current && connectionRef.current.close) connectionRef.current.close();
    } catch (e) {}
    try {
      if (peerRef.current) peerRef.current.close();
    } catch (e) {}
    connectionRef.current = null;
    peerRef.current = null;
    // cleanup global shareData entry if any
    try {
      if (window.shareData && peerIdRef.current && window.shareData[peerIdRef.current]) {
        delete window.shareData[peerIdRef.current];
      }
    } catch {}
  };

  // ----- UI: Receiving screen ----
  if (step === "receiving") {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {!receivedFile ? (
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-slate-700">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4 shadow-lg shadow-orange-500/50">
                  <Download size={36} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Receiving File</h2>
                <p className="text-slate-400">Connecting to sender...</p>
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
                Download File
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----- UI: Sharing screen ----
  if (step === "sharing") {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
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
                <Link size={20} className="text-white" />
              </button>
              <button
                onClick={() => {
                  // share via navigator.share if available
                  if (navigator.share) {
                    navigator
                      .share({ title: "Share file", url: shareLink })
                      .catch(() => {});
                  } else {
                    copyToClipboard(shareLink);
                  }
                }}
                className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-full p-4 flex items-center justify-center transition-all shadow-lg hover:scale-105"
                title="Native share / copy"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
              <button
                onClick={() => {
                  // small convenience: open in new window (same page signalling demo)
                  window.open(shareLink, "_blank");
                }}
                className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-full p-4 flex items-center justify-center transition-all shadow-lg hover:scale-105"
                title="Open share link"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 text-slate-300 hover:text-white transition cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-orange-500" />
                <span className="text-sm">Share with nearby devices</span>
              </label>
              <label className="flex items-center gap-3 text-slate-300 hover:text-white transition cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-orange-500" />
                <span className="text-sm">Use fallback when no direct connection can be made</span>
              </label>
            </div>

            <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-yellow-500 font-semibold mb-2 flex items-center gap-2">⚠️ Please note:</p>
              <p className="text-yellow-200 text-sm leading-relaxed">
                Closing this page will stop sharing. Keep it open to continue.
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

  // ----- Default upload UI -----
  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
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
              className={`bg-slate-800/50 backdrop-blur-sm rounded-3xl border-4 border-dashed ${
                isDragging ? "border-orange-500 bg-slate-700/50 scale-105" : "border-slate-600"
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
              <p className="text-slate-300 text-xl">Send files of any size directly from your device without ever storing anything online.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 hover:border-orange-500 transition-all">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="bg-orange-500/10 p-2 rounded-lg"><Link size={20} className="text-orange-500" /></div>
                  <span className="font-medium">No size limit</span>
                </div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 hover:border-orange-500 transition-all">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="bg-orange-500/10 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                  <span className="font-medium">Peer-to-peer</span>
                </div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 hover:border-orange-500 transition-all">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="bg-orange-500/10 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="font-medium">Blazingly fast</span>
                </div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 hover:border-orange-500 transition-all">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="bg-orange-500/10 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <span className="font-medium">Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
