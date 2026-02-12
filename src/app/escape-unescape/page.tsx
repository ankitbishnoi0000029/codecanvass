import { EscapeUnescape } from "@/components/sections/escape-unescape";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Escape/Unescape Tools | CodeBeauty",
  description: "Escape and unescape strings with our powerful escape/unescape tools. HTML escape, URL escape, and more.",
  keywords: "escape, unescape, string escape, html escape, url escape",
  openGraph: {
    title: "Escape/Unescape Tools | CodeBeauty",
    description: "Escape and unescape strings with our powerful escape/unescape tools. HTML escape, URL escape, and more.",
    url: "https://codebeauty.com/escape-unescape",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Escape/Unescape Tools | CodeBeauty",
    description: "Escape and unescape strings with our powerful escape/unescape tools. HTML escape, URL escape, and more.",
  },
  alternates: {
    canonical: "https://codebeauty.com/escape-unescape",
  },
};

export default function escapeunescapePage() {
  return (
    <EscapeUnescape />
  );
}
