import React from 'react'
import type { Metadata } from "next";
import { MetaData } from "@/utils/types/uiTypes";
import { getMeta } from "@/actions/dbAction";
import FlagMaker from '@/components/sections/flag-maker';

interface PageProps {
  params: Promise<{ page: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { params } = await props;
  const { page } = await params;
  const data = await getMeta("nf", page);

  if (!data) {
    return {
      title: "Tool Not Found | CodeBeauty",
      description: "The requested tool does not exist.",
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
  const title = meta.title || "Tool";
  const description = meta.description || "Use our powerful tools for various tasks.";
  const keywords = meta.keywords || "tools, utilities, online tools";

  return {
    title: `${title} | CodeBeauty`,
    description,
    keywords,
    openGraph: {
      title: `${title} | CodeBeauty`,
      description,
      url: `https://codebeauty.com/nf/${page}`,
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
      canonical: `https://codebeauty.com/nf/${page}`,
    },
  };
}

export default function Page() {
  return <FlagMaker />;
}

