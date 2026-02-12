import { JsonConverters } from "@/components/sections/json-converters";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Converters | CodeBeauty",
  description: "Convert JSON data to various formats including CSV, XML, YAML, HTML and more with our powerful JSON converter tools.",
  keywords: "json converter, json to csv, json to xml, json to yaml, json tools",
  openGraph: {
    title: "JSON Converters | CodeBeauty",
    description: "Convert JSON data to various formats including CSV, XML, YAML, HTML and more with our powerful JSON converter tools.",
    url: "https://codebeauty.com/json-converters",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Converters | CodeBeauty",
    description: "Convert JSON data to various formats including CSV, XML, YAML, HTML and more with our powerful JSON converter tools.",
  },
  alternates: {
    canonical: "https://codebeauty.com/json-converters",
  },
};

export default function jsonconvertersPage() {
  return (
    <JsonConverters />
  );
}
