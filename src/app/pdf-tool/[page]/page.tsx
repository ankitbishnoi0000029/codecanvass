import ToolPage from "@/components/sections/pdf/toolpage";


import type { Metadata } from "next"
import { getMetaCached } from "@/actions/dbAction"

interface PageProps {
  params: Promise<{ page: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;

  const data = await getMetaCached(page);

  return {
    title: data?.title || "PDF Tool Online",
    description: data?.description || "Free online PDF tool.",
    keywords: data?.keywords || "pdf tool",
    robots: "index, follow",
  };
}

export default async function Page({ params }: PageProps) {
  const { page } = await params;

  const data = await getMetaCached(page);

  return <ToolPage data={data.pageData} />;
}