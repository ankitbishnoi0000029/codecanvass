import XmlConverters from "@/components/sections/xml-converters";
import type { Metadata } from "next";
import { buildMetadata } from "@/utils/seo/metdata";

interface PageProps {
  params: Promise<{ tool: string }>
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tool } = await params;
  return buildMetadata({
    table: "xml_converters",
    urlId: tool,
    route: `${tool}`,
    fallbackTitle:       "XML Converters Online",
    fallbackDescription: "Free online XML converters to process and convert XML data instantly.",
    fallbackKeywords:    "xml converter, xml tools, xml editor, online xml tools",
  });
}
export default function Page() {
  return <XmlConverters />;
}
