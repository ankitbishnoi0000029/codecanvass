
import { JsonConverters } from "@/components/sections/json-converters";
import type { Metadata } from "next";
import { buildMetadata } from "@/utils/seo/metdata";


interface PageProps {
  params: Promise<{ tool: string }>
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tool } = await params;
  return buildMetadata({
    table: "json_converters",
    urlId: tool,
    route: `${tool}`,
    fallbackTitle:       "JSON Converters Online",
    fallbackDescription: "Free online JSON converters to process and convert JSON data instantly.",
    fallbackKeywords:    "json converter, json tools, json editor, online json tools",
  });
}

export default function ToolPage() {
  return <JsonConverters />;
}
