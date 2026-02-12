import type { Metadata } from "next";
import { MetaData } from "@/utils/types/uiTypes";
import { getMeta } from "@/actions/dbAction";

interface PageProps {
  params: Promise<{ tool: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { params } = await props;
  const { tool } = await params;
  const data = await getMeta("csv_tools", tool);

  if (!data) {
    return {
      title: "CSV Tool Not Found | CodeBeauty",
      description: "The requested CSV tool does not exist.",
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
  const title = meta.title || "CSV Tool";
  const description = meta.description || "Process and convert CSV files with our powerful CSV tools.";
  const keywords = meta.keywords || "csv tools, csv converter, csv processor";

  return {
    title: `${title} | CodeBeauty`,
    description,
    keywords,
    openGraph: {
      title: `${title} | CodeBeauty`,
      description,
      url: `https://codebeauty.com/csv-tools/${tool}`,
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
      canonical: `https://codebeauty.com/csv-tools/${tool}`,
    },
  };
}

export default function ToolPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dynamic Tool Page</h1>
      <p>This is a dynamic tool page for csv-tools.</p>
    </div>
  );
}
