
import { getMetaCached } from "@/actions/dbAction"
import ToolHomePage from "@/components/sections/tool-page/tool-home";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const data = await getMetaCached('base64-tools');
  return {
    title: data?.title || "Tools",
    description: data?.description || "Free online tool.",
    keywords: data?.keywords || "converter",
    robots: "index, follow",
  };
}

export default async function Page() {
  const data = await getMetaCached('base64-tools');;
  return <ToolHomePage page='base64_tools' title="Base64 Tools" slug="base64-tools" data={data?.pageData} />;
}
  