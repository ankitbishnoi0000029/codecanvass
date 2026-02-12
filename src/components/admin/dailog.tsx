'use client';

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2Icon,
  Menu,
  ExternalLink,
} from 'lucide-react';
import { addNewRecord, getTableData } from '@/actions/dbAction';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { categories } from '@/utils/consitants/consitaint';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

/* ===================== TYPES ===================== */
export interface fromDataType {
  id?: number;
  url_id: string;
  urlName: string;
  route: string;
  url?: string;
  name?: string;
  des: string;
  keyword: string;
  category: string;
  metaData?: string;
}

/* ===================== COMPONENT ===================== */
export default function AdminPanel() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [tools, setTools] = useState<fromDataType[]>([]);
  const [activeCategory, setActiveCategory] = useState('Header');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');

  /* ===================== FORM ===================== */
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<fromDataType>({
    defaultValues: {
      url_id: '',
      urlName: '',
      route: '',
      des: '',
      keyword: '',
      category: '',
      metaData: '',
    },
  });

  /* ===================== THEME ===================== */
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark';
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle('dark', saved === 'dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  /* ===================== HELPERS ===================== */
  const getMeta = (meta?: string) => {
    if (!meta) return null;
    try {
      return JSON.parse(meta);
    } catch {
      return null;
    }
  };

  const metaValue = watch('metaData');
  const parsedMeta = getMeta(metaValue) ?? {};

  /* ===================== CRUD ===================== */
  const openModal = () => {
    setMode('add');
    reset();
    setIsModalOpen(true);
  };

  const handleEdit = (tool: fromDataType) => {
    setMode('edit');
    reset(tool);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    reset();
    setIsModalOpen(false);
  };

  const onSubmit = async (data: fromDataType) => {
    await addNewRecord(data);
    closeModal();
    getDetails(activeCategory);
  };

  const getDetails = async (id: string) => {
    setActiveCategory(id);
    const res = await getTableData(id);
    const arr = Array.isArray(res) ? res : [];

    setTools(
      arr.map((item: any) => ({
        id: item.id,
        url_id: item.url_id,
        urlName: item.urlName,
        route: item.route,
        des: item.des,
        keyword: item.keyword,
        category: id,
        metaData: item.metadata,
      }))
    );
  };

  /* ===================== UI ===================== */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-gray-900 dark:text-gray-100">
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white dark:bg-black border-b px-6 py-4 flex justify-between">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden">
          <Menu />
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="px-3 py-2 rounded bg-gray-100 dark:bg-slate-800"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <button
            onClick={openModal}
            className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2"
          >
            <Plus size={18} /> Add Tool
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <div key={tool.id} className="bg-white dark:bg-slate-900 rounded-2xl border p-5">
            <div className="flex justify-between">
              <h3 className="font-semibold">{tool.urlName}</h3>
              <button onClick={() => handleEdit(tool)}>
                <Edit2 size={16} />
              </button>
            </div>

            <p className="text-sm mt-2">{tool.des}</p>

            <div className="flex gap-2 mt-3 flex-wrap">
              {tool.keyword.split(',').map((k, i) => (
                <span key={i} className="bg-emerald-300 px-2 py-1 text-xs rounded">
                  {k.trim()}
                </span>
              ))}
            </div>

            {parsedMeta && (
              <div className="mt-4 bg-slate-100 dark:bg-slate-800 p-3 rounded">
                <p className="text-xs font-semibold">SEO Metadata</p>
              </div>
            )}

            <Link
              href={tool.route}
              target="_blank"
              className="inline-flex items-center gap-2 mt-3 text-blue-500 text-sm"
            >
              {tool.route} <ExternalLink size={14} />
            </Link>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <DialogTitle>{mode === 'edit' ? 'Edit Tool' : 'Add Tool'}</DialogTitle>

            <Select onValueChange={(v) => setValue('category', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.filter((c) => c.id !== 'all').map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input placeholder="Unique ID" {...register('url_id', { required: true })} />
            <Input placeholder="Name" {...register('urlName', { required: true })} />
            <Input placeholder="Route" {...register('route', { required: true })} />
            <Textarea placeholder="Description" {...register('des')} />
            <Input placeholder="Keywords" {...register('keyword')} />

            {/* SEO (UNCHANGED UI) */}
            <Input
              placeholder="SEO Title"
              value={parsedMeta.title ?? ''}
              onChange={(e) =>
                setValue(
                  'metaData',
                  JSON.stringify({ ...parsedMeta, title: e.target.value })
                )
              }
            />

            <Textarea
              placeholder="SEO Description"
              value={parsedMeta.description ?? ''}
              onChange={(e) =>
                setValue(
                  'metaData',
                  JSON.stringify({ ...parsedMeta, description: e.target.value })
                )
              }
            />

            <Button type="submit" disabled={isSubmitting}>
              {mode === 'edit' ? 'Update' : 'Create'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
