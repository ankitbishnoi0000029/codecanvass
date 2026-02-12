import { Utility } from "@/components/sections/utility";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Utility Tools | CodeBeauty",
  description: "Use our powerful utility tools for various development tasks. Test, validate, and process data efficiently.",
  keywords: "utility tools, developer tools, web utilities, online tools",
  openGraph: {
    title: "Utility Tools | CodeBeauty",
    description: "Use our powerful utility tools for various development tasks. Test, validate, and process data efficiently.",
    url: "https://codebeauty.com/utility",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Utility Tools | CodeBeauty",
    description: "Use our powerful utility tools for various development tasks. Test, validate, and process data efficiently.",
  },
  alternates: {
    canonical: "https://codebeauty.com/utility",
  },
};

export default function utilityPage() {
  return (
    <Utility />
  );
}
