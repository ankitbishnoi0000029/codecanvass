
import { getMetaCached } from "@/actions/dbAction";
import EncodeDecode from "@/components/sections/encode&decode";
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ page: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;

  const data = await getMetaCached(page);

  return {
    title: data?.title || "Encode/Decode Tool Online",
    description: data?.description || "Free online encode/decode tool to convert and transform data instantly.",
    keywords: data?.keywords || "encode, decode, base64, url encode, encoding tools",
    robots: "index, follow",
  };
}

/* ---------------------------------------------------------
   PAGE COMPONENT (SERVER COMPONENT)
---------------------------------------------------------- */
export default async function ToolPage({ params }: PageProps) {
  const { page } = await params;
  const data = await getMetaCached(page);
  return <EncodeDecode data={data.pageData} />;
}

