import type { Metadata } from "next";
import { Trandingtool } from "@/components/sections/trandingtool";
import { getMetaCached } from "@/actions/dbAction";
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ page: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;

  const data = await getMetaCached(page);

  return {
    title: data?.title || "tranding Converters Online",
    description: data?.description || "Free online tranding converters to process .",
    keywords: data?.keywords || "tranding converters, online tranding converters, free tranding converters, tranding converters tool",
    robots: "index, follow",
  };
}



export default async function page({ params }: PageProps) {
  const { page } = await params;

  const data = await getMetaCached(page);

  return <Trandingtool data={data.pageData} />;
  
}
