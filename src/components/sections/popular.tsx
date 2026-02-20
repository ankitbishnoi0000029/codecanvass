"use client";

import { useEffect, useState } from "react";
import { Heading } from "../ui/heading";
import { getTableData } from "@/actions/dbAction";
import { dataType } from "@/utils/types/uiTypes";
import { ArrowUpRight, Sparkles, Zap, Code2 } from "lucide-react";
import Link from "next/link";

export function Popular() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [data, setData] = useState<dataType[]>([]);

  useEffect(() => {
    (async () => {
      const res = (await getTableData("popular")) as unknown as dataType[];
      setData(Array.isArray(res) ? res : []);
    })();
  }, []);
  // Function to get random gradient for each card
  const getGradientByIndex = (index: number) => {
    const gradients = [
      "from-blue-600 to-cyan-600",
      "from-purple-600 to-pink-600",
      "from-orange-600 to-red-600",
      "from-green-600 to-emerald-600",
      "from-indigo-600 to-purple-600",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <section className="relative px-4 sm:px-6 lg:px-8">
      {/* Background with subtle grid pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-slate-700/25" />

      {/* Animated gradient orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header with animated badge */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-4 h-4" />
            <span>Most Popular Tools</span>
          </div>

          <Heading
            title="Powerful Utilities at Your Fingertips"
            align="center"
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
          />

          <p className="mt-4 text-lg text-gray-600 max-w-2xl">
            Discover our most loved tools that developers and creators use every day to boost their productivity.
          </p>
        </div>

        {/* Grid with modern cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {data.map((tool, index) => {
            const isActive = activeId === tool.id;
            const gradientClass = getGradientByIndex(index);

            return (
              <Link
                key={tool.id}
                href={tool.route ?? "#"}
                onMouseEnter={() => setActiveId(tool.id)}
                onMouseLeave={() => setActiveId(null)}
                aria-label={`Open ${tool.name}`}
                className="group relative"
              >
                {/* Card with glass morphism effect */}
                <div className="relative h-full rounded-3xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden">

                  {/* Animated gradient border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-x-[-100%] group-hover:translate-x-[100%] rotate-12" />

                  {/* Top gradient bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientClass} transform origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100`} />

                  {/* Content */}
                  <div className="relative p-6 flex flex-col h-full">
                    {/* Icon placeholder - you can add dynamic icons based on tool type */}
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradientClass} p-2.5 mb-4 shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                      <Code2 className="w-full h-full text-white" />
                    </div>

                    {/* Title and arrow */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                        {tool.urlName}
                      </h3>
                      <ArrowUpRight className={`h-5 w-5 text-gray-400 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${isActive ? "text-indigo-600" : ""
                        }`} />
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
                      {tool.des || "Transform and optimize your data with our powerful tool."}
                    </p>

                    {/* Keywords/tags */}
                    {tool.keyword && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tool.keyword.split(',').slice(0, 2).map((keyword, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                          >
                            {keyword.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer with CTA */}
                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-100">
                      <span className="text-xs font-medium text-gray-400">
                        Free tool
                      </span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 ${isActive
                          ? `bg-gradient-to-r ${gradientClass} text-white shadow-lg`
                          : "bg-gray-100 text-gray-700 group-hover:bg-gray-200"
                        }`}>
                        {isActive && <Zap className="w-3 h-3" />}
                        {isActive ? "Try now" : "Use tool"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

       
      </div>

      {/* Add animation keyframes to your global CSS */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}