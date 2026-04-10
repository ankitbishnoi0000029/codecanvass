

import { Base64Tools } from "@/components/sections/base64-tools";
import { Metadata } from "next";
import { getMetaCached } from "@/actions/dbAction";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ page: string }>
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;

  const data = await getMetaCached(page);

  return {
    title: data?.title || "Base64 tool Converter Online",
    description: data?.description || "Free online Base64 tool converter tool.",
    keywords: data?.keywords || "sql converter",
    robots: "index, follow",
  };
}

export default async function Page({ params }: PageProps) {
  const { page } = await params;

  const data = await getMetaCached(page);

  return <Base64Tools data={data.pageData} />;
}
  

