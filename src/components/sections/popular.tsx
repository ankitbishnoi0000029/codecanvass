"use client";

import { useEffect, useState } from "react";
import { Heading } from "../ui/heading";
import { getTableData } from "@/actions/dbAction";
import { dataType } from "@/utils/types/uiTypes";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function Popular() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [data, setData] = useState<dataType[]>([]);
  useEffect(() => {
    (async () => {
      const res = (await getTableData("popular")) as unknown as dataType[];
      setData(Array.isArray(res) ? res : []);
    })();
  }, []);


  return (
    <section className="relative py-14 px-6 rounded-[28px] overflow-hidden bg-gradient-to-br from-indigo-50 via-rose-50 to-cyan-50 shadow-xl">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-pink-300/30 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-end justify-between gap-4 mb-8">
          <Heading title="Popular Functionality" align="left" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {data.map((tool) => {
            const isActive = activeId === tool.id;
            return (
              <Link
                key={tool.id}
                href={tool.route ?? "#"}
                onMouseEnter={() => setActiveId(tool.id)}
                onMouseLeave={() => setActiveId(null)}
                aria-label={`Open ${tool.name}`}
                className="group relative text-left rounded-2xl border bg-white/70 backdrop-blur-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border-2 hover:border-2 hover:border-black focus:outline focus:ring-2 focus:ring-indigo-400 "
              >
                {/* Gradient border on hover */}
                <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 via-blue-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-15" />

                {/* Content */}
                <div className="relative z-10 flex h-full flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2">
                      {tool.name}
                    </h3>
                    <ArrowUpRight className="h-4 w-4 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo-600" />
                  </div>

                  <p className="text-sm text-gray-500 line-clamp-2">
                    {tool.des || "Instantly convert and process your data with one click."}
                  </p>

                  {/* Footer */}
                  <div className="mt-auto pt-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors $${
                        isActive
                          ? "bg-indigo-600 text-white"
                          : "bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100"
                      }`}
                    >
                      Try now
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
