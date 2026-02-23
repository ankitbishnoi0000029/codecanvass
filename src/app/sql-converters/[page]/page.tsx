import { SqlConverter } from "@/components/sections/sql-converters"
import type { Metadata } from "next"
import { MetaData } from "@/utils/types/uiTypes"
import { getMeta } from "@/actions/dbAction"
import { buildMetadata } from "@/utils/seo/metdata";

interface PageProps {
  params: Promise<{ page: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;
  return buildMetadata({
    table: "sql_converters",
    urlId: page,
    route: `${page}`,
    fallbackTitle:       "SQL Converter Online",
    fallbackDescription: "Free online SQL converter to transform and format SQL code instantly.",
    fallbackKeywords:    "sql converter, online sql converter, sql formatting tool",
  });
}

export default async function ConverterPage() {
  return <SqlConverter />;
}
