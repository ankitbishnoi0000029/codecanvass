"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heading } from "../ui/heading";
import { getTableData } from "@/actions/dbAction";
import { TrendingUp } from "lucide-react";
import { dataType } from "@/utils/types/uiTypes";
import Link from "next/link";

export function TrendingTools() {
  const [data, setData] = useState<dataType[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const res = (await getTableData("trendingtools")) as unknown as dataType[];
      setData(Array.isArray(res) ? res : []);
    })();
  }, []);

  return (
    <section className="relative py-16 px-6">
      {/* Minimal modern background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-slate-100" />

      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <Heading title="Trending Tools" align="left" />
          <p className="mt-2 text-sm text-slate-500">
            Tools people are actively using right now
          </p>
        </div>

        {/* Modern grid cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {data.map((tool) => (
            <Link
              key={tool.id}
              href={tool.route || ''}
              // onClick={() => router.push(`/${tool.route}`)}
              className="group relative rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] focus:outline-none"
            >
              {/* Accent line */}
              <span className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="flex flex-col h-full">
                {/* Icon */}
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <TrendingUp className="h-5 w-5" />
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-slate-900 mb-2 line-clamp-2">
                  {tool.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-500 line-clamp-2">
                  {tool.des || "A fast and reliable utility tool."}
                </p>

                {/* CTA */}
                <div className="mt-auto pt-5">
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:gap-2 transition-all">
                    Use tool <span className="text-lg">→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
