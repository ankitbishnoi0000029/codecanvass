import { Parsers } from "@/components/sections/parsers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parsers | CodeBeauty",
  description: "Parse and analyze data with our powerful parser tools. Parse JSON, XML, CSV, and more data formats.",
  keywords: "parser tools, data parser, text parser, json parser, xml parser",
  openGraph: {
    title: "Parsers | CodeBeauty",
    description: "Parse and analyze data with our powerful parser tools. Parse JSON, XML, CSV, and more data formats.",
    url: "https://codebeauty.com/parsers",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Parsers | CodeBeauty",
    description: "Parse and analyze data with our powerful parser tools. Parse JSON, XML, CSV, and more data formats.",
  },
  alternates: {
    canonical: "https://codebeauty.com/parsers",
  },
};

export default function parsersPage() {
  return (
    <Parsers />
  );
}
