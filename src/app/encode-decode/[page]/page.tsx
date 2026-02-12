import { getMeta } from "@/actions/dbAction";
import EncodeDecode from "@/components/sections/encode&decode";
import type { Metadata } from "next"
import { MetaData } from "@/utils/types/uiTypes"

interface PageProps {
  params: Promise<{ page: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { params } = await props;
  const { page } = await params;
  
  const data = await getMeta("encode_decode", page);
  
  if (!data) {
    return {
      title: "Encode/Decode Tool Not Found | CodeBeauty",
      description: "The requested encode/decode tool does not exist.",
    };
  }

  let meta: MetaData = {};

  if (typeof data === "string") {
    try {
      meta = JSON.parse(data);
    } catch {
      meta = {};
    }
  } else if (typeof data === "object" && data !== null) {
    meta = { ...data };
  }

  const title = meta.title || "Encode/Decode Tool";
  const description =
    meta.description || "Encode and decode data with our powerful encoding/decoding tools.";
  const keywords =
    meta.keywords || "encode, decode, base64, url encode, encoding tools";

  return {
    title: `${title} | CodeBeauty`,
    description,
    keywords,
    openGraph: {
      title: `${title} | CodeBeauty`,
      description,
      url: `https://codebeauty.com/encode-decode/${page}`,
      type: "website",
      siteName: "CodeBeauty",
      ...(meta.ogImage && {
        images: [{ url: meta.ogImage }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | CodeBeauty`,
      description,
    },
    alternates: {
      canonical: `https://codebeauty.com/encode-decode/${page}`,
    },
  };
}

/* ---------------------------------------------------------
   PAGE COMPONENT (SERVER COMPONENT)
---------------------------------------------------------- */
export default async function ToolPage() {
  return <EncodeDecode />;
}
