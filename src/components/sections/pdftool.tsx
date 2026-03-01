// @ts-nocheck
'use client';
import { getTableData } from '@/actions/dbAction';

import React, { useState, useRef, useEffect } from 'react';
import { ToolCard } from './pdf/card';

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

export default function App() {
  const [tool, setTool] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // ── MySQL-backed state ──────────────────────────────────────────────────────
  const [list, setList] = useState([]); // raw rows from getTableData('pdf')
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

  // Fetch all tool rows from the `pdf` MySQL table on mount.
  // Replace the mock getTableData below with your actual import/call.
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ── YOUR REAL CALL (uncomment when wired up) ──────────────────────
        // import { getTableData } from '@/lib/db';  // adjust path as needed
        const categoriesData = (await getTableData('pdf')) as dataType[];
        setList(categoriesData);

        // ─────────────────────────────────────────────────────────────────
      } catch (err) {
        setDbError('Failed to load tools from database.');
        console.error(err);
      } finally {
        setDbLoading(false);
      }
    };
    fetchData();
  }, []);

  // Convert raw DB rows → UI tool objects
  const allTools = list.map(rowToTool);

  // Group into categories preserving DB insertion order
  const categories = groupByCategory(allTools);

  // Filtered view for search / category tabs
  const filtered = search.trim()
    ? allTools.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.desc.toLowerCase().includes(search.toLowerCase())
      )
    : activeCategory === 'All'
      ? allTools
      : allTools.filter((t) => t.category === activeCategory);

  if (tool) return <ToolPage tool={tool} onBack={() => setTool(null)} />;

  return (
    <div className="min-h-screen bg-gray-500">
      {/* Hero */}
      <div
        className="text-white py-12 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 mb-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">
            Every tool for PDFs & files
          </h1>
          <p style={{ color: '#fecaca' }} className="text-lg">
            60+ browser-based tools. PDF, Excel, images, translation & more. No upload. No account.
            100% free.
          </p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="bg-white border-b border-gray-100 overflow-x-auto ">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 py-2 min-w-max">
            {['All', ...categories.map((c) => c.name)].map((cat) => {
              const catColor =
                cat === 'All'
                  ? '#374151'
                  : categories.find((c) => c.name === cat)?.color || '#374151';
              const isActive = !search && activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setSearch('');
                  }}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all cursor-pointer duration-200 hover:bg-gray-700  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:text-white"
                  style={isActive ? { background: catColor, color: '#fff' } : {  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tools */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading / error states */}
        {dbLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading tools from database…</p>
          </div>
        )}
        {dbError && !dbLoading && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">⚠️</div>
            <div className="text-red-500 font-medium">{dbError}</div>
          </div>
        )}

        {/* Normal render */}
        {!dbLoading && !dbError && (
          <>
            {search && (
              <div className="text-sm text-gray-400 mb-4">
                {filtered.length} results for "{search}"
              </div>
            )}

            {!search && activeCategory === 'All' ? (
              categories.map((cat) => (
                <div key={cat.name} className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 rounded-full" style={{ background: cat.color }} />
                    <h2 className="text-base font-bold text-gray-800">{cat.name}</h2>
                    <span className="text-xs text-gray-400">{cat.tools.length} tools</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {cat.tools.map((t) => (
                      <ToolCard key={t.id} tool={t} onClick={() => setTool(t)} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filtered.map((t) => (
                  <ToolCard key={t.id} tool={t} onClick={() => setTool(t)} />
                ))}
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <div className="text-gray-400 font-medium">No tools found for "{search}"</div>
                <button
                  onClick={() => setSearch('')}
                  className="mt-3 text-sm text-red-500 hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="text-center text-xs text-gray-300 py-8 border-t border-gray-100">
        All processing runs in your browser. Files never leave your device.
      </div>
    </div>
  );
}
