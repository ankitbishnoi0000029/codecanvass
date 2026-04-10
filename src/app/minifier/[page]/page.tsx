
import { getMetaCached } from "@/actions/dbAction";
import { Minifier } from "@/components/sections/minifier";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ page: string }>
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


export default async function minifierPage({ params }: PageProps) {
  const { page } = await params;

  const data = await getMetaCached(page);

  return <Minifier data={data.pageData} />;
}