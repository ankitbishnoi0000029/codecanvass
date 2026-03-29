'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Edit2Icon,
  FolderCodeIcon,
  Loader2Icon,
  Globe,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';

import { getPageContent, UpdatePageContent } from '@/actions/dbAction';
import { toast } from 'sonner';

/* ---------------- DEFAULT FORM ---------------- */
const defaultForm = {
  urlName: '',
  pageContent: '',
  bottom_des: '',
  faq: [],
  image: '',
  imagePreview: '',
};

/* ---------------- SECTION ---------------- */
const SectionHeading = ({ icon: Icon, label }: any) => (
  <div className="flex items-center gap-2 pt-5 pb-1 border-t-2 border-dashed">
    <Icon className="w-4 h-4 text-blue-500" />
    <h5 className="text-sm font-bold">{label}</h5>
  </div>
);

export const ClassicEditor = ({ url_id, table, mode, closeModal }: any) => {
  /* ---------------- STATE ---------------- */
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(defaultForm);

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      if (!url_id || !table) return;

      try {
        const res = await getPageContent(table, url_id);

        // 👇 handle all possible API shapes

        setFormData(res.data);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    fetchData();
  }, [url_id, table]);
  console.log('DATA 👉', formData);

  /* ---------------- HANDLER ---------------- */
  const meta = (key: string) => (e: any) =>
    setFormData((prev: any) => ({
      ...prev,
      [key]: e.target.value,
    }));

  /* ---------------- FAQ ---------------- */
  const addFaq = () => {
    setFormData((prev: any) => ({
      ...prev,
      faq: [...(prev.faq || []), { question: '', answer: '' }],
    }));
  };
  const addCode = () => {
    setFormData((prev: any) => ({
      ...prev,
      code: [...(prev.code || []), { code: '' }],
    }));
  };

  const removecode = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      code: prev.code.filter((_: any, i: number) => i !== index),
    }));
  };
  const updateCode = (index: number, key: string, value: string) => {
    setFormData((prev: any) => {
      const updated = [...(prev.code || [])];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, code: updated };
    });
  };

  const addContent = () => {
    setFormData((prev: any) => ({
      ...prev,
      content: [...(prev.content || []), { heading: '', content: '' }],
    }));
  };
  const updateFaq = (index: number, key: string, value: string) => {
    setFormData((prev: any) => {
      const updated = [...(prev.faq || [])];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, faq: updated };
    });
  };
  const updateContent = (index: number, key: string, value: string) => {
    setFormData((prev: any) => {
      const updated = [...(prev.content || [])];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, content: updated };
    });
  };
  const removeFaq = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      faq: prev.faq.filter((_: any, i: number) => i !== index),
    }));
  };
  const removeContent = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      content: prev.content.filter((_: any, i: number) => i !== index),
    }));
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    setLoading(true);

    try {
      const payload = {
        url_id,
        table,
        data: {
          ...formData,
          image: formData.imageFile || formData.image, // handle old + new
        },
      };

      console.log('SUBMIT 👉', payload);

      const res = await UpdatePageContent(table, url_id, payload.data);

      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error('Update failed');
      }

      closeModal?.();
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  /* ---------------- UI ---------------- */
  return (
    <DialogContent className="min-w-4xl max-h-[90vh] overflow-y-auto p-0">
      {/* HEADER */}
      <div className="p-6 border-b-2">
        <DialogTitle className="text-2xl font-bold flex gap-2">
          <Edit2Icon /> Page Content Editor
        </DialogTitle>
      </div>

      <div className="p-6 space-y-4">
        {/* BASIC */}
        <SectionHeading icon={FileText} label="Basic Info" />
        <SectionHeading icon={FileText} label="Title" />
        <Input disabled value={formData?.urlName || ''} />
        <SectionHeading icon={FileText} label="Route" />

        <Input disabled value={formData?.route || ''} />

        <SectionHeading icon={FileText} label="Keywords" />
        <Textarea value={formData?.keyword || ''} onChange={meta('keyword')} rows={2} />
        {/* CONTENT */}
        <SectionHeading icon={Globe} label="Page Descriptions top " />

        <Textarea
          rows={4}
          placeholder="Top Description"
          value={formData?.des || ''}
          onChange={meta('des')}
        />
        <SectionHeading icon={Globe} label="Page Descriptions bottom " />

        <Textarea
          rows={4}
          placeholder="Bottom Description"
          value={formData?.bottom_des || ''}
          onChange={meta('bottom_des')}
        />

        {/* FAQ */}
        <SectionHeading icon={FileText} label="FAQs" />
        {(formData?.faq || []).map((item: any, index: number) => (
          <div key={index} className="border p-3 rounded space-y-2">
            <Input
              className="text-red-700 text-sm"
              placeholder="Question"
              value={item.question || ''}
              onChange={(e) => updateFaq(index, 'question', e.target.value)}
            />
            <Textarea
              className="text-green-600 text-sm"
              placeholder="Answer"
              value={item.answer || ''}
              onChange={(e) => updateFaq(index, 'answer', e.target.value)}
            />
            <Button variant="destructive" onClick={() => removeFaq(index)}>
              Remove
            </Button>
          </div>
        ))}

        <Button onClick={addFaq}>+ Add FAQ</Button>

        {/* Page content */}
        <SectionHeading icon={FileText} label="Page Content" />
        {(formData?.content || []).map((item: any, index: number) => (
          <div key={index} className="border p-3 rounded space-y-2">
            <SectionHeading icon={FileText} label="Sub Heading content" />
            <Input
              className="font-bold"
              placeholder="heading"
              value={item.heading || ''}
              onChange={(e) => updateContent(index, 'heading', e.target.value)}
            />
            <SectionHeading icon={FileText} label="Content" />
            <Textarea
              placeholder="content"
              value={item.content || ''}
              onChange={(e) => updateContent(index, 'content', e.target.value)}
            />
            <Button variant="destructive" onClick={() => removeContent(index)}>
              Remove
            </Button>
          </div>
        ))}

        <Button onClick={addContent}>+ Add Section</Button>

        {/* Page content */}
        <SectionHeading icon={FileText} label="Code and Other Content" />
        {(formData?.code || []).map((item: any, index: number) => (
          <div key={index} className="border p-3 rounded space-y-2">
            <Textarea
              placeholder="code or content"
              value={item.code || ''}
              onChange={(e) => updateCode(index, 'code', e.target.value)}
            />
            <Button variant="destructive" onClick={() => removecode(index)}>
              Remove
            </Button>
          </div>
        ))}

        <Button onClick={addCode}>+ Add Code or Content</Button>

        {/* ACTIONS */}
        <div className="flex gap-2 pt-4 ">
          <Button onClick={handleSubmit} disabled={loading} className="w-1/2">
            {loading ? <Loader2Icon className="animate-spin" /> : 'Submit'}
          </Button>

          <Button variant="secondary" onClick={closeModal} className="w-1/2">
            Cancel
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};
