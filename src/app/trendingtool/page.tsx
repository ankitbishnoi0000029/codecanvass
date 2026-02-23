import type { Metadata } from "next";
import { buildMetadata } from "@/utils/seo/metdata";
import { Trandingtool } from "@/components/sections/trandingtool";


interface PageProps {
  params: Promise<{ page: string }>
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;
  return buildMetadata({
    table: "trendingtools",
    urlId: page,
    route: `${page}`,
    fallbackTitle:       " Converters Online",
    fallbackDescription: "Free online  converters to process and convert  data instantly.",
    fallbackKeywords:    " converter,  pages,  editor, online  pages",
  });
}


const page = () => {
  return (
    <Trandingtool />
  )
}

export default page