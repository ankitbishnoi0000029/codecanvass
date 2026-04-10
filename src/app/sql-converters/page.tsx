
import { getMetaCached } from "@/actions/dbAction"
import ToolHomePage from "@/components/sections/tool-page/tool-home";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const data = await getMetaCached('sql-converters')
  return {
    title: data?.title || "Tools",
    description: data?.description || "Free online tool.",
    keywords: data?.keywords || "converter",
    robots: "index, follow",
  };
}

export default async function Page() {
  const data = await getMetaCached('sql-converters');
  return <ToolHomePage page='sql_converters' title="SQL Converter Tools" slug="sql-converters" data={data?.pageData} />;
}
  