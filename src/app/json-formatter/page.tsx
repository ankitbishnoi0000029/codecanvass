
import JsonFormatterTool from "@/components/sections/jsonFormatter";
import { getMetaCached } from "@/actions/dbAction"

export async function generateMetadata() {

  const data = await getMetaCached('json-formatter');

  return {
    title: data?.title || "JSON Formatter Online",
    description: data?.description || "Free online JSON formatter to process and format JSON data instantly.",
    keywords: data?.keywords || "json formatter, json tools, json editor, online json tools",
    robots: "index, follow",
  };
}




export default async function Page() {

  const data = await getMetaCached('json-formatter');

  return <JsonFormatterTool data={data.pageData} />;
}