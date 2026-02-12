import type { Metadata } from "next";
import { MetaData } from "@/utils/types/uiTypes";
import { getMeta } from "@/actions/dbAction";

interface PageProps {
  params?: Promise<{ page?: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const resolvedParams = props.params ? await props.params : undefined;
  const page = resolvedParams?.page ?? "";
  
  if (!page) {
    return {
      title: "New Functionality | CodeBeauty",
      description: "Explore new functionality and features on CodeBeauty.",
    };
  }

  const data = await getMeta("new_functionality", page);

  if (!data) {
    return {
      title: "New Functionality Not Found | CodeBeauty",
      description: "The requested new functionality does not exist.",
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
  const title = meta.title || "New Functionality";
  const description = meta.description || "Explore new functionality and features on CodeBeauty.";
  const keywords = meta.keywords || "new features, functionality, tools";

  return {
    title: `${title} | CodeBeauty`,
    description,
    keywords,
    openGraph: {
      title: `${title} | CodeBeauty`,
      description,
      url: `https://codebeauty.com/newFunctionlity/${page}`,
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
      canonical: `https://codebeauty.com/newFunctionlity/${page}`,
    },
  };
}

export default async function NewFunctionalityPage({
  params,
}: {
  params?: Promise<{ page?: string }>
}) {
  const resolvedParams = params ? await params : undefined
  const page = resolvedParams?.page ?? ""

  return <div>New Functionality Page {page}</div>
}