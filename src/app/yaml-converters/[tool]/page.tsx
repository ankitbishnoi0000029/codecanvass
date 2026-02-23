import { YamlConverters } from "@/components/sections/yaml-converters";
import type { Metadata } from "next";
import { buildMetadata } from "@/utils/seo/metdata";

interface PageProps {
  params: Promise<{ tool: string }>
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tool } = await params;
  return buildMetadata({
    table: "yaml_converters",
    urlId: tool,
    route: `${tool}`,
    fallbackTitle:       "YAML Converters Online",
    fallbackDescription: "Free online YAML converters to process and convert YAML data instantly.",
    fallbackKeywords:    "YAML converter, YAML tools, YAML editor, online YAML tools",
  });
}

export default function yamlconvertersPage() {
  return (
   <YamlConverters />
  );
}
