import { getMetaCached } from "@/actions/dbAction";
import { HtmlConverters } from "@/components/sections/html-converters";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ page: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;

  const data = await getMetaCached(page);

  return {
    title: data?.title || "HTML Converter Online",
    description: data?.description || "Free online HTML converter tool.",
    keywords: data?.keywords || "html converter",
    robots: "index, follow",
  };
}

export default async function htmlconvertersPage({ params }: PageProps) {
  const { page } = await params;

  const data = await getMetaCached(page);
  return (
    <HtmlConverters data={data.pageData}/>
    
  );
}




  
