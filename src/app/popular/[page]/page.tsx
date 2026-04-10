import { getMetaCached } from "@/actions/dbAction";
import PopularTools from "@/components/sections/popular-tools";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ page: string }>
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;

  const data = await getMetaCached(page);

  return {
    title: data?.title || "popular tool Converter Online",
    description: data?.description || "Free online popular tool converter tool.",
    keywords: data?.keywords || "popular converter",
    robots: "index, follow",
  };
}

export default async function Page({ params }: PageProps) {
  const { page } = await params;

  const data = await getMetaCached(page);

  return <PopularTools data={data.pageData} />;
}
  
