import JsonFormatterTool from "@/components/sections/jsonFormatter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Formatter | CodeBeauty",
  description: "Format and beautify your JSON code with our powerful JSON formatter. Make your JSON readable and properly indented.",
  keywords: "json formatter, json beautifier, json validator, json tools",
  openGraph: {
    title: "JSON Formatter | CodeBeauty",
    description: "Format and beautify your JSON code with our powerful JSON formatter. Make your JSON readable and properly indented.",
    url: "https://codebeauty.com/json-formatter",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Formatter | CodeBeauty",
    description: "Format and beautify your JSON code with our powerful JSON formatter. Make your JSON readable and properly indented.",
  },
  alternates: {
    canonical: "https://codebeauty.com/json-formatter",
  },
};

export default function Page() {
  return (
    <JsonFormatterTool />
  );
}