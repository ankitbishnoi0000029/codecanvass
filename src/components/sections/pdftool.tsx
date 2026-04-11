// app/pdf-tools/page.tsx (or your route)
'use client';

import { getTableData } from '@/actions/dbAction';
import React, { useState, useEffect, useMemo } from 'react';
import { SearchCode, X, FileUp, Check, Loader2 } from 'lucide-react';
import ContentSection from '../ui/content';
import Head from 'next/head';
import Script from 'next/script';

// ==================== Type Definitions ====================
interface PDFToolRow {
  id: number;
  url_id: string;
  urlName: string;
  des: string;
  keyword: string | null;
  route: string;
  slug: string;
  icon: string | null;
  category: string;
  cat_color: string;
  accept: string;
  multiple: number; // 0 or 1
}

interface Tool {
  id: number;
  name: string;
  desc: string;
  keyword: string | null;
  route: string;
  slug: string;
  icon: string | null;
  category: string;
  catColor: string;
  accept: string;
  multiple: boolean;
}

interface CategoryGroup {
  name: string;
  color: string;
  tools: Tool[];
}

// ==================== Helper Functions ====================
function rowToTool(row: PDFToolRow): Tool {
  return {
    id: row.id,
    name: row.urlName,
    desc: row.des,
    keyword: row.keyword,
    route: row.route,
    slug: row.slug,
    icon: row.icon,
    category: row.category,
    catColor: row.cat_color,
    accept: row.accept,
    multiple: row.multiple === 1,
  };
}

function groupByCategory(tools: Tool[]): CategoryGroup[] {
  const map = new Map<string, Tool[]>();
  for (const tool of tools) {
    if (!map.has(tool.category)) map.set(tool.category, []);
    map.get(tool.category)!.push(tool);
  }
  return Array.from(map.entries()).map(([name, tools]) => ({
    name,
    color: tools[0]?.catColor || '#374151',
    tools,
  }));
}

// ==================== Modern Tool Card Component ====================
const ToolCard = ({ tool }: { tool: Tool }) => {
  // Generate a nice gradient based on category color
  const gradientFrom = tool.catColor;
  const gradientTo = tool.catColor + 'cc';

  return (
    <a
      href={`/pdf-tool${tool.route}`}
      className="group relative block bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-transparent"
    >
      {/* Animated gradient border on hover */}
      <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
           style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }} />
      
      <div className="relative p-5 h-full flex flex-col bg-white dark:bg-gray-800 rounded-2xl group-hover:bg-gray-50 dark:group-hover:bg-gray-800/80 transition-colors">
        {/* Icon / Emoji fallback */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl mb-4 shadow-sm"
             style={{ background: `linear-gradient(135deg, ${tool.catColor}20, ${tool.catColor}40)` }}>
          {tool.icon ? (
            <span dangerouslySetInnerHTML={{ __html: tool.icon }} />
          ) : (
            <span className="text-2xl">📄</span>
          )}
        </div>

        {/* Title & multiple badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
            {tool.name}
          </h3>
          {tool.multiple && (
            <span className="flex-shrink-0 text-xs font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
              Multi
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 line-clamp-2 flex-grow">
          {tool.desc}
        </p>

        {/* Accept badge (file types) */}
        {tool.accept && (
          <div className="mt-3 flex flex-wrap gap-1">
            <span className="text-[10px] font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-md">
              {tool.accept.split(',').slice(0, 2).join(', ')}{tool.accept.split(',').length > 2 ? '…' : ''}
            </span>
          </div>
        )}

        {/* Hover arrow */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </a>
  );
};

// ==================== Skeleton Loader ====================
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 animate-pulse">
    <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 mb-4" />
    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
  </div>
);

// ==================== Main Component ====================
interface PDFToolAppProps {
  data?: any; // for ContentSection, keep as is
}

export default function PDFToolApp({ data }: PDFToolAppProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // console.log('PDFToolApp rendered with data:', data);
  // Fetch data
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const rows = (await getTableData('pdf')) as PDFToolRow[];
        const mapped = rows.map(rowToTool);
        setTools(mapped);
        
        // Set document title and meta description from first tool's keyword? Or generic
        if (rows.length > 0) {
          const keywords = rows.map(r => r.keyword).filter(Boolean).join(', ');
          document.querySelector('meta[name="keywords"]')?.setAttribute('content', keywords);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load tools. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, []);

  // Memoized categories & filtered tools
  const categories = useMemo(() => groupByCategory(tools), [tools]);
  
  const filteredTools = useMemo(() => {
    if (search.trim()) {
      const term = search.toLowerCase();
      return tools.filter(t => 
        t.name.toLowerCase().includes(term) ||
        t.desc.toLowerCase().includes(term) ||
        (t.keyword && t.keyword.toLowerCase().includes(term))
      );
    }
    if (activeCategory === 'All') return tools;
    return tools.filter(t => t.category === activeCategory);
  }, [tools, search, activeCategory]);

  // Clear search
  const clearSearch = () => {
    setSearch('');
    setActiveCategory('All');
  };


  return (
    <>
     
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-700 text-white py-16 px-4">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="relative max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-lg">
              Every tool for PDFs & files
            </h1>
            <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
              60+ browser‑based tools. PDF, Excel, images, translation & more.
              <br className="hidden sm:block" /> No upload. No account. 100% free.
            </p>
            <div className="relative max-w-md mx-auto">
              <SearchCode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300" />
              <input
                type="text"
                placeholder="Search tools by name, description or keyword..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setActiveCategory('All');
                }}
                className="w-full pl-12 pr-10 py-3 rounded-full border-0 shadow-lg bg-white/20 dark:bg-gray-800/50 backdrop-blur-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white transition"
                aria-label="Search tools"
              />
              {search && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide" role="tablist">
              {['All', ...categories.map(c => c.name)].map(cat => {
                const catColor = cat === 'All' 
                  ? '#4f46e5' 
                  : categories.find(c => c.name === cat)?.color || '#4f46e5';
                const isActive = !search && activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setSearch('');
                    }}
                    role="tab"
                    aria-selected={isActive}
                    className={`relative px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      isActive 
                        ? 'text-white shadow-md' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    style={{ backgroundColor: isActive ? catColor : 'transparent' }}
                  >
                    {cat}
                    <span className="ml-1.5 text-xs opacity-70">
                      {cat === 'All' ? tools.length : categories.find(c => c.name === cat)?.tools.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">⚠️</div>
              <div className="text-red-500 dark:text-red-400 font-medium text-lg">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700 transition"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {search && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Found {filteredTools.length} result{filteredTools.length !== 1 && 's'} for “{search}”
                </div>
              )}

              {!search && activeCategory === 'All' ? (
                categories.map(cat => (
                  <section key={cat.name} className="mb-12">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-1.5 h-7 rounded-full" style={{ background: cat.color }} />
                      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{cat.name}</h2>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                        {cat.tools.length} tools
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {cat.tools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
                    </div>
                  </section>
                ))
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
                </div>
              )}

              {filteredTools.length === 0 && (
                <div className="text-center py-24">
                  <div className="text-6xl mb-4">🔍</div>
                  <div className="text-gray-400 dark:text-gray-500 font-medium text-lg">
                    No tools found for “{search}”
                  </div>
                  <button
                    onClick={clearSearch}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700 transition"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Additional Content Section (preserved) */}
        <ContentSection data={data} />
      </main>
    </>
  );
}