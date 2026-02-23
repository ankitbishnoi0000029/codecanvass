import { fromDataType } from '@/utils/types/uiTypes';
import {
  Edit2Icon,
  ExternalLinkIcon,
  Loader2Icon,
  Trash2Icon,
  PackageOpen,
  Tag,
  Globe,
  Share2,
  Image,
  Link2,
} from 'lucide-react';
import Link from 'next/link';

interface AdminListProps {
  data: fromDataType[];
  fetching: boolean;
  onEdit: (tool: fromDataType) => void;
  onDelete: (id: string, table: string) => void;
}

interface ParsedMeta {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  pageContent?: string;
  imageAlt?: string;
  imageFileName?: string;
  urlSlug?: string;
}

const Badge = ({ children, color = 'blue' }: { children: React.ReactNode; color?: string }) => {
  const colors: Record<string, string> = {
    blue:   'bg-blue-50   text-blue-600   dark:bg-blue-950  dark:text-blue-400',
    green:  'bg-green-50  text-green-600  dark:bg-green-950 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
    slate:  'bg-slate-100 text-slate-600  dark:bg-slate-800 dark:text-slate-400',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color] ?? colors.blue}`}>
      {children}
    </span>
  );
};

const MetaRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
}) => {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-xs text-slate-500 dark:text-slate-400">
      <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
      <span>
        <span className="font-semibold text-slate-600 dark:text-slate-300">{label}: </span>
        <span className="line-clamp-1">{value}</span>
      </span>
    </div>
  );
};

export const AdminList = ({ data, fetching, onEdit, onDelete }: AdminListProps) => {
  const getMeta = (metaData?: string | any): ParsedMeta | null => {
    if (!metaData) return null;
    if (typeof metaData === 'string') {
      try { return JSON.parse(metaData); } catch { return null; }
    }
    return metaData;
  };

  /* ── LOADING ── */
  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
        <Loader2Icon className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm">Loading tools...</p>
      </div>
    );
  }

  /* ── EMPTY ── */
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
        <PackageOpen className="w-12 h-12 text-slate-300" />
        <p className="text-sm font-medium">No tools found in this category.</p>
      </div>
    );
  }

  /* ── LIST ── */
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.map((tool) => {
          const meta = getMeta(tool.metaData);
          return (
            <div
              key={tool.id ?? tool.url_id}
              className="group relative flex flex-col overflow-hidden rounded-2xl
                bg-white dark:bg-slate-900
                border border-slate-200 dark:border-slate-800
                shadow-sm hover:shadow-xl hover:-translate-y-1
                transition-all duration-300"
            >
              {/* hover overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition
                bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 pointer-events-none" />

              {/* ── ACTION BUTTONS ── */}
              <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => onEdit(tool)}
                  title="Edit"
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow
                    hover:bg-blue-600 hover:text-white cursor-pointer transition"
                >
                  <Edit2Icon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => tool.url_id && tool.category && onDelete(tool.url_id, tool.category)}
                  disabled={!tool.url_id}
                  title="Delete"
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow
                    hover:bg-red-600 hover:text-white cursor-pointer transition disabled:opacity-40"
                >
                  <Trash2Icon className="w-4 h-4" />
                </button>
              </div>

              {/* ── CARD BODY ── */}
              <div className="relative p-5 flex-1 space-y-3">
                {/* title + description */}
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white pr-16">
                    {tool.name || tool.urlName}
                  </h3>
                  {tool.des && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {tool.des}
                    </p>
                  )}
                </div>

                {/* keywords */}
                {tool.keyword && (
                  <div className="flex flex-wrap gap-1.5">
                    {tool.keyword.split(',').map((kw, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md
                          bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* ── META PANEL ── */}
                {meta && (
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100
                    dark:border-slate-700 p-3 space-y-2 text-xs">

                    {/* Core SEO */}
                    {(meta.title || meta.description || meta.keywords) && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1">
                          <Globe className="w-3 h-3" /> SEO
                        </p>
                        <MetaRow icon={Globe}  label="Title"       value={meta.title} />
                        <MetaRow icon={Globe}  label="Description" value={meta.description} />
                        {meta.keywords && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {meta.keywords.split(',').map((k, i) => (
                              <Badge key={i} color="slate">{k.trim()}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* OG Tags */}
                    {(meta.ogTitle || meta.ogDescription || meta.ogImage || meta.ogUrl) && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1">
                          <Share2 className="w-3 h-3" /> Open Graph
                        </p>
                        {meta.ogType && <Badge color="purple">{meta.ogType}</Badge>}
                        <MetaRow icon={Share2} label="OG Title"       value={meta.ogTitle} />
                        <MetaRow icon={Share2} label="OG Description" value={meta.ogDescription} />
                        <MetaRow icon={Share2} label="OG Image"       value={meta.ogImage} />
                        <MetaRow icon={Share2} label="OG URL"         value={meta.ogUrl} />
                      </div>
                    )}

                    {/* Image */}
                    {(meta.imageAlt || meta.imageFileName) && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1">
                          <Image className="w-3 h-3" /> Image
                        </p>
                        <MetaRow icon={Image} label="Alt Text"  value={meta.imageAlt} />
                        <MetaRow icon={Image} label="File Name" value={meta.imageFileName} />
                      </div>
                    )}

                    {/* URL Slug */}
                    {meta.urlSlug && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1">
                          <Link2 className="w-3 h-3" /> URL
                        </p>
                        <MetaRow icon={Link2} label="Slug" value={`/tools/${meta.urlSlug}`} />
                      </div>
                    )}

                    {/* Page Content */}
                    {meta.pageContent && (
                      <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                          Page Content
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                          {meta.pageContent}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── CARD FOOTER ── */}
              <div className="relative px-5 py-3 border-t border-slate-200 dark:border-slate-800
                flex flex-wrap items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge color="blue">{tool.category}</Badge>
                  <span className="text-xs text-slate-400 font-mono">#{tool.url_id}</span>
                </div>

                {(tool.route || tool.url) && (
                  <Link
                    href={(tool.route ?? tool.url ?? '#') as string}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                      bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                      text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30
                      transition truncate max-w-[180px]"
                  >
                    <ExternalLinkIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{tool.route ?? tool.url}</span>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};