import { getMetaCached } from "@/actions/dbAction";
import CompresserPage from "@/components/sections/Compress/compresser";
import { Metadata } from "next";


interface PageProps {
  params: Promise<{ page: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;

  const data = await getMetaCached(page);

  return {
    title: data?.title || "compress  Online",
    description: data?.description || "Free online compress  tool.",
    keywords: data?.keywords || "compress ",
    robots: "index, follow",
  };
}

export default async function Page({ params }: PageProps) {
  const { page } = await params;
  const data = await getMetaCached(page);

  return <CompresserPage data={data.pageData} />;
}
  