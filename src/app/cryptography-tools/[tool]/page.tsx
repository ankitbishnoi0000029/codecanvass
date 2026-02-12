import type { Metadata } from "next";
import { MetaData } from "@/utils/types/uiTypes";
import { getMeta } from "@/actions/dbAction";

interface PageProps {
  params: Promise<{ tool: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { params } = await props;
  const { tool } = await params;
  const data = await getMeta("cryptography_tools", tool);

  if (!data) {
    return {
      title: "Cryptography Tool Not Found | CodeBeauty",
      description: "The requested cryptography tool does not exist.",
    };
  }

  let meta: MetaData = {};
  if (typeof data === "string") {
    try {
      meta = JSON.parse(data || "{}");
    } catch (e) {
      // If parsing fails, meta remains empty
    }
  } else if (typeof data === "object" && data !== null) {
    meta = { ...data } as MetaData;
  }
  const title = meta.title || "Cryptography Tool";
  const description = meta.description || "Encrypt, decrypt, and hash data with our powerful cryptography tools.";
  const keywords = meta.keywords || "cryptography tools, encryption, decryption, hashing";

  return {
    title: `${title} | CodeBeauty`,
    description,
    keywords,
    openGraph: {
      title: `${title} | CodeBeauty`,
      description,
      url: `https://codebeauty.com/cryptography-tools/${tool}`,
      type: "website",
      siteName: "CodeBeauty",
      ...(meta.ogImage && { images: [{ url: meta.ogImage }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | CodeBeauty`,
      description,
    },
    alternates: {
      canonical: `https://codebeauty.com/cryptography-tools/${tool}`,
    },
  };
}

export default function ToolPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dynamic Tool Page</h1>
      <p>This is a dynamic tool page for cryptography-tools.</p>
    </div>
  );
}
