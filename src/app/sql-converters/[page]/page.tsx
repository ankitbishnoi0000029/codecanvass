import { SqlConverter } from "@/components/sections/sql-converters"
import type { Metadata } from "next"
import { MetaData } from "@/utils/types/uiTypes"
import { getMeta } from "@/actions/dbAction"

interface PageProps {
  params: Promise<{ page: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { params } = await props;
  const { page } = await params;
  const data = await getMeta("sql_converters",page);

  if (!data) {
    return {
      title: "SQL Converter Not Found | CodeBeauty",
      description: "The requested SQL converter does not exist.",
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
  const title = meta.title || "SQL Converter";
  const description = meta.description  || "Convert SQL data with our powerful SQL converter tool.";
  const keywords = meta.keywords || "sql converter, sql tools, database converter";

  return {
    title: `${title} | CodeBeauty`,
    description,
    keywords,
    openGraph: {
      title: `${title} | CodeBeauty`,
      description,
      url: `https://codebeauty.com/sql-converters/${page}`,
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
      canonical: `https://codebeauty.com/sql-converters/${page}`,
    },
  };
}

export default async function ConverterPage() {
  return <SqlConverter />;
}
