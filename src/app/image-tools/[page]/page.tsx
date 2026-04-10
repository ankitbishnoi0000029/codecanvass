import { ImageTools } from "@/components/sections/image-tools"
import type { Metadata } from "next";
import { getMetaCached } from "@/actions/dbAction";


interface PageProps {
  params: Promise<{ page: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;

  const data = await getMetaCached(page);

  return {
    title: data?.title || "Image Tools Online",
    description: data?.description || "Free online image tools to process and convert images instantly.",
    keywords: data?.keywords ||  "image tools, image converter, image editor, online image tools",
    robots: "index, follow",
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { page } = await params;

  const data = await getMetaCached(page);

  return <ImageTools data={data.pageData}  />;
}

