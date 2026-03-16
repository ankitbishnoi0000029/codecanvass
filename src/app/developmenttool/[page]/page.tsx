import type { Metadata } from "next";
// import ImageTools from '@/components/sections/dl';
import DL from '@/components/sections/dl';
import { buildMetadata } from "@/utils/seo/metdata";

interface PageProps {
  params: Promise<{ tool: string }>
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tool } = await params;
  return buildMetadata({
    table: "html_converters",
    urlId: tool,
    route: `${tool}`,
    fallbackTitle:       "XML Converters Online",
    fallbackDescription: "Free online XML converters to process and convert XML data instantly.",
    fallbackKeywords:    "xml converter, xml tools, xml editor, online xml tools",
  });
}
const page = () => {
  return (
    <DL />
  )
}

export default page