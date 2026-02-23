'use client';

import React, { useEffect, useState } from 'react';
import {
  addNewRecord,
  deleteRecord,
  getTableData,
  updateRecord,
  userlogout,
} from '@/actions/dbAction';
import { fromDataType, MetaData } from '@/utils/types/uiTypes';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '../sections/admin/sidebar';
import { AdminList } from '../sections/admin/list';
import { Dialog } from '../ui/dialog';
import { AdminForm } from '../sections/admin/form';
import { AdminHeader } from '../sections/admin/header';

const EMPTY_META: MetaData = {
  title: '',
  description: '',
  keywords: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  ogType: 'website',
  ogUrl: '',
  pageContent: '',
  imageAlt: '',
  imageFileName: '',
  urlSlug: '',
};

const EMPTY_FORM: fromDataType = {
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
};

export default function AdminPanel() {
  /* ── THEME ── */
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  /* ── STATE ── */
  const [tools, setTools]               = useState<fromDataType[]>([]);
  const [fetching, setFetching]         = useState(false);
  const [activeCategory, setActiveCategory] = useState('popular');
  const [isSidebarOpen, setIsSidebarOpen]   = useState(false);
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [mode, setMode]                 = useState<'add' | 'edit' | ''>('');
  const [searchTerm, setSearchTerm]     = useState('');
  const [metadata, setMata]             = useState<MetaData>(EMPTY_META);
  const [formData, setFormData]         = useState<fromDataType>(EMPTY_FORM);
  const [loading, setLoading]           = useState(false);
  const [cateID, setCateID]             = useState('popular');

  const router = useRouter();

  /* ── INIT ── */
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
    getDetails('popular');
  }, []);

  /* ── DATA ── */
  const getDetails = async (id: string) => {
    setFetching(true);
    try {
      const data = await getTableData(id);
      const arr  = Array.isArray(data) ? data : [];
      const mappedTools: fromDataType[] = arr.map((item: any) => ({
        id:        item.id,
        url_id:    item.url_id,
        name:      item.name      || '',
        urlName:   item.urlName   || '',
        des:       item.des       || '',
        keyword:   item.keyword   || '',
        category:  item.category  || id,
        metaData:  item.metadata  || '',
        route:     item.route     || '',
        url:       item.url       || '',
      }));
      setTools(mappedTools);
    } finally {
      setFetching(false);
    }
  };

  /* ── HELPERS ── */
  const getMeta = (metaData?: string | any): MetaData | null => {
    if (!metaData) return null;
    if (typeof metaData === 'string') {
      try { return JSON.parse(metaData); } catch { return null; }
    }
    return metaData;
  };

  const generateRandomId = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
  };

  /* ── MODAL ── */
  const openModal  = () => setIsModalOpen(true);
  const closeModal = () => {
    setFormData(EMPTY_FORM);
    setMata(EMPTY_META);
    setMode('');
    setIsModalOpen(false);
  };

  /* ── CRUD ── */
  const handleAdd = () => {
    setMode('add');
    setFormData(EMPTY_FORM);
    setMata(EMPTY_META);
    openModal();
  };

  const handleEdit = (tooldata: fromDataType) => {
    setMode('edit');
    const parsed = getMeta(tooldata.metaData);
    setMata(parsed ? { ...EMPTY_META, ...parsed } : EMPTY_META);
    setFormData(tooldata);
    openModal();
  };

  const handleSubmit = async () => {
    setLoading(true);
    const updatedFormData = { ...formData, metaData: JSON.stringify(metadata) };
    const result =
      mode === 'edit'
        ? await updateRecord(updatedFormData.url_id, updatedFormData)
        : await addNewRecord(updatedFormData);

    if (result.success) {
      toast.success(result.message);
      closeModal();
      await getDetails(updatedFormData.category ?? cateID);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, table: string) => {
    if (!confirm('Are you sure you want to delete this tool?')) return;
    setLoading(true);
    const result = await deleteRecord(id, table);
    if (result.success) {
      toast.success(result.message);
      await getDetails(table);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleSelect = (id: string) => {
    setCateID(id);
    setActiveCategory(id);
    getDetails(id);
  };

  const logout = async () => {
    if (!confirm('Are you sure you want to logout?')) return;
    const result = await userlogout();
    if (result.success) {
      toast.success(result.message);
      router.replace('/login');
    } else {
      toast.error(result.message);
    }
  };

  /* ── FILTERED LIST ── */
  const filteredTools = tools.filter(
    (t) =>
      (t.name?.toLowerCase()   ?? '').includes(searchTerm.toLowerCase()) ||
      (t.url_id?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (t.des?.toLowerCase()    ?? '').includes(searchTerm.toLowerCase())
  );

  /* ── UI ── */
  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-black text-gray-900 dark:text-gray-100"
      suppressHydrationWarning
    >
      <AdminSidebar
        setCateID={handleSelect}
        isSidebarOpen={isSidebarOpen}
        activeCategory={activeCategory}
      />

      <div className="lg:ml-64">
        <AdminHeader
          theme={theme}
          toggleTheme={toggleTheme}
          onAdd={handleAdd}
          onLogout={logout}
          onMenuToggle={() => setIsSidebarOpen((o) => !o)}
        />

        <AdminList
          data={filteredTools}
          fetching={fetching}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <AdminForm
            mode={mode}
            formData={formData}
            metadata={metadata}
            loading={loading}
            setFormData={setFormData}
            setMata={setMata}
            handleSubmit={handleSubmit}
            closeModal={closeModal}
            generateRandomId={generateRandomId}
          />
        </Dialog>
      </div>
    </div>
  );
}