import { VideoDownloder } from "@/components/sections/videodownloder";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video Downloader | CodeBeauty",
  description: "Download videos from various platforms with our powerful video downloader tool.",
  keywords: "video downloader, youtube downloader, video download, online video downloader",
  openGraph: {
    title: "Video Downloader | CodeBeauty",
    description: "Download videos from various platforms with our powerful video downloader tool.",
    url: "https://codebeauty.com/videodownloder",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Video Downloader | CodeBeauty",
    description: "Download videos from various platforms with our powerful video downloader tool.",
  },
  alternates: {
    canonical: "https://codebeauty.com/videodownloder",
  },
};

export default function Page() {
  return (
    <VideoDownloder />
  );
}