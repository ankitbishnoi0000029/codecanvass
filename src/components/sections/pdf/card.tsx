import { ArrowRightIcon } from "lucide-react";
import Link from "next/link"; // optional – install if missing

export function ToolCard({ tool, onClick }: { tool: any; onClick?: () => void }) {
  const color = tool.catColor || "#dc2626";

  return (
    <Link
      href={`/pdf-tool${tool.route}`}
      onClick={onClick}
      className="group relative block bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    >
      {/* Subtle background gradient on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
        style={{
          background: `linear-gradient(145deg, ${color}20, transparent)`,
        }}
      />

      {/* Icon with floating effect */}
      <div
        className="relative w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110"
        style={{ background: color, color: "white" }}
      >
        {tool.icon}
      </div>

      {/* Title & description */}
      <h3 className="text-base font-bold text-gray-800 leading-tight mb-1.5 group-hover:text-gray-900 transition-colors">
        {tool.name}
      </h3>
      <p className="text-sm text-gray-500 leading-snug line-clamp-2 mb-4">
        {tool.desc}
      </p>

      {/* Pseudo‑button / arrow indicator */}
      <div className="flex items-center text-sm font-medium text-gray-400 group-hover:text-gray-700 transition-colors">
        <span className="mr-1">Use tool</span>
        <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
      </div>

      {/* Optional subtle border glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
        style={{ boxShadow: `0 0 0 2px ${color}40` }}
      />
    </Link>
  );
}