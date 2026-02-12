import XmlConverters from "@/components/sections/xml-converters";
import type { Metadata } from "next";
import { MetaData } from "@/utils/types/uiTypes";
import { getMeta } from "@/actions/dbAction";

interface PageProps {
  params: Promise<{ pages: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { params } = await props;
  const { pages } = await params;
  const data = await getMeta("xml_converters", pages);

  if (!data) {
    return {
      title: "XML Converter Not Found | CodeBeauty",
      description: "The requested XML converter does not exist.",
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
  const title = meta.title || "XML Converter";
  const description = meta.description || "Convert XML data with our powerful XML converter tool.";
  const keywords = meta.keywords || "xml converter, xml tools, data converter";

  return {
    title: `${title} | CodeBeauty`,
    description,
    keywords,
    openGraph: {
      title: `${title} | CodeBeauty`,
      description,
      url: `https://codebeauty.com/xml-converters/${pages}`,
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
      canonical: `https://codebeauty.com/xml-converters/${pages}`,
    },
  };
}

export default function Page() {
  return <XmlConverters />;
}
