
import { getMetaCached } from "@/actions/dbAction";
import { JsonConverters } from "@/components/sections/json-converters";
import type { Metadata } from "next";
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ page: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;

  const data = await getMetaCached(page);

  return {
    title: data?.title || "JSON Converters Online",
    description: data?.description || "Free online JSON converters to process and convert JSON data instantly.",
    keywords: data?.keywords || "json converter, json tools, json editor, online json tools",
    robots: "index, follow",
  };
}



export default async function ToolPage({ params }: PageProps) {
  const { page } = await params;

  const data = await getMetaCached(page);

  return <JsonConverters data={data.pageData} />;
  
}
