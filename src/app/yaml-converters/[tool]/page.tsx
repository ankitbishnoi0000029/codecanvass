import { YamlConverters } from "@/components/sections/yaml-converters";
import type { Metadata } from "next";
import { MetaData } from "@/utils/types/uiTypes";
import { getMeta } from "@/actions/dbAction";

interface PageProps {
  params: Promise<{ tool: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { params } = await props;
  const { tool } = await params;
  const data = await getMeta("yaml_converters", tool);

  if (!data) {
    return {
      title: "YAML Converter Not Found | CodeBeauty",
      description: "The requested YAML converter does not exist.",
    };
  }

  let meta: MetaData = {};
  if (typeof data === "string") {
    try {
      meta = JSON.parse(data || "{}");
    } catch (e) {
      // If parsing fails, meta remains empty
    }
  } else if (typeof data === "object" && data !== null) {
    meta = { ...data } as MetaData;
  }
  const title = meta.title || "YAML Converter";
  const description = meta.description || "Convert YAML data with our powerful YAML converter tool.";
  const keywords = meta.keywords || "yaml converter, yaml tools, data converter";
console.log(title)
  return {
    title: `${title} | CodeBeauty`,
    description,
    keywords,
    openGraph: {
      title: `${title} | CodeBeauty`,
      description,
      url: `https://codebeauty.com/yaml-converters/${tool}`,
      type: "website",
      siteName: "CodeBeauty",
      ...(meta.ogImage && { images: [{ url: meta.ogImage }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | CodeBeauty`,
      description,
    },
    alternates: {
      canonical: `https://codebeauty.com/yaml-converters/${tool}`,
    },
  };
}

export default function yamlconvertersPage() {
  return (
   <YamlConverters />
  );
}
