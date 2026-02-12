import { OtherTools } from "@/components/sections/other-tools";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Other Tools | CodeBeauty",
  description: "Explore our collection of other useful tools and utilities for various tasks.",
  keywords: "tools, utilities, online tools, web tools",
  openGraph: {
    title: "Other Tools | CodeBeauty",
    description: "Explore our collection of other useful tools and utilities for various tasks.",
    url: "https://codebeauty.com/other-tools",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Other Tools | CodeBeauty",
    description: "Explore our collection of other useful tools and utilities for various tasks.",
  },
  alternates: {
    canonical: "https://codebeauty.com/other-tools",
  },
};

export default function othertoolsPage() {
  return (
    <OtherTools />
  );
}
