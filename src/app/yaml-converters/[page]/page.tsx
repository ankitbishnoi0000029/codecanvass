import { getMetaCached } from "@/actions/dbAction";
import { YamlConverters } from "@/components/sections/yaml-converters";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ page: string }>
}
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;

  const data = await getMetaCached(page);

  return {
    title: data?.title ||  "YAML Converters Online",
    description: data?.description || "Free online YAML converters to process and convert YAML data instantly.",
    keywords: data?.keywords || "YAML converter, YAML tools, YAML editor, online YAML tools",
    robots: "index, follow",
  };
}




export default async function yamlconvertersPage({ params }: PageProps) {
  const { page } = await params;

  const data = await getMetaCached(page);

  return <YamlConverters data={data.pageData} />;
}