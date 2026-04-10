
import { getMetaCached } from "@/actions/dbAction"
import ToolHomePage from "@/components/sections/tool-page/tool-home";

export async function generateMetadata() {
  const data = await getMetaCached('image-tools');
  return {
    title: data?.title || "Tools",
    description: data?.description || "Free online tool.",
    keywords: data?.keywords || "converter",
    robots: "index, follow",
  };
}

export default async function Page() {
  const data = await getMetaCached('image-tools');;
  return <ToolHomePage page='image_tools' title="Image Tools" slug="image-tools" data={data?.pageData} />;
}
  