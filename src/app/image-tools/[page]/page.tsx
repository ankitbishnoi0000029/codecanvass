import { ImageTools } from "@/components/sections/image-tools"
import type { Metadata } from "next";
import { buildMetadata } from "@/utils/seo/metdata";


interface PageProps {
  params: Promise<{ page: string }>
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;
  return buildMetadata({
    table: "image_tools",
    urlId: page,
    route: `${page}`,
    fallbackTitle:       "Image Tools Online",
    fallbackDescription: "Free online image tools to process and convert images instantly.",
    fallbackKeywords:    "image tools, image converter, image editor, online image tools",
  });
}


export default async function ToolPage(
) {

  return <ImageTools  />;
}