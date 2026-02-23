import { CssTools } from "@/components/sections/css-tools";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS Tools | CodeBeauty",
  description: "Process and work with CSS using our powerful CSS tools. Minify, format, validate, and more CSS utilities.",
  keywords: "css tools, css utilities, stylesheet tools, css minifier, css formatter",
  openGraph: {
    title: "CSS Tools | CodeBeauty",
    description: "Process and work with CSS using our powerful CSS tools. Minify, format, validate, and more CSS utilities.",
    url: "https://codebeauty.com/css-tools",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSS Tools | CodeBeauty",
    description: "Process and work with CSS using our powerful CSS tools. Minify, format, validate, and more CSS utilities.",
  },
  alternates: {
    canonical: "https://codebeauty.com/css-tools",
  },
};

export default function csstoolsPage() {
  return (
    <CssTools />
  );
}
