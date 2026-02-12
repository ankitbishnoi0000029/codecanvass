'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Menu, Trash2Icon, ExternalLink, FolderCodeIcon, Loader2 } from 'lucide-react';
import { addNewRecord, getTableData, updateRecord } from '@/actions/dbAction';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { fromDataType, MetaData } from '@/utils/types/uiTypes';
import { categories } from '@/utils/consitants/consitaint';
import Link from 'next/link';
import { toast } from 'sonner';

interface Tool {
  id: number;
  url_id: string;
  name: string;
  url: string;
  des: string;
  keyword: string;
  category: string;
}

export default function AdminPanel() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    getDetails('popular');
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  /* ===================== STATE ===================== */
  const [tools, setTools] = useState<fromDataType[]>([]);

  const [activeCategory, setActiveCategory] = useState('Header');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<string>();
  const [searchTerm, setSearchTerm] = useState('');
  const [metadata, setMata] = useState<MetaData>();
  const [formData, setFormData] = useState<fromDataType>();
  const [loading, setLoading] = useState<boolean>();

  /* ===================== HELPERS ===================== */
  const openModal = (tool?: fromDataType) => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setFormData({
      id: undefined,
      url_id: '',
      name: '',
      urlName: '',
      des: '',
      keyword: '',
      category: '',
      metaData: '',
      route: '',
      url: '',
    });
    setMata({
      title: '',
      description: '',
      keywords: '',
    });
    setMode('');
    setIsModalOpen(false);
  };
  console.log(formData);
  const handleSubmit = async () => {
    setLoading(true);
    const updatedFormData = {
      ...formData,
      metaData: metadata,
    };
    let result;
    if (mode === 'edit') {
      result = await updateRecord(updatedFormData.url_id, updatedFormData);
    } else {
      result = await addNewRecord(updatedFormData);
    }
    if (result.success) {
      toast.success(result.message);
      closeModal();
      setLoading(false);
    } else {
      toast.error(result.message);
      setLoading(false);
    }
    await getTableData(updatedFormData.category);
  };
  // updateRecord(updatedFormData.url_id, updatedFormData)
  const filteredTools = tools.filter(
    (t) =>
      (activeCategory === 'all' || t.category === activeCategory) &&
      ((t.name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        (t.url_id?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        (t.des?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()))
  );
  // console.log(filteredTools);
  const getDetails = async (id: string) => {
    setActiveCategory(id);
    const data = await getTableData(id);
    // Ensure data is an array (handle QueryResult/OkPacket case)
    const arr = Array.isArray(data) ? data : [];
    // Map database result to Tool[]
    const mappedTools: Tool[] = arr.map((item: any) => ({
      id: item.id,
      url_id: item.url_id,
      urlName: item.urlName,
      name: item.name || '',
      url: item.route,
      des: item.des,
      keyword: item.keyword,
      metaData: item.metadata,
      category: id === 'all' ? 'developerTools' : id,
    }));
    setTools(mappedTools);
    // console.log(mappedTools);
  };
  const getMeta = (metaData?: string | any) => {
    if (!metaData) return null;

    if (typeof metaData === 'string') {
      try {
        return JSON.parse(metaData);
      } catch {
        return null;
      }
    }

    return metaData;
  };

  const handleEdit = (tooldata: fromDataType) => {
    setMode('edit');
    openModal();
    let data = getMeta(tooldata.metaData);
    setMata(data);
    setFormData(tooldata);
  };
  const handleAdd = () => {
    setMode('add');
    // Initialize form data for adding new tool
    setFormData({
      id: undefined,
      url_id: '',
      name: '',
      urlName: '',
      des: '',
      keyword: '',
      category: '',
      metaData: '',
      route: '',
      url: '',
    });
    setMata({
      title: '',
      description: '',
      keywords: '',
    });
    openModal();
  };
  // const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name || id;
  const generateRandomId = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  /* ===================== UI ===================== */
  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-black text-gray-900 dark:text-gray-100"
      suppressHydrationWarning={true}
    >
      {/* ===================== SIDEBAR ===================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-black border-r dark:border-slate-800 transform transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6 border-b dark:border-slate-800 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          <p className="text-blue-100 text-sm">Tool Manager</p>
        </div>

        <nav className="p-4 p-y-2 space-y-1">
          {categories.map((cat) => {
            // const Icon =                                                                                                                                                                          cat.icon;
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                // onClick={() => setActiveCategory(cat.id)}
                onClick={() => getDetails(cat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition hover:cursor-pointer text-sm font-bold
                  ${active ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
              >
                {/* <FingerprintIcon /> */}
                {cat.name}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ===================== MAIN ===================== */}
      <div className="lg:ml-64">
        {/* HEADER */}
        <div className="sticky top-0 z-30 bg-white dark:bg-black border-b dark:border-slate-800 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden">
              <Menu />
            </button>
            {/* <h1 className="text-2xl font-bold">
              {getCategoryName(activeCategory)}
            </h1> */}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button
              onClick={() => handleAdd()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
            >
              <Plus size={18} /> Add Tool
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                className="group relative overflow-hidden rounded-2xl
      bg-white dark:bg-slate-900
      border border-slate-200 dark:border-slate-800
      shadow-sm hover:shadow-xl hover:-translate-y-1
      transition-all duration-300"
              >
                {/* Hover gradient */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition
        bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5"
                />

                {/* ACTIONS */}
                <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleEdit(tool)}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white hover:cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-red-600 hover:text-white hover:cursor-pointer">
                    <Trash2Icon className="w-4 h-4" />
                  </button>
                </div>

                {/* CONTENT */}
                <div className="relative p-5 space-y-4">
                  {/* TOOL INFO */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {tool.name || tool.urlName}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {tool.des}
                    </p>

                    <div className="mt-2 text-xs text-slate-400">
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tool.keyword.split(',').map((keyword: string, i: number) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 text-sm rounded-lg
                                  bg-emerald-300 text-slate-900 italic
                                  transition"
                          >
                            {keyword.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SEO INFO */}
                  {(() => {
                    const meta = getMeta(tool.metaData);

                    if (!meta) return null;

                    return (
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 space-y-1">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          SEO Metadata
                        </h4>

                        {meta.title && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            <span className="font-medium">Title:</span> {meta.title}
                          </p>
                        )}

                        {meta.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            <span className="font-medium">Description:</span> {meta.description}
                          </p>
                        )}
                        {meta.keywords && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {meta.keywords.split(',').map((keyword: string, i: number) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 text-xs rounded-lg
                                  bg-green-100 text-slate-700 font-mono
                                  transition"
                              >
                                {keyword.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* FOOTER */}
                <div className="relative px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    {tool.category}
                  </span>
                  <span className="text-xs text-slate-400">ID: {tool.url_id}</span>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Link
                    </span>

                    <Link
                      href={(tool.route ?? tool.url) as string}
                      target="_blank"
                      className="group inline-flex items-center gap-2
      px-3 py-1.5 rounded-lg
      bg-slate-100 dark:bg-slate-800
      text-sm text-blue-600 dark:text-blue-400
      hover:bg-blue-50 dark:hover:bg-blue-900/30
      transition"
                    >
                      <span className="truncate max-w-[200px]">{tool.route ?? tool.url}</span>

                      <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===================== MODAL ===================== */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {/* HEADER */}
          <div className="p-6 rounded-t-lg border-b-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {mode == 'edit' ? (
                  <>
                    <Edit2 /> Edit Tool
                  </>
                ) : (
                  <>
                    <FolderCodeIcon /> Add New Tools
                  </>
                )}
              </DialogTitle>
            </div>
          </div>

          {/* BODY */}
          <div className="p-6 pt-0 space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>

              <Select
                disabled={mode === 'edit'}
                value={formData?.category ?? ''}
                onValueChange={(value) =>
                  setFormData((prev: any) => ({ ...(prev ?? { category: 4 }), category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>

                <SelectContent>
                  {categories
                    .filter((cat) => cat.id !== 'all')
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* <div>
              <label className="block text-sm font-semibold mb-2">Unique ID</label>
              <Input
                placeholder="e.g., ip-01"
                value={formData?.url_id}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    url_id: e.target.value,
                  }))
                }
              />
              
            </div> */}

            <div>
              <label className="block text-sm font-semibold mb-2">Unique ID</label>

              <div className="flex gap-2">
                <Input
                  disabled={mode === 'edit'}
                  placeholder="e.g., ip-01"
                  value={formData?.url_id}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      url_id: e.target.value,
                    }))
                  }
                />
                {mode !== 'edit' ? (
                  <Button
                    type="button"
                    disabled={mode === 'edit'}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() =>
                      setFormData((prev: any) => ({
                        ...prev,
                        url_id: generateRandomId(10),
                      }))
                    }
                  >
                    Generate
                  </Button>
                ) : (
                  ''
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Name</label>
              <Input
                placeholder="e.g., IP Tools"
                value={formData?.urlName ?? ''}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    urlName: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">URL</label>
              <Input
                placeholder="e.g., developmenttool/ip-tools"
                value={formData?.route || formData?.url}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    route: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <Textarea
                rows={2}
                placeholder="Brief description of the tool..."
                value={formData?.des}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    des: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Keywords</label>
              <Input
                placeholder="e.g., ip address, lookup, network"
                value={formData?.keyword}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    keyword: e.target.value,
                  }))
                }
              />
            </div>
            <div className="pt-4 border-t-2 border-dashed space-y-4">
              <h5 className="text-sm font-bold text-center">SEO Meta Data</h5>

              {/* TITLE */}
              <div>
                <label className="block text-sm font-semibold mb-2">Title</label>
                <Input
                  value={metadata?.title ?? ''}
                  placeholder="e.g., developmenttool/ip-tools"
                  onChange={(e) =>
                    setMata((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <Textarea
                  rows={2}
                  value={metadata?.description ?? ''}
                  placeholder="Brief description of the tool..."
                  onChange={(e) =>
                    setMata((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              {/* KEYWORDS (TAG INPUT) */}
              <div>
                <label className="block text-sm font-semibold mb-2">Keywords</label>

                <div className="flex flex-wrap gap-2 p-2 border rounded-lg">
                  <Input
                    placeholder=" keyword ,"
                    value={metadata?.keywords}
                    onChange={(e) =>
                      setMata((prev) => ({
                        ...prev,
                        keywords: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSubmit} className="flex-1 cursor-pointer " disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : mode === 'edit' ? (
                  'Update Tool'
                ) : (
                  'Create Tool'
                )}
              </Button>

              <Button variant="secondary" className="flex-1" onClick={closeModal}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
