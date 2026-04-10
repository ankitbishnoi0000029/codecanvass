
import { getMetaCached } from "@/actions/dbAction"
import ToolHomePage from "@/components/sections/tool-page/tool-home";

export async function generateMetadata() {
  const data = await getMetaCached('minifier');
  return {
    title: data?.title || "Tools",
    description: data?.description || "Free online tool.",
    keywords: data?.keywords || "converter",
    robots: "index, follow",
  };
}

export default async function Page() {
  const data = await getMetaCached('minifier');;
  return <ToolHomePage page='minifier' title="Minifier Tools" slug="minifier" data={data?.pageData} />;
}
  