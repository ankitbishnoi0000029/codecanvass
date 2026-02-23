
import React from "react"
import { Base64Tools } from "@/components/sections/base64-tools";
import { MetaData } from "@/utils/types/uiTypes"
import { Metadata } from "next";
import { getMeta } from "@/actions/dbAction";
import { buildMetadata } from "@/utils/seo/metdata";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ page: string }>
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;
  return buildMetadata({
    table: "base64_tools",
    urlId: page,
    route: `${page}`,
    fallbackTitle:       "Encode/Decode Tool Online",
    fallbackDescription: "Free online encode/decode tool to convert and transform data instantly.",
    fallbackKeywords:    "encode, decode, base64, url encode, encoding tools",
  });
}



export default async function ToolPage() {

  return <Base64Tools  />

}
