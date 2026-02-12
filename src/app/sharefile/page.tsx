import RandomToolsPage from "@/components/sections/sharefile";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Share File | CodeBeauty",
  description: "Share files easily and securely with our file sharing tool.",
  keywords: "file sharing, share files, file upload, file transfer",
  openGraph: {
    title: "Share File | CodeBeauty",
    description: "Share files easily and securely with our file sharing tool.",
    url: "https://codebeauty.com/sharefile",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Share File | CodeBeauty",
    description: "Share files easily and securely with our file sharing tool.",
  },
  alternates: {
    canonical: "https://codebeauty.com/sharefile",
  },
};

export default function Page() {
  return (
    <RandomToolsPage/>
  );
}
