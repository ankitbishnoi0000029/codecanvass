import PDFToolApp from "@/components/sections/pdftool";
import { getMetaCached } from "@/actions/dbAction"


export async function generateMetadata() {
  const data = await getMetaCached('pdf-tool');
  return {
    title: data?.title || "PDF all Tool Online",
    description: data?.description || "Free online PDF tool.",
    keywords: data?.keywords || "pdf tool",
    robots: "index, follow",
  };
}

export default async function Page() {
  const data = await getMetaCached('pdf-tool');

  return <PDFToolApp data={data.pageData} />;
}