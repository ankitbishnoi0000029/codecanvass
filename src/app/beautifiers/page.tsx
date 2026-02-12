import { Beautifiers } from "@/components/sections/beautifiers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beautifiers | CodeBeauty",
  description: "Beautify and format code with our powerful beautifier tools. Format JSON, XML, HTML, CSS, and more.",
  keywords: "beautifier tools, code formatter, code beautifier, json beautifier",
  openGraph: {
    title: "Beautifiers | CodeBeauty",
    description: "Beautify and format code with our powerful beautifier tools. Format JSON, XML, HTML, CSS, and more.",
    url: "https://codebeauty.com/beautifiers",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beautifiers | CodeBeauty",
    description: "Beautify and format code with our powerful beautifier tools. Format JSON, XML, HTML, CSS, and more.",
  },
  alternates: {
    canonical: "https://codebeauty.com/beautifiers",
  },
};

export default function ueautifiersPage() {
  return (
    <Beautifiers />
  );
}
