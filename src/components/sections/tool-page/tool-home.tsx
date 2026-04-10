import { getTableData } from '@/actions/dbAction';
import ContentSection from '@/components/ui/content';
import Link from 'next/link';

export interface Tool {
  urlName: string;
  route: string;
  des: string;
  icon?: string;
  badge?: string;
}

interface ToolHomePageProps {
  page: string;
  title: string;
  slug: string;
    data: any;
}
export default async function ToolHomePage({data, page, title,slug }: ToolHomePageProps) {
  const tools = (await getTableData(page)) as Tool[];
//   console.log('Tools data:hjhhhhhhhhg', data);
  return (
    <main className="min-h-screen bg-[#0d1117] text-gray-300 font-mono">
      {/* Hero */}
      <header className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-sm text-green-400 mb-3"></p>

        <h1 className="text-4xl md:text-6xl font-bold text-white">
          <span className="text-green-400">{title}</span>
          <br />
          to anything.
        </h1>

        <p className="mt-6 text-gray-400 max-w-2xl text-lg">
          A suite of free browser-based developer tools to export SQL query results into CSV, JSON,
          XML, YAML, HTML and more.
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 mt-6 text-sm text-gray-500">
          <span>
            <span className="text-green-400 font-semibold">{tools?.length}</span> tools
          </span>
          <span>•</span>
          <span>browser-based</span>
          <span>•</span>
          <span>free</span>
        </div>
      </header>

      {/* Tools Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools?.map((tool, i) => (
            <Link href={`/${slug}/${tool.route}`}
              key={tool.route}
              className="group border border-gray-800 bg-[#161b22] rounded-2xl p-6 hover:border-green-500 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/10"
            >
              {/* Index */}
              <div className="text-xs text-gray-500 mb-2">#{String(i + 1).padStart(2, '0')}</div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition">
                {tool.urlName}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-400 mt-2 line-clamp-2">{tool.des}</p>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>/{tool.route}</span>
                <span className="text-green-400 group-hover:translate-x-1 transition">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
<ContentSection data={data} />
      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 text-center text-sm text-gray-600">
        <span className="text-gray-500">
          {'<'}sql-converters{' />'} — aionlinetoolss.com
        </span>
      </footer>
    </main>
  );
}
