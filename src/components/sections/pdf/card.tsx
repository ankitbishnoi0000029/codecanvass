import Link from "next/link";


export function ToolCard({tool, onClick}: {tool: any, onClick: () => void}) {
  const color=tool.catColor||'#dc2626';
  return(
    <Link href={`/pdf-tool${tool.route}`}  className="bg-white border border-gray-100 rounded-2xl p-4 text-left group w-full hover:shadow-md transition-all">
      <div className="w-10 h-10 text-white rounded-xl mb-3 flex items-center justify-center text-xl group-hover:scale-110 transition-transform" style={{background:color}}>{tool.icon}</div>
      <div className="text-sm font-semibold text-gray-800 leading-tight mb-1">{tool.name}</div>
      <div className="text-xs text-gray-400 leading-snug line-clamp-2">{tool.desc}</div>
    </Link>
  );
}