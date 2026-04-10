
import { getMetaCached } from "@/actions/dbAction"
import { XmlFormatterPage } from "@/components/sections/xmlFormatter";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  

  const data = await getMetaCached('xml-formatter');

  return {
    title: data?.title || "XML Formatter Online",
    description: data?.description || "Free online XML formatter to process and format XML data instantly.",
    keywords: data?.keywords || "xml formatter, xml tools, xml editor, online xml tools",
    robots: "index, follow",
  };
}




export default async function Page() {
  

  const data = await getMetaCached('xml-formatter');

  return <XmlFormatterPage data={data.pageData} />;
}

