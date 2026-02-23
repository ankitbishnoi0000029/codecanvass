
import JsonFormatterTool from "@/components/sections/jsonFormatter";
import { buildMetadata } from "@/utils/seo/metdata";

export async function generateMetadata() {
  return buildMetadata({
    table: "navbar",
    urlId: 'json-formatter',
    route: `/json-formatter`,
    fallbackTitle:       "JSON Formatter Online",
    fallbackDescription: "Free online JSON formatter to process and format JSON data instantly.",
    fallbackKeywords:    "json formatter, json tools, json editor, online json tools",
  });
}


export default function Page() {
  return <JsonFormatterTool />;
}