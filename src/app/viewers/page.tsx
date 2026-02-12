import { Viewers } from "@/components/sections/viewers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Viewers | CodeBeauty",
  description: "View and analyze files with our powerful viewer tools. View JSON, XML, CSV, and more file formats.",
  keywords: "file viewer, json viewer, xml viewer, csv viewer, data viewer",
  openGraph: {
    title: "Viewers | CodeBeauty",
    description: "View and analyze files with our powerful viewer tools. View JSON, XML, CSV, and more file formats.",
    url: "https://codebeauty.com/viewers",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Viewers | CodeBeauty",
    description: "View and analyze files with our powerful viewer tools. View JSON, XML, CSV, and more file formats.",
  },
  alternates: {
    canonical: "https://codebeauty.com/viewers",
  },
};

export default function viewersPage() {
  return (
    <Viewers />
  );
}
