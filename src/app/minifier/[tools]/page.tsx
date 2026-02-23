import { getMeta } from "@/actions/dbAction";
import { Minifier } from "@/components/sections/minifier";
import { buildMetadata } from "@/utils/seo/metdata";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ tools: string }>
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tools } = await params;
  return buildMetadata({
    table: "minifier",
    urlId: tools,
    route: `${tools}`,
    fallbackTitle:       " Converters Online",
    fallbackDescription: "Free online  converters to process and convert  data instantly.",
    fallbackKeywords:    " converter,  tools,  editor, online  tools",
  });
}


export default function minifierPage() {
  return (
    <Minifier />
  );
}
