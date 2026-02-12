import { XmlFormatterPage } from "@/components/sections/xmlFormatter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "XML Formatter | CodeBeauty",
  description: "Format and beautify your XML code with our powerful XML formatter. Make your XML readable and properly indented.",
  keywords: "xml formatter, xml beautifier, xml validator, xml tools",
  openGraph: {
    title: "XML Formatter | CodeBeauty",
    description: "Format and beautify your XML code with our powerful XML formatter. Make your XML readable and properly indented.",
    url: "https://codebeauty.com/xml-formatter",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "XML Formatter | CodeBeauty",
    description: "Format and beautify your XML code with our powerful XML formatter. Make your XML readable and properly indented.",
  },
  alternates: {
    canonical: "https://codebeauty.com/xml-formatter",
  },
};

export default function XmlFormatter() {
  return (
    <XmlFormatterPage />
  );
}