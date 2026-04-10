import { getMetaCached } from "@/actions/dbAction";
import CompressorHub from "@/components/sections/Compress/Compress";

export async function generateMetadata() {
  

  const data = await getMetaCached('compress');

  return {
    title: data?.title || "Compress & Decompress Online",
    description: data?.description || "Free online tool to compress and decompress files instantly.",
    keywords: data?.keywords || "compress, decompress, file compression, online tools",
    robots: "index, follow",
  };
}

export default async function compressdecompressPage() {
  const data = await getMetaCached('compress');
  return (
    <CompressorHub data={data.pageData} />
  );
}
