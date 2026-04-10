
import { getMetaCached } from "@/actions/dbAction"
import ToolHomePage from "@/components/sections/tool-page/tool-home";

export async function generateMetadata() {
  const data = await getMetaCached('trendingtool')
  return {
    title: data?.title || "Tools",
    description: data?.description || "Free online tool.",
    keywords: data?.keywords || "converter",
    robots: "index, follow",
  };
}

export default async function Page() {
  const data = await getMetaCached('trendingtool');
  return <ToolHomePage page='trendingtools' title="Trending Tools" slug="trendingtool" data={data?.pageData} />;
}
  