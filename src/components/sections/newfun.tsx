"use client";
import { useEffect, useState } from "react";
import { Heading } from "../ui/heading";
import { ToolCard } from "../ui/toolcard";
import { useRouter } from "next/navigation";
import { dataType } from "@/utils/types/uiTypes";
import { getTableData } from "@/actions/dbAction";

export function NewFun() {
  const [selected, setSelected] = useState<string | null>(null);
  const [data, setData] = useState<dataType[]>([]);

  const route = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const categoriesData = (await getTableData("trendingtools")) as unknown as dataType[];
      setData(Array.isArray(categoriesData) ? categoriesData : []);
    };
    fetchData();
  }, []);
  return (
    <section
      className="
        relative py-10 px-6 md:px-8 
        bg-gradient-to-br from-[#f0f9ff] via-[#ecfdf5] to-[#fff7ed]
        rounded-3xl shadow-md overflow-hidden
        font-sans
      "
    >
      {/* Soft blurred background */}
      <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_25%_20%,rgba(56,189,248,0.15),transparent_60%),radial-gradient(circle_at_75%_80%,rgba(251,191,36,0.15),transparent_60%)] blur-lg" />

      <div className="relative z-10">
        <Heading title="New Functionality" align="left" />

        <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed max-w-2xl">
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {data.map((tool: any, index: number) => (
            <div
              key={index}
              className="
                relative group transition-all duration-500
                hover:scale-[1.04] hover:-translate-y-1
              "
            >
              {/* Glow effect behind on hover */}
              <div
                className="
                  absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
                  bg-gradient-to-r from-blue-400/20 to-pink-400/20
                  blur-lg transition-all duration-500
                "
              ></div>

              <ToolCard
                title={tool.name}
                variant={(tool.variant as "default" | "primary") ?? "default"}
                isActive={selected === tool.name}
                onClick={() => {
                  setSelected(selected === tool.title ? null : tool.title);
                  route.push(tool.url)
                }
                }
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
