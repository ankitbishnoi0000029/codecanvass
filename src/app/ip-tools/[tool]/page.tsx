import { IPTools } from "@/components/sections/ip-tools";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IP Tools | CodeBeauty",
  description: "Check and analyze IP addresses with our powerful IP tools. Lookup IP information, check IP location, and more.",
  keywords: "ip tools, ip address, network tools, ip lookup, ip checker",
  openGraph: {
    title: "IP Tools | CodeBeauty",
    description: "Check and analyze IP addresses with our powerful IP tools. Lookup IP information, check IP location, and more.",
    url: "https://codebeauty.com/ip-tools",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "IP Tools | CodeBeauty",
    description: "Check and analyze IP addresses with our powerful IP tools. Lookup IP information, check IP location, and more.",
  },
  alternates: {
    canonical: "https://codebeauty.com/ip-tools",
  },
};

export default function iptoolsPage() {
  return (
    <IPTools />
  );
}
