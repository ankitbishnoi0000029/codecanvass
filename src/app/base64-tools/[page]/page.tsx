
import React from "react"
import { Base64Tools } from "@/components/sections/base64-tools";
import { MetaData } from "@/utils/types/uiTypes"
import { Metadata } from "next";
import { getMeta } from "@/actions/dbAction";

interface PageProps {
  params: Promise<{ page: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { params } = await props;
  const { page } = await params;
  const data = await getMeta("base64_tools", page);
  
  
  
  if (!data) {
    return {
      title: "Base64 Tool Not Found | CodeBeauty",
      description: "The requested Base64 tool does not exist.",
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
  const title = meta.title || "Base64 Tool";
  const description = meta.description || "Encode and decode Base64 data with our powerful Base64 tools.";
  const keywords = meta.keywords || "base64, base64 encoder, base64 decoder, base64 tools";
  return {
    title: `${title} | CodeBeauty`,
    description,
    keywords,
    openGraph: {
      title: `${title} | CodeBeauty`,
      description,
      url: `https://codebeauty.com/base64-tools/${page}`,
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
      canonical: `https://codebeauty.com/base64-tools/${page}`,
    },
  };
}


export default async function ToolPage() {

  return <Base64Tools  />

}
