"use client"
import React, { useState, useEffect, useRef } from "react";
import { Upload, X, Check, Download, Link } from "lucide-react";
import { dataType } from "@/utils/types/uiTypes";
import { getNavbar } from "@/actions/dbAction";
import Meta from "./meta";

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

// Simple PeerJS-like signaling using a public service
const SIGNALING_SERVER = "wss://signaling.yjs.dev"; // Free WebSocket signaling server

export default function FileSharePage() {
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
  const wsRef = useRef<WebSocket | null>(null);
  const peerIdRef = useRef("");
  const remoteIdRef = useRef("");
 const [list , setList] = useState<dataType[]>([])
  
   const fetchData = async () => {
    try {
      const response = await getNavbar('fst');
      setList(response);
      console.log("Navbar data:", response); // yaha log karo
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const id = Math.random().toString(36).substring(2, 15);
    setPeerId(id);
    peerIdRef.current = id;

    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get("share");
    if (shareId) {
      setStep("receiving");
      remoteIdRef.current = shareId;
      setTimeout(() => initializeReceiver(shareId), 100);
    }

    return () => {
      cleanupConnections();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateQRCode = (text: string) => {
    const size = 200;
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
  };

  const cleanupConnections = () => {
    try {
      if (connectionRef.current) connectionRef.current.close();
    } catch (e) { }
    try {
      if (peerRef.current) peerRef.current.close();
    } catch (e) { }
    try {
      if (wsRef.current) wsRef.current.close();
    } catch (e) { }
    connectionRef.current = null;
    peerRef.current = null;
    wsRef.current = null;
  };

  // WebSocket signaling setup
  const setupWebSocket = (role: "sender" | "receiver") => {
    const ws = new WebSocket(SIGNALING_SERVER);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      // Register with our peer ID
      ws.send(JSON.stringify({
        type: "register",
        id: peerIdRef.current
      }));
    };

    ws.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "offer" && role === "receiver") {
          await handleOffer(message.offer, message.from);
        } else if (message.type === "answer" && role === "sender") {
          await handleAnswer(message.answer);
        } else if (message.type === "ice-candidate") {
          await handleIceCandidate(message.candidate);
        }
      } catch (err) {
        console.error("Error handling WebSocket message:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setStatus("disconnected");
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return ws;
  };

  const sendViaWebSocket = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  // SENDER: Initialize and create offer
  const initializeSender = async () => {
    if (!file) return;

    cleanupConnections();
    setupWebSocket("sender");

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
    });

    peerRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendViaWebSocket({
          type: "ice-candidate",
          candidate: event.candidate.toJSON(),
          to: remoteIdRef.current,
          from: peerIdRef.current
        });
      }
    };

    const channel = pc.createDataChannel("fileTransfer", {
      ordered: true,
      maxRetransmits: 10
    });
    setupDataChannel(channel, "sender");

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const domain = window.location.origin + window.location.pathname;
    const link = `${domain}?share=${peerIdRef.current}`;
    setShareLink(link);
    setQrCode(generateQRCode(link));

    setStep("sharing");
    setStatus("waiting");

    // Wait for WebSocket to be ready before sending offer
    const waitForWs = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        clearInterval(waitForWs);
        // Offer will be sent when receiver connects and requests it
      }
    }, 100);
  };

  // RECEIVER: Initialize and handle offer
  const initializeReceiver = async (senderId: string) => {
    cleanupConnections();
    const ws = setupWebSocket("receiver");
    remoteIdRef.current = senderId;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
    });

    peerRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendViaWebSocket({
          type: "ice-candidate",
          candidate: event.candidate.toJSON(),
          to: senderId,
          from: peerIdRef.current
        });
      }
    };

    pc.ondatachannel = (event) => {
      setupDataChannel(event.channel, "receiver");
    };

    // Wait for WebSocket to be ready, then request offer from sender
    const waitForWs = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        clearInterval(waitForWs);
        sendViaWebSocket({
          type: "request-offer",
          to: senderId,
          from: peerIdRef.current
        });
      }
    }, 100);

    setStatus("waiting");
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit, from: string) => {
    if (!peerRef.current) return;

    remoteIdRef.current = from;

    await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);

    sendViaWebSocket({
      type: "answer",
      answer: answer,
      to: from,
      from: peerIdRef.current
    });

    setStatus("connected");
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerRef.current) return;
    await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    setStatus("connected");
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!peerRef.current) return;
    try {
      await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("Error adding ICE candidate:", err);
    }
  };

  // Enhanced WebSocket message handler for sender
  useEffect(() => {
    if (!wsRef.current) return;

    const originalOnMessage = wsRef.current.onmessage;

    wsRef.current.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "request-offer") {
          // Receiver is requesting our offer
          if (peerRef.current && peerRef.current.localDescription) {
            remoteIdRef.current = message.from;
            sendViaWebSocket({
              type: "offer",
              offer: peerRef.current.localDescription,
              to: message.from,
              from: peerIdRef.current
            });
          }
        } else if (originalOnMessage && wsRef.current) {
          originalOnMessage.call(wsRef.current, event);
        }
      } catch (err) {
        console.error("Error in message handler:", err);
      }
    };
  }, [wsRef.current?.readyState]);

  const setupDataChannel = (channel: RTCDataChannel, role: string) => {
    connectionRef.current = channel;

    channel.onopen = () => {
      console.log("Data channel opened");
      setStatus("connected");
      if (role === "sender") {
        setTimeout(() => sendFile(), 500);
      }
    };

    channel.onclose = () => {
      console.log("Data channel closed");
      setStatus("disconnected");
    };

    channel.onerror = (error) => {
      console.error("Data channel error:", error);
    };

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

  const sendFile = async () => {
    if (!file || !connectionRef.current || connectionRef.current.readyState !== "open") {
      console.warn("Cannot send file - channel not ready");
      return;
    }

    console.log("Starting file transfer...");
    setProgress(0);

    connectionRef.current.send(
      JSON.stringify({
        type: "fileInfo",
        name: file.name,
        size: file.size,
        fileType: file.type,
      })
    );

    const chunkSize = 16 * 1024;
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

      if (connectionRef.current && connectionRef.current.readyState === "open") {
        connectionRef.current.send(
          JSON.stringify({
            type: "chunk",
            data: base64,
            totalChunks,
          })
        );

        setProgress(Math.round(((i + 1) / totalChunks) * 100));
        await new Promise((r) => setTimeout(r, 10));
      }
    }

    console.log("File transfer complete");
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile) {
      setFile(selectedFile);
      setTimeout(() => initializeSender(), 100);
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

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const resetApp = () => {
    cleanupConnections();
    setStep("upload");
    setFile(null);
    setShareLink("");
    setQrCode("");
    setProgress(0);
    setReceivedFile(null);
    setStatus("disconnected");
  };

  // UI: Receiving screen
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
                <p className="text-slate-400">
                  {status === "waiting" ? "Connecting to sender..." : status === "connected" ? "Connected!" : "Establishing connection..."}
                </p>
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

  // UI: Sharing screen
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

            <button
              onClick={() => copyToClipboard(shareLink)}
              className="w-full mb-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {copied ? <Check size={20} /> : <Link size={20} />}
              {copied ? "Copied!" : "Copy Link"}
            </button>

            <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-xl p-4 backdrop-blur-sm mb-4">
              <p className="text-yellow-500 font-semibold mb-2 flex items-center gap-2">
                ⚠️ Keep this page open
              </p>
              <p className="text-yellow-200 text-sm leading-relaxed">
                Closing this page will stop sharing. The connection is direct between devices.
              </p>
            </div>

            <div className="text-center text-sm text-slate-400">
              Status: <span className="text-orange-400 font-semibold">
                {status === "waiting" ? "Waiting for connection..." : status === "connected" ? "Connected ✓" : "Disconnected"}
              </span>
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

  // Default upload UI
  return (
    <>
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
                    <Link size={20} className="text-orange-500" />
                  </div>
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
       <Meta selectedData={list} />
       </>
  );
}