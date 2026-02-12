import React from 'react'
import type { Metadata } from "next";
import { MetaData } from "@/utils/types/uiTypes";
import { getMeta } from "@/actions/dbAction";

interface PageProps {
  params: Promise<{ page: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { params } = await props;
  const { page } = await params;
  const data = await getMeta("development_tool", page);

  if (!data) {
    return {
      title: "Development Tool Not Found | CodeBeauty",
      description: "The requested development tool does not exist.",
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
  const title = meta.title || "Development Tool";
  const description = meta.description || "Use our powerful development tools for coding and development tasks.";
  const keywords = meta.keywords || "development tools, developer tools, coding tools";

  return {
    title: `${title} | CodeBeauty`,
    description,
    keywords,
    openGraph: {
      title: `${title} | CodeBeauty`,
      description,
      url: `https://codebeauty.com/developmenttool/${page}`,
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
      canonical: `https://codebeauty.com/developmenttool/${page}`,
    },
  };
}

const page = () => {
  return (
    <div>page</div>
  )
}

export default page