import { getMetaCached } from "@/actions/dbAction";
import XmlConverters from "@/components/sections/xml-converters";
import type { Metadata } from "next"
interface PageProps {
  params: Promise<{ page: string }>;
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;

  const data = await getMetaCached(page);

  return {
    title: data?.title || "XML Converter Online",
    description: data?.description || "Free online XML converter tool.",
    keywords: data?.keywords || "xml converter",
    robots: "index, follow",
  };
}


export default async function Page({ params }: PageProps) {
  const { page } = await params;

  const data = await getMetaCached(page);

  return <XmlConverters data={data.pageData} />;
}
  