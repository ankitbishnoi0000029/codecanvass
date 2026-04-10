// @ts-nocheck
'use client';
import { getTableData } from '@/actions/dbAction';
import React, { useState, useEffect } from 'react';
import { ToolCard } from './pdf/card'; // your existing card optional – install if missing
import { SearchCode } from 'lucide-react';
import ContentSection from '../ui/content';

// Helper: convert DB row → tool object
function rowToTool(row) {
  return {
    id: row.tool_id,
    name: row.name,
    desc: row.description,
    icon: row.icon,
    route: row.route,
    category: row.category,
    catColor: row.cat_color,
    accept: row.accept ?? null,
    multiple: !!row.multiple,
  };
}

// Helper: group tools by category, preserving DB order
function groupByCategory(tools) {
  const map = new Map();
  for (const t of tools) {
    if (!map.has(t.category)) map.set(t.category, []);
    map.get(t.category).push(t);
  }
  return Array.from(map.entries()).map(([name, tools]) => ({
    name,
    color: tools[0]?.catColor || '#374151',
    tools,
  }));
}

export default function PDFToolApp(data: any) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // MySQL state
  const [list, setList] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

  // Fetch all tool rows from the `pdf` table on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = (await getTableData('pdf')) as dataType[];
        setList(categoriesData);
      } catch (err) {
        setDbError('Failed to load tools from database.');
        console.error(err);
      } finally {
        setDbLoading(false);
      }
    };
    fetchData();
  }, []);

  const allTools = list.map(rowToTool);
  const categories = groupByCategory(allTools);

  // Filtered view (search or category)
  const filtered = search.trim()
    ? allTools.filter(
        (t) =>
          String(t.name ?? '')
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          String(t.desc ?? '')
            .toLowerCase()
            .includes(search.toLowerCase())
      )
    : activeCategory === 'All'
      ? allTools
      : allTools.filter((t) => t.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero with animated gradient and search */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-16 px-4">
        {/* Abstract decorative shapes */}
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

          {/* Modern search bar */}
          <div className="relative max-w-md mx-auto">
            <SearchCode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tools by name or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setActiveCategory('All'); // reset category when searching
              }}
              className="w-full pl-12 pr-4 py-3 rounded-full border-0 shadow-lg ring-1 ring-white/30 bg-white/20 backdrop-blur-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white transition"
            />
          </div>
        </div>
      </div>

      {/* Sticky category tabs – pill design with active colour */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
            {['All', ...categories.map((c) => c.name)].map((cat) => {
              const catColor =
                cat === 'All'
                  ? '#4f46e5' // indigo-600
                  : categories.find((c) => c.name === cat)?.color || '#4f46e5';
              const isActive = !search && activeCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setSearch('');
                  }}
                  className="relative px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 focus:outline-none"
                  style={{
                    backgroundColor: isActive ? catColor : 'transparent',
                    color: isActive ? '#fff' : '#374151',
                  }}
                >
                  {cat}
                  {!isActive && (
                    <span
                      className="absolute inset-0 rounded-full opacity-0 hover:opacity-10 transition-opacity"
                      style={{ backgroundColor: catColor }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tools grid area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {dbLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm font-medium">Loading tools from database…</p>
          </div>
        )}

        {dbError && !dbLoading && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">⚠️</div>
            <div className="text-red-500 font-medium text-lg">{dbError}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700 transition"
            >
              Try again
            </button>
          </div>
        )}

        {!dbLoading && !dbError && (
          <>
            {search && (
              <div className="text-sm text-gray-500 mb-4">
                {filtered.length} result{filtered.length !== 1 && 's'} for “{search}”
              </div>
            )}

            {!search && activeCategory === 'All' ? (
              // Grouped view by category
              categories.map((cat) => (
                <section key={cat.name} className="mb-12">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-1.5 h-7 rounded-full" style={{ background: cat.color }} />
                    <h2 className="text-xl font-bold text-gray-800">{cat.name}</h2>
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                      {cat.tools.length} tools
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {cat.tools.map((t) => (
                      <ToolCard key={t.id} tool={t} />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              // Filtered view (search or single category)
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filtered.map((t) => (
                  <ToolCard key={t.id} tool={t} />
                ))}
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">🔍</div>
                <div className="text-gray-400 font-medium text-lg">
                  No tools found for "{search}"
                </div>
                <button
                  onClick={() => setSearch('')}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700 transition"
                >
                  Clear search
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <ContentSection data={data?.data} />
    </div>
  );
}
