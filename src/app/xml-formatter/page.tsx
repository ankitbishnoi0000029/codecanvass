
import { XmlFormatterPage } from "@/components/sections/xmlFormatter";
import { buildMetadata } from "@/utils/seo/metdata";

export async function generateMetadata() {
  return buildMetadata({
    table: "navbar",
    urlId: 'xml-formatter',
    route: `xml-formatter`,
    fallbackTitle:       "xml Formatter Online",
    fallbackDescription: "Free online xml formatter to process and format xml data instantly.",
    fallbackKeywords:    "xml formatter, xml tools, xml editor, online xml tools",
  });
}
export default function XmlFormatter() {
  return (
    <XmlFormatterPage />
  );
}