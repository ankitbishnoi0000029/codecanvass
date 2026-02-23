import { Button } from '@/components/ui/button';
import { DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Edit2Icon,
  FolderCodeIcon,
  Loader2Icon,
  Globe,
  FileText,
  Image,
  Link2,
  Share2,
} from 'lucide-react';
import { categories } from '@/utils/consitants/consitaint';
import { fromDataType, MetaData } from '@/utils/types/uiTypes';

interface AdminFormProps {
  mode: string | undefined;
  formData: fromDataType | undefined;
  metadata: MetaData;
  loading: boolean;
  setFormData: (fn: (prev: any) => any) => void;
  setMata: (fn: (prev: MetaData) => MetaData) => void;
  handleSubmit: () => void;
  closeModal: () => void;
  generateRandomId: (length?: number) => string;
}

/* ── small section heading ── */
const SectionHeading = ({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) => (
  <div className="flex items-center gap-2 pt-5 pb-1 border-t-2 border-dashed">
    <Icon className="w-4 h-4 text-blue-500" />
    <h5 className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</h5>
  </div>
);

export const AdminForm = ({
  mode,
  formData,
  metadata,
  loading,
  setFormData,
  setMata,
  handleSubmit,
  closeModal,
  generateRandomId,
}: AdminFormProps) => {
  /* helper so every setMata call stays short */
  const meta = (key: keyof MetaData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setMata((prev) => ({ ...prev, [key]: e.target.value }));

  const form = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((prev: any) => ({ ...prev, [key]: e.target.value }));

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
      {/* ── HEADER ── */}
      <div className="p-6 rounded-t-lg border-b-2">
        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
          {mode === 'edit' ? (
            <><Edit2Icon /> Edit Tool</>
          ) : (
            <><FolderCodeIcon /> Add New Tool</>
          )}
        </DialogTitle>
      </div>

      <div className="p-6 pt-4 space-y-4">

        {/* ════════════════════════════════
            BASIC INFO
        ════════════════════════════════ */}
        <SectionHeading icon={FileText} label="Basic Info" />

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold mb-2">Category</label>
          <Select
            disabled={mode === 'edit'}
            value={formData?.category ?? ''}
            onValueChange={(value) =>
              setFormData((prev: any) => ({ ...(prev ?? {}), category: value }))
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

        {/* Unique ID */}
        <div>
          <label className="block text-sm font-semibold mb-2">Unique ID</label>
          <div className="flex gap-2">
            <Input
              disabled={mode === 'edit'}
              placeholder="e.g., ip-01"
              value={formData?.url_id ?? ''}
              onChange={form('url_id')}
            />
            {mode !== 'edit' && (
              <Button
                type="button"
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
            )}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold mb-2">Name</label>
          <Input
            placeholder="e.g., IP Tools"
            value={formData?.urlName ?? ''}
            onChange={form('urlName')}
          />
        </div>

        {/* URL */}
        <div>
          <label className="block text-sm font-semibold mb-2">URL</label>
          <Input
            placeholder="e.g., developmenttool/ip-tools"
            value={formData?.route || formData?.url || ''}
            onChange={form('route')}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold mb-2">Description</label>
          <Textarea
            rows={2}
            placeholder="Brief description of the tool..."
            value={formData?.des ?? ''}
            onChange={form('des')}
          />
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-semibold mb-2">Keywords</label>
          <Input
            placeholder="e.g., ip address, lookup, network"
            value={formData?.keyword ?? ''}
            onChange={form('keyword')}
          />
        </div>

        {/* ════════════════════════════════
            SEO — CORE META
        ════════════════════════════════ */}
        <SectionHeading icon={Globe} label="SEO — Core Meta" />

        <div>
          <label className="block text-sm font-semibold mb-2">Meta Title</label>
          <Input
            placeholder="Page title shown in search results"
            value={metadata?.title ?? ''}
            onChange={meta('title')}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Meta Description</label>
          <Textarea
            rows={2}
            placeholder="Brief summary shown in search results (150–160 chars)"
            value={metadata?.description ?? ''}
            onChange={meta('description')}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Meta Keywords</label>
          <Input
            placeholder="keyword1, keyword2, keyword3"
            value={metadata?.keywords ?? ''}
            onChange={meta('keywords')}
          />
        </div>

        {/* ════════════════════════════════
            SOCIAL / OG TAGS
        ════════════════════════════════ */}
        <SectionHeading icon={Share2} label="Social — Open Graph Tags" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">OG Title</label>
            <Input
              placeholder="Title shown when shared on social"
              value={metadata?.ogTitle ?? ''}
              onChange={meta('ogTitle')}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">OG Type</label>
            <Select
              value={metadata?.ogType ?? 'website'}
              onValueChange={(value) =>
                setMata((prev) => ({ ...prev, ogType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website">website</SelectItem>
                <SelectItem value="article">article</SelectItem>
                <SelectItem value="product">product</SelectItem>
                <SelectItem value="profile">profile</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">OG Description</label>
          <Textarea
            rows={2}
            placeholder="Description shown when shared on social media"
            value={metadata?.ogDescription ?? ''}
            onChange={meta('ogDescription')}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">OG Image URL</label>
          <Input
            placeholder="https://yoursite.com/og-image.png (1200×630 recommended)"
            value={metadata?.ogImage ?? ''}
            onChange={meta('ogImage')}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">OG URL</label>
          <Input
            placeholder="https://yoursite.com/page-url"
            value={metadata?.ogUrl ?? ''}
            onChange={meta('ogUrl')}
          />
        </div>

        {/* ════════════════════════════════
            PAGE CONTENT
        ════════════════════════════════ */}
        <SectionHeading icon={FileText} label="Page Content" />

        <div>
          <label className="block text-sm font-semibold mb-2">Page Content</label>
          <Textarea
            rows={5}
            placeholder="Main body content or notes for this page..."
            value={metadata?.pageContent ?? ''}
            onChange={meta('pageContent')}
          />
        </div>

        {/* ════════════════════════════════
            IMAGE
        ════════════════════════════════ */}
        <SectionHeading icon={Image} label="Image" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Image Alt Text</label>
            <Input
              placeholder="Descriptive alt text for the image"
              value={metadata?.imageAlt ?? ''}
              onChange={meta('imageAlt')}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Image File Name</label>
            <Input
              placeholder="e.g., ip-tools-banner.png"
              value={metadata?.imageFileName ?? ''}
              onChange={meta('imageFileName')}
            />
          </div>
        </div>

        {/* ════════════════════════════════
            URL
        ════════════════════════════════ */}
        <SectionHeading icon={Link2} label="URL" />

        <div>
          <label className="block text-sm font-semibold mb-2">URL Slug</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 whitespace-nowrap">/tools/</span>
            <Input
              placeholder="e.g., ip-address-lookup"
              value={metadata?.urlSlug ?? ''}
              onChange={meta('urlSlug')}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Use lowercase letters, numbers, and hyphens only. No spaces.
          </p>
        </div>

        {/* ════════════════════════════════
            ACTIONS
        ════════════════════════════════ */}
        <div className="flex gap-3 pt-6">
          <Button
            onClick={handleSubmit}
            className="flex-1 cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : mode === 'edit' ? (
              'Update Tool'
            ) : (
              'Create Tool'
            )}
          </Button>
          <Button
            variant="secondary"
            className="flex-1 cursor-pointer"
            onClick={closeModal}
          >
            Cancel
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};