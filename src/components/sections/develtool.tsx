"use client";
import { useEffect, useState } from "react";
import { Heading } from "../ui/heading";
import { ToolCard } from "../ui/toolcard";
import { useRouter } from "next/navigation";
import { dataType } from "@/utils/types/uiTypes";
import { getTableData } from "@/actions/dbAction";

export function DevelTool() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [data, setData] = useState<dataType[]>([]);
  const route = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const categoriesData = (await getTableData("developertools")) as unknown as dataType[];
      setData(Array.isArray(categoriesData) ? categoriesData : []);
    };
    fetchData();
  }, []);

  return (
    <section className="relative py-12 px-6 bg-gradient-to-br from-[#f0f4ff] via-[#fdf2ff] to-[#f0fff4] rounded-3xl shadow-md overflow-hidden">
      {/* Optional decorative background */}
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.15),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.1),transparent_50%)]" />

      <div className="relative z-10">
        <Heading title="Developer Tools" align="left" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-6">
          {data.map((tool : any, index : number) => (
            <ToolCard
              key={index}
              title={tool.urlName}
              variant={tool.variant as "primary" | "default"}
              isActive={activeIndex === index} 
              onClick={() =>{ setActiveIndex(index); route.push(tool.route) }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
