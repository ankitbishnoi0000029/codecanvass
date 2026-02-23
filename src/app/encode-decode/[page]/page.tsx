import { getMeta } from "@/actions/dbAction";
import EncodeDecode from "@/components/sections/encode&decode";
import type { Metadata } from "next"
import { MetaData } from "@/utils/types/uiTypes"
import { buildMetadata } from "@/utils/seo/metdata";

interface PageProps {
  params: Promise<{ page: string }>;
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;
  return buildMetadata({
    table: "encode_decode",
    urlId: page,
    route: `${page}`,
    fallbackTitle:       "Encode/Decode Tool Online",
    fallbackDescription: "Free online encode/decode tool to convert and transform data instantly.",
    fallbackKeywords:    "encode, decode, base64, url encode, encoding tools",
  });
}



/* ---------------------------------------------------------
   PAGE COMPONENT (SERVER COMPONENT)
---------------------------------------------------------- */
export default async function ToolPage() {
  return <EncodeDecode />;
}
