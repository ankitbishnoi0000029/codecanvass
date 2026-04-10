"use client";

import Link from "next/link";

export interface Tool {
  urlName: string;
  route: string;
  des: string;
  icon?: string;
  badge?: string;
}

interface ToolCardProps {
  tool: Tool;
  index?: number;
}

export default function ToolCard({ tool, index = 0 }: ToolCardProps) {
  return (
    <Link
      href={tool.route}
      className="group block"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Gradient Border */}
      <div className="relative h-full rounded-2xl p-[1px] bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-blue-500/30 hover:from-indigo-400/50 hover:to-purple-400/50 transition-all duration-300">

        {/* Inner Card */}
        <div className="h-full rounded-2xl bg-[#0b0f19]/95 backdrop-blur-xl p-6 border border-white/5 group-hover:border-indigo-400/30 transition-all duration-300">

          {/* Top */}
          <div className="flex items-center justify-between mb-4">
            
            {/* Icon */}
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 text-lg shadow-inner">
              {tool.icon ?? "</>"}
            </div>

            {/* Badge */}
            {tool.badge && (
              <span className="text-[10px] px-2 py-1 rounded-md bg-indigo-400/10 text-indigo-300 border border-indigo-400/20 font-mono tracking-wide">
                {tool.badge}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-white text-lg font-semibold leading-snug group-hover:text-indigo-300 transition">
            {tool.urlName}
          </h3>

          {/* Route */}
          <div className="mt-2">
            <code className="text-xs text-indigo-300 bg-black/30 px-2 py-1 rounded-md border border-white/5 font-mono">
              {tool.route}
            </code>
          </div>

          {/* Description */}
          <p className="mt-3 text-sm text-gray-400 leading-relaxed line-clamp-2">
            {tool.des}
          </p>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-mono">
              run tool →
            </span>

            <span className="text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition">
              →
            </span>
          </div>
        </div>

        {/* Glow */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition blur-xl bg-indigo-500/20"></div>
      </div>
    </Link>
  );
}