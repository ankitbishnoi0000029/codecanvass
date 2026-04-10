import { SqlConverter } from "@/components/sections/sql-converters"
import type { Metadata } from "next"
import { getMetaCached } from "@/actions/dbAction"
export const dynamic = "force-dynamic";
interface PageProps {
  params: Promise<{ page: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;

  const data = await getMetaCached(page);

  return {
    title: data?.title || "SQL Converter Online",
    description: data?.description || "Free online SQL converter tool.",
    keywords: data?.keywords || "sql converter",
    robots: "index, follow",
  };
}

export default async function Page({ params }: PageProps) {
  const { page } = await params;

  const data = await getMetaCached(page);

  return <SqlConverter data={data.pageData} />;
}
  