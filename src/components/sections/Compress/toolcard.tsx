import { categoriesHub } from "@/utils/consitants/consitaint";
import Link from "next/link";

type Tool     = (typeof categoriesHub)[0]['tools'][0] & {
  categoryId?: string;
  popular?: boolean;
  isNew?: boolean;
  badge?: string;
};
type Category = (typeof categoriesHub)[0];

export const ToolCard = ({ tool, category, listView }: { tool: Tool; category: Category;  listView?: boolean }) => {
  const t = tool as any;
  if (listView) return (
    <Link href={`/compress/${tool.id}`} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-[#0d0f14] border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all group text-left cursor-pointer">
      <span className="text-xl w-7 shrink-0">{category.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{tool?.name}</p>
        <p className="text-xs text-slate-500 truncate">{tool?.description}</p>
      </div>
      <div className="flex gap-1 shrink-0">
        {t.badge && <Badge text={t.badge}/>}{t.isNew && <Badge text="new"/>}{t.popular && <Badge text="popular"/>}
      </div>
      <span className="text-slate-600 group-hover:text-slate-300 ml-1">→</span>
    </Link>
  );
  return (
    <Link href={`/compress/${tool.id}`} className={`relative p-4 rounded-2xl border ${category.bg} hover:scale-[1.02] hover:shadow-xl hover:shadow-black/40 transition-all duration-200 group text-left cursor-pointer`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{category.icon}</span>
        <div className="flex flex-wrap gap-1 justify-end">{t.badge&&<Badge text={t.badge}/>}{t.isNew&&<Badge text="new"/>}{t.popular&&<Badge text="popular"/>}</div>
      </div>
      <h3 className={`text-sm font-bold ${category.color} mb-1 leading-tight`}>{tool.name}</h3>
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{tool.description}</p>
      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-slate-400">Open →</span>
      </div>
    </Link>
  );
}

// ─── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ text }: { text: string }) {
  const cls: Record<string,string> = {
    AI: 'bg-fuchsia-600 text-white', new: 'bg-red-500 text-white', popular: 'bg-emerald-600 text-white'
  };
  return <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full tracking-wide ${cls[text]??'bg-slate-700 text-slate-300'}`}>{text.toUpperCase()}</span>;
}
