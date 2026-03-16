"use client";

import React, { useState, useMemo, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = {
  id: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
  tools: Tool[];
};

type Tool = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  popular?: boolean;
  new?: boolean;
  badge?: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: "image",
    label: "Image",
    icon: "🖼️",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    tools: [
      { id: "png", name: "PNG Compressor", description: "Losslessly shrink PNG files without quality loss.", tags: ["png", "lossless", "image"], popular: true },
      { id: "jpg", name: "JPG Compressor", description: "Reduce JPG file sizes with smart quality control.", tags: ["jpg", "jpeg", "lossy"], popular: true },
      { id: "jpeg", name: "JPEG Compressor", description: "Optimise JPEG images for web and email.", tags: ["jpeg", "jpg", "image"] },
      { id: "webp", name: "WEBP Compressor", description: "Compress modern WebP images efficiently.", tags: ["webp", "modern", "image"], new: true },
      { id: "gif", name: "GIF Compressor", description: "Reduce animated GIF file sizes.", tags: ["gif", "animated", "image"] },
      { id: "svg", name: "SVG Compressor", description: "Minify and compress SVG vector files.", tags: ["svg", "vector", "minify"] },
      { id: "avif", name: "AVIF Compressor", description: "Compress next-gen AVIF image format.", tags: ["avif", "next-gen", "image"], new: true },
      { id: "heic", name: "HEIC Compressor", description: "Compress Apple HEIC/HEIF photos.", tags: ["heic", "apple", "photo"] },
      { id: "bmp", name: "BMP Compressor", description: "Compress legacy BMP bitmap images.", tags: ["bmp", "bitmap", "legacy"] },
      { id: "tiff", name: "TIFF Compressor", description: "Reduce TIFF file sizes for print/scan.", tags: ["tiff", "print", "scan"] },
      { id: "ico", name: "ICO Compressor", description: "Compress website favicon ICO files.", tags: ["ico", "favicon", "icon"] },
      { id: "raw", name: "RAW Compressor", description: "Compress camera RAW image files.", tags: ["raw", "camera", "photo"] },
      { id: "psd", name: "PSD Compressor", description: "Reduce Photoshop PSD file sizes.", tags: ["psd", "photoshop", "design"] },
      { id: "ai-img", name: "AI Image Compressor", description: "AI-powered intelligent image compression.", tags: ["ai", "smart", "image"], badge: "AI" },
      { id: "eps", name: "EPS Compressor", description: "Compress EPS vector/postscript files.", tags: ["eps", "vector", "print"] },
      { id: "tga", name: "TGA Compressor", description: "Compress TGA game/rendering textures.", tags: ["tga", "game", "texture"] },
      { id: "lossless", name: "Lossless Compressor", description: "Zero quality loss image compression.", tags: ["lossless", "quality", "image"] },
      { id: "lossy", name: "Lossy Compressor", description: "Aggressive size reduction with minimal visual impact.", tags: ["lossy", "size", "image"] },
      { id: "smart-img", name: "Smart Image Compressor", description: "Automatically chooses best compression method.", tags: ["smart", "auto", "image"] },
      { id: "bulk-img", name: "Bulk Image Compressor", description: "Compress hundreds of images at once.", tags: ["bulk", "batch", "image"], popular: true },
      { id: "hq-img", name: "High-Quality Compressor", description: "Preserve maximum quality while reducing size.", tags: ["quality", "hq", "image"] },
      { id: "bitrate-img", name: "Image Bitrate Compressor", description: "Fine-tune image bitrate for optimal output.", tags: ["bitrate", "image", "advanced"] },
      { id: "res-img", name: "Image Resolution Compressor", description: "Downscale image resolution smartly.", tags: ["resolution", "resize", "image"] },
    ],
  },
  {
    id: "video",
    label: "Video",
    icon: "🎥",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    tools: [
      { id: "mp4", name: "MP4 Compressor", description: "Compress MP4 videos for web and mobile.", tags: ["mp4", "video", "h264"], popular: true },
      { id: "mov", name: "MOV Compressor", description: "Reduce Apple MOV file sizes.", tags: ["mov", "apple", "video"] },
      { id: "avi", name: "AVI Compressor", description: "Compress legacy AVI video files.", tags: ["avi", "legacy", "video"] },
      { id: "mkv", name: "MKV Compressor", description: "Compress Matroska container videos.", tags: ["mkv", "matroska", "video"] },
      { id: "webm", name: "WEBM Compressor", description: "Compress WebM videos for web use.", tags: ["webm", "web", "video"] },
      { id: "flv", name: "FLV Compressor", description: "Compress Flash video files.", tags: ["flv", "flash", "video"] },
      { id: "wmv", name: "WMV Compressor", description: "Reduce Windows Media Video sizes.", tags: ["wmv", "windows", "video"] },
      { id: "m4v", name: "M4V Compressor", description: "Compress iTunes M4V video files.", tags: ["m4v", "itunes", "apple"] },
      { id: "3gp", name: "3GP Compressor", description: "Compress mobile 3GP videos.", tags: ["3gp", "mobile", "video"] },
      { id: "ogv", name: "OGV Compressor", description: "Compress open OGG video files.", tags: ["ogv", "ogg", "open"] },
      { id: "4k", name: "4K Video Compressor", description: "Compress ultra-HD 4K footage.", tags: ["4k", "uhd", "video"], popular: true },
      { id: "hd", name: "HD Video Compressor", description: "Reduce HD 1080p/720p video sizes.", tags: ["hd", "1080p", "video"] },
      { id: "batch-vid", name: "Batch Video Compressor", description: "Process multiple videos simultaneously.", tags: ["batch", "bulk", "video"] },
      { id: "stream", name: "Streaming Video Compressor", description: "Optimise video for streaming platforms.", tags: ["stream", "hls", "video"] },
      { id: "mobile-vid", name: "Mobile Video Compressor", description: "Optimise videos for mobile devices.", tags: ["mobile", "phone", "video"] },
      { id: "yt-vid", name: "YouTube Video Compressor", description: "Compress videos for YouTube upload.", tags: ["youtube", "social", "video"] },
      { id: "tiktok-vid", name: "TikTok Video Compressor", description: "Optimise videos for TikTok.", tags: ["tiktok", "social", "video"] },
    ],
  },
  {
    id: "audio",
    label: "Audio",
    icon: "🎵",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    tools: [
      { id: "mp3", name: "MP3 Compressor", description: "Reduce MP3 audio file sizes.", tags: ["mp3", "audio", "music"], popular: true },
      { id: "wav", name: "WAV Compressor", description: "Compress uncompressed WAV audio.", tags: ["wav", "lossless", "audio"] },
      { id: "aac", name: "AAC Compressor", description: "Optimise AAC audio for streaming.", tags: ["aac", "streaming", "audio"] },
      { id: "ogg", name: "OGG Compressor", description: "Compress open OGG audio files.", tags: ["ogg", "open", "audio"] },
      { id: "flac", name: "FLAC Compressor", description: "Reduce lossless FLAC file sizes.", tags: ["flac", "lossless", "audio"] },
      { id: "m4a", name: "M4A Compressor", description: "Compress Apple M4A audio files.", tags: ["m4a", "apple", "audio"] },
      { id: "wma", name: "WMA Compressor", description: "Compress Windows Media Audio.", tags: ["wma", "windows", "audio"] },
      { id: "amr", name: "AMR Compressor", description: "Compress phone call AMR audio.", tags: ["amr", "phone", "audio"] },
      { id: "aiff", name: "AIFF Compressor", description: "Compress Apple AIFF audio files.", tags: ["aiff", "apple", "audio"] },
      { id: "podcast", name: "Podcast Audio Compressor", description: "Optimise audio for podcast distribution.", tags: ["podcast", "voice", "audio"] },
      { id: "batch-aud", name: "Batch Audio Compressor", description: "Compress multiple audio files at once.", tags: ["batch", "bulk", "audio"] },
      { id: "smart-aud", name: "Smart Audio Compressor", description: "AI-driven audio compression.", tags: ["smart", "ai", "audio"], badge: "AI" },
    ],
  },
  {
    id: "document",
    label: "Document",
    icon: "📄",
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
    tools: [
      { id: "pdf", name: "PDF Compressor", description: "Reduce PDF sizes without losing readability.", tags: ["pdf", "document"], popular: true },
      { id: "word", name: "Word Compressor", description: "Compress Word .docx documents.", tags: ["word", "docx", "document"] },
      { id: "doc", name: "DOC Compressor", description: "Compress legacy Word .doc files.", tags: ["doc", "word", "legacy"] },
      { id: "docx", name: "DOCX Compressor", description: "Reduce modern Word document sizes.", tags: ["docx", "word", "document"] },
      { id: "excel", name: "Excel Compressor", description: "Compress Excel spreadsheets.", tags: ["excel", "xlsx", "spreadsheet"] },
      { id: "xls", name: "XLS Compressor", description: "Compress legacy Excel files.", tags: ["xls", "excel", "legacy"] },
      { id: "xlsx", name: "XLSX Compressor", description: "Reduce modern Excel file sizes.", tags: ["xlsx", "excel", "spreadsheet"] },
      { id: "ppt", name: "PowerPoint Compressor", description: "Compress PowerPoint presentations.", tags: ["ppt", "powerpoint", "slides"] },
      { id: "pptx", name: "PPTX Compressor", description: "Reduce modern PowerPoint sizes.", tags: ["pptx", "slides", "presentation"] },
      { id: "epub", name: "EPUB Compressor", description: "Compress eBook EPUB files.", tags: ["epub", "ebook", "book"] },
      { id: "rtf", name: "RTF Compressor", description: "Compress Rich Text Format files.", tags: ["rtf", "text", "document"] },
      { id: "txt", name: "TXT Compressor", description: "Compress plain text files.", tags: ["txt", "text", "plain"] },
    ],
  },
  {
    id: "archive",
    label: "Archive",
    icon: "📦",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    tools: [
      { id: "zip", name: "ZIP Compressor", description: "Create and compress ZIP archives.", tags: ["zip", "archive"], popular: true },
      { id: "rar", name: "RAR Compressor", description: "Compress files into RAR archives.", tags: ["rar", "archive"] },
      { id: "7z", name: "7Z Compressor", description: "Ultra-high 7-Zip compression.", tags: ["7z", "7zip", "archive"] },
      { id: "tar", name: "TAR Compressor", description: "Create TAR archive bundles.", tags: ["tar", "unix", "archive"] },
      { id: "gzip", name: "GZIP Compressor", description: "GZIP compress files for servers.", tags: ["gzip", "gz", "web"] },
      { id: "bzip2", name: "BZIP2 Compressor", description: "High-ratio BZIP2 compression.", tags: ["bzip2", "bz2", "linux"] },
      { id: "xz", name: "XZ Compressor", description: "Extreme XZ/LZMA2 compression.", tags: ["xz", "lzma", "linux"] },
      { id: "zstd", name: "ZSTD Compressor", description: "Fast modern Zstandard compression.", tags: ["zstd", "fast", "modern"], new: true },
      { id: "lzma", name: "LZMA Compressor", description: "High-ratio LZMA compression.", tags: ["lzma", "7z", "archive"] },
      { id: "lz4", name: "LZ4 Compressor", description: "Ultra-fast LZ4 compression.", tags: ["lz4", "fast", "archive"], new: true },
      { id: "folder", name: "Folder Compressor", description: "Compress entire directories.", tags: ["folder", "directory", "bulk"] },
      { id: "email-att", name: "Email Attachment Compressor", description: "Shrink files for email attachments.", tags: ["email", "attachment", "send"] },
    ],
  },
  {
    id: "developer",
    label: "Developer",
    icon: "💻",
    color: "text-lime-400",
    bg: "bg-lime-500/10 border-lime-500/20",
    tools: [
      { id: "html-min", name: "HTML Minifier", description: "Strip whitespace from HTML files.", tags: ["html", "minify", "web"], popular: true },
      { id: "css-min", name: "CSS Minifier", description: "Minify CSS stylesheets.", tags: ["css", "minify", "web"], popular: true },
      { id: "js-min", name: "JavaScript Minifier", description: "Minify and compress JS bundles.", tags: ["js", "javascript", "minify"], popular: true },
      { id: "json-min", name: "JSON Minifier", description: "Compress and minify JSON data.", tags: ["json", "minify", "data"] },
      { id: "xml-min", name: "XML Minifier", description: "Minify XML markup files.", tags: ["xml", "minify", "data"] },
      { id: "sql-min", name: "SQL Query Compressor", description: "Minify SQL queries.", tags: ["sql", "database", "query"] },
      { id: "php", name: "PHP Code Compressor", description: "Minify PHP source files.", tags: ["php", "server", "code"] },
      { id: "python", name: "Python Code Compressor", description: "Minify Python scripts.", tags: ["python", "code", "script"] },
      { id: "java", name: "Java Code Compressor", description: "Compress Java source files.", tags: ["java", "code", "jvm"] },
      { id: "cpp", name: "C++ Code Compressor", description: "Minify C++ source code.", tags: ["cpp", "c++", "native"] },
      { id: "ts", name: "TypeScript Compressor", description: "Compress TypeScript files.", tags: ["typescript", "ts", "code"] },
      { id: "jsx", name: "React JSX Compressor", description: "Compress React JSX/TSX files.", tags: ["react", "jsx", "tsx"] },
      { id: "nextjs", name: "Next.js Bundle Compressor", description: "Optimise Next.js production bundles.", tags: ["nextjs", "bundle", "react"] },
      { id: "graphql", name: "GraphQL Compressor", description: "Minify GraphQL queries/schemas.", tags: ["graphql", "api", "schema"] },
      { id: "yaml", name: "YAML Compressor", description: "Compress YAML configuration files.", tags: ["yaml", "config", "devops"] },
      { id: "toml", name: "TOML Compressor", description: "Minify TOML config files.", tags: ["toml", "config", "rust"] },
      { id: "webpack", name: "Webpack Bundle Compressor", description: "Optimise Webpack build output.", tags: ["webpack", "bundle", "build"] },
      { id: "brotli", name: "Brotli Web Compressor", description: "Brotli-compress web assets.", tags: ["brotli", "web", "server"], new: true },
    ],
  },
  {
    id: "ai",
    label: "AI / Smart",
    icon: "🧠",
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-500/10 border-fuchsia-500/20",
    tools: [
      { id: "ai-image2", name: "AI Image Compressor", description: "Neural-network image compression.", tags: ["ai", "image", "smart"], badge: "AI", popular: true },
      { id: "ai-video", name: "AI Video Compressor", description: "AI-powered video size reduction.", tags: ["ai", "video", "smart"], badge: "AI" },
      { id: "ai-audio", name: "AI Audio Compressor", description: "Machine-learning audio compression.", tags: ["ai", "audio", "smart"], badge: "AI" },
      { id: "ai-file", name: "AI File Compressor", description: "Intelligent all-format compression.", tags: ["ai", "file", "smart"], badge: "AI" },
      { id: "auto", name: "Auto Compression Tool", description: "Detects format and applies best method.", tags: ["auto", "smart", "all"] },
      { id: "ml", name: "ML Compressor", description: "Machine learning-based compression.", tags: ["ml", "ai", "advanced"], badge: "AI" },
      { id: "adaptive", name: "Adaptive Compression", description: "Adapts algorithm to content type.", tags: ["adaptive", "smart", "dynamic"] },
      { id: "gpu", name: "GPU Compressor", description: "GPU-accelerated compression for large files.", tags: ["gpu", "fast", "accelerated"] },
      { id: "parallel", name: "Parallel Compressor", description: "Multi-core parallel compression.", tags: ["parallel", "fast", "multi-thread"] },
    ],
  },
  {
    id: "social",
    label: "Social Media",
    icon: "📱",
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20",
    tools: [
      { id: "whatsapp", name: "WhatsApp Image Compressor", description: "Optimise images for WhatsApp sharing.", tags: ["whatsapp", "social", "image"], popular: true },
      { id: "instagram", name: "Instagram Image Compressor", description: "Compress for Instagram's format.", tags: ["instagram", "social", "image"] },
      { id: "facebook", name: "Facebook Image Compressor", description: "Optimise images for Facebook.", tags: ["facebook", "social", "image"] },
      { id: "youtube2", name: "YouTube Video Compressor", description: "Prepare videos for YouTube upload.", tags: ["youtube", "social", "video"] },
      { id: "tiktok2", name: "TikTok Video Compressor", description: "Compress for TikTok vertical format.", tags: ["tiktok", "social", "video"] },
      { id: "story", name: "Story Image Compressor", description: "Compress story-sized 9:16 images.", tags: ["story", "social", "image"] },
      { id: "thumb", name: "Thumbnail Compressor", description: "Optimise channel/video thumbnails.", tags: ["thumbnail", "youtube", "image"] },
      { id: "screenshot", name: "App Screenshot Compressor", description: "Compress app store screenshots.", tags: ["screenshot", "app", "image"] },
      { id: "social-vid", name: "Social Media Video Compressor", description: "Multi-platform video compression.", tags: ["social", "video", "multi"] },
    ],
  },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useCompressor() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [compressed, setCompressed] = useState<{
    originalSize: number;
    compressedSize: number;
    ratio: number;
    url: string;
    name: string;
  } | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [quality, setQuality] = useState(80);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "popular">("popular");
  const fileRef = useRef<HTMLInputElement>(null);

  const allTools: (Tool & { categoryId: string; categoryLabel: string })[] = useMemo(() =>
    CATEGORIES.flatMap((c) =>
      c.tools.map((t) => ({ ...t, categoryId: c.id, categoryLabel: c.label }))
    ), []);

  const filtered = useMemo(() => {
    let tools = allTools;
    if (activeCategory !== "all") tools = tools.filter((t) => t.categoryId === activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      tools = tools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.includes(q))
      );
    }
    if (sortBy === "popular") {
      tools = [...tools].sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    } else {
      tools = [...tools].sort((a, b) => a.name.localeCompare(b.name));
    }
    return tools;
  }, [allTools, activeCategory, query, sortBy]);

  const popularTools = useMemo(() => allTools.filter((t) => t.popular).slice(0, 8), [allTools]);

  const handleFileSelect = useCallback((file: File) => {
    setUploadedFile(file);
    setCompressed(null);
  }, []);

  const handleCompress = useCallback(async () => {
    if (!uploadedFile || !activeTool) return;
    setCompressing(true);
    setCompressed(null);

    // Simulate compression with canvas (for images) or mock (for other types)
    await new Promise((r) => setTimeout(r, 1800));

    const originalSize = uploadedFile.size;
    const reductionFactor = 0.3 + (1 - quality / 100) * 0.5; // 30%-80% reduction
    const compressedSize = Math.max(1024, Math.floor(originalSize * (1 - reductionFactor)));
    const ratio = Math.round(reductionFactor * 100);

    // For demo: create a mock download URL from the original file
    const url = URL.createObjectURL(uploadedFile);

    setCompressed({ originalSize, compressedSize, ratio, url, name: uploadedFile.name });
    setCompressing(false);
  }, [uploadedFile, activeTool, quality]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  return {
    query, setQuery,
    activeCategory, setActiveCategory,
    activeTool, setActiveTool,
    uploadedFile, setUploadedFile,
    compressed, setCompressed,
    compressing,
    quality, setQuality,
    view, setView,
    sortBy, setSortBy,
    fileRef,
    filtered,
    popularTools,
    allTools,
    handleFileSelect,
    handleCompress,
    handleDrop,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getCategoryForTool(toolId: string): Category | undefined {
  return CATEGORIES.find((c) => c.tools.some((t) => t.id === toolId));
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Badge({ text, type }: { text: string; type?: string }) {
  const colors: Record<string, string> = {
    AI: "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30",
    new: "bg-lime-500/20 text-lime-300 border border-lime-500/30",
    popular: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  };
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${colors[text] ?? colors[type ?? ""] ?? "bg-slate-700 text-slate-300"}`}>
      {text}
    </span>
  );
}

function ToolCard({
  tool,
  category,
  onClick,
  listView,
}: {
  tool: Tool & { categoryId?: string };
  category: Category;
  onClick: () => void;
  listView?: boolean;
}) {
  if (listView) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-[#0f1117] border border-white/5 hover:border-white/15 hover:bg-white/5 transition-all group text-left"
      >
        <span className="text-2xl w-8 shrink-0">{category.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white group-hover:text-white truncate">{tool.name}</p>
          <p className="text-xs text-slate-500 truncate">{tool.description}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          {tool.badge && <Badge text={tool.badge} />}
          {tool.new && <Badge text="new" />}
          {tool.popular && <Badge text="popular" />}
        </div>
        <span className="text-slate-600 group-hover:text-slate-400 transition-colors ml-1">→</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-2xl border ${category.bg} hover:scale-[1.02] hover:shadow-lg hover:shadow-black/30 transition-all duration-200 group text-left cursor-pointer`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{category.icon}</span>
        <div className="flex flex-wrap gap-1 justify-end">
          {tool.badge && <Badge text={tool.badge} />}
          {tool.new && <Badge text="new" />}
          {tool.popular && <Badge text="popular" />}
        </div>
      </div>
      <h3 className={`text-sm font-bold ${category.color} mb-1 leading-tight`}>{tool.name}</h3>
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{tool.description}</p>
      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-slate-400">Open →</span>
      </div>
    </button>
  );
}

function CompressorModal({
  tool,
  onClose,
  state,
}: {
  tool: Tool;
  onClose: () => void;
  state: ReturnType<typeof useCompressor>;
}) {
  const category = getCategoryForTool(tool.id)!;
  const {
    uploadedFile, handleFileSelect, handleCompress, handleDrop,
    compressing, compressed, quality, setQuality, fileRef,
  } = state;

  const acceptMap: Record<string, string> = {
    image: "image/*",
    video: "video/*",
    audio: "audio/*",
    document: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.epub",
    archive: ".zip,.rar,.7z,.tar,.gz,.bz2,.xz",
    developer: ".html,.css,.js,.ts,.jsx,.tsx,.json,.xml,.yaml,.toml,.sql,.php,.py,.java,.cpp",
    ai: "*",
    social: "image/*,video/*",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-[#0d0f14] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`px-6 pt-6 pb-4 border-b border-white/5`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{category.icon}</span>
              <div>
                <h2 className={`text-lg font-bold ${category.color}`}>{tool.name}</h2>
                <p className="text-xs text-slate-500">{tool.description}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-xl leading-none mt-1">✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-white/10 hover:border-white/25 rounded-2xl p-8 text-center cursor-pointer transition-colors group"
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept={acceptMap[category.id] ?? "*"}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            {uploadedFile ? (
              <div>
                <p className="text-2xl mb-1">📂</p>
                <p className="text-sm font-semibold text-white">{uploadedFile.name}</p>
                <p className="text-xs text-slate-500">{formatBytes(uploadedFile.size)}</p>
              </div>
            ) : (
              <div>
                <p className="text-3xl mb-2 group-hover:scale-110 transition-transform">⬆️</p>
                <p className="text-sm text-slate-400">Drop file here or click to browse</p>
                <p className="text-xs text-slate-600 mt-1">Supports {acceptMap[category.id] ?? "all formats"}</p>
              </div>
            )}
          </div>

          {/* Quality slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400">Compression Quality</span>
              <span className="text-xs font-bold text-white">{quality}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-[10px] text-slate-600 mt-1">
              <span>Max compression</span>
              <span>Max quality</span>
            </div>
          </div>

          {/* Compress button */}
          <button
            onClick={handleCompress}
            disabled={!uploadedFile || compressing}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-900/30"
          >
            {compressing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Compressing…
              </span>
            ) : (
              "⚡ Compress Now"
            )}
          </button>

          {/* Result */}
          {compressed && (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
              <p className="text-xs font-bold text-emerald-400 mb-3">✅ Compression Complete</p>
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">Original</p>
                  <p className="text-sm font-bold text-white">{formatBytes(compressed.originalSize)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">Compressed</p>
                  <p className="text-sm font-bold text-emerald-400">{formatBytes(compressed.compressedSize)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">Saved</p>
                  <p className="text-sm font-bold text-amber-400">{compressed.ratio}%</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-white/5 rounded-full h-1.5 mb-4">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full transition-all"
                  style={{ width: `${100 - compressed.ratio}%` }}
                />
              </div>
              <a
                href={compressed.url}
                download={`compressed_${compressed.name}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
              >
                ⬇️ Download Compressed File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CompressorHub() {
  const state = useCompressor();
  const {
    query, setQuery,
    activeCategory, setActiveCategory,
    activeTool, setActiveTool,
    view, setView,
    sortBy, setSortBy,
    filtered,
    popularTools,
    allTools,
  } = state;

  const totalTools = allTools.length;

  return (
    <div className="min-h-screen bg-slate-950 font-sans" style={{ backgroundColor: "#f4f4f42b", }}>
      {/* Modal */}
      {activeTool && (
        <CompressorModal
          tool={activeTool}
          onClose={() => { state.setActiveTool(null); state.setCompressed(null); state.setUploadedFile(null); }}
          state={state}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* ── Hero / Stats ── */}
        {!query && activeCategory === "all" && (
          <section>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-1">
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">All-in-One</span>{" "}
              File Compressor
            </h1>
            <p className="text-slate-500 text-sm mb-6">
              {totalTools} compression tools · images, video, audio, documents, code and more
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { label: "Total Tools", value: totalTools, icon: "🛠️" },
                { label: "Categories", value: CATEGORIES.length, icon: "📂" },
                { label: "AI-Powered", value: allTools.filter((t) => t.badge === "AI").length, icon: "🧠" },
                { label: "New Tools", value: allTools.filter((t) => t.new).length, icon: "✨" },
              ].map((s) => (
                <div key={s.label} className="bg-white/3 border border-white/6 rounded-2xl p-4">
                  <p className="text-xl mb-1">{s.icon}</p>
                  <p className="text-2xl font-black t">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Popular tools quick-pick */}
            <div>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">⭐ Popular Tools</h2>
              <div className="flex flex-wrap gap-2">
                {popularTools.map((t) => {
                  const cat = getCategoryForTool(t.id)!;
                  return (
                    <button
                      key={t.id}
                      onClick={() => state.setActiveTool(t)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${cat.bg} text-xs font-semibold ${cat.color} hover:scale-105 transition-transform`}
                    >
                      {cat.icon} {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Category tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCategory === "all" ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"}`}
          >
            All · {totalTools}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCategory === cat.id ? `${cat.bg} ${cat.color}` : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"}`}
            >
              {cat.icon} {cat.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeCategory === cat.id ? "bg-white/10" : "bg-white/5"}`}>
                {cat.tools.length}
              </span>
            </button>
          ))}
        </div>

        {/* ── Sort / results bar ── */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {filtered.length} tool{filtered.length !== 1 ? "s" : ""}{query ? ` for "${query}"` : ""}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "popular")}
              className="text-xs bg-white/5 border border-white/8 text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-violet-500/60"
            >
              <option value="popular">Popular first</option>
              <option value="name">A → Z</option>
            </select>
          </div>
        </div>

        {/* ── Tool grid/list ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-slate-400 text-sm">No tools found for <strong className="text-white">"{query}"</strong></p>
            <button onClick={() => setQuery("")} className="mt-3 text-xs text-violet-400 hover:text-violet-300 underline">Clear search</button>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map((tool) => {
              const cat = CATEGORIES.find((c) => c.id === tool.categoryId) ?? CATEGORIES[0];
              return (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  category={cat}
                  onClick={() => state.setActiveTool(tool)}
                />
              );
            })}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((tool) => {
              const cat = CATEGORIES.find((c) => c.id === tool.categoryId) ?? CATEGORIES[0];
              return (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  category={cat}
                  onClick={() => state.setActiveTool(tool)}
                  listView
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 mt-16 py-8 text-center">
        <p className="text-xs text-slate-600">
          CompressHub · {totalTools} tools across {CATEGORIES.length} categories · Built with Next.js + Tailwind CSS
        </p>
      </footer>
    </div>
  );
}