import { BackgroundRemover } from "@/components/sections/background-remover";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Background Remover | CodeBeauty",
  description: "Remove backgrounds from images automatically with our powerful AI-powered background removal tool.",
  keywords: "background remover, remove background, image editor, photo editor",
  openGraph: {
    title: "Background Remover | CodeBeauty",
    description: "Remove backgrounds from images automatically with our powerful AI-powered background removal tool.",
    url: "https://codebeauty.com/backgroundremover",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Background Remover | CodeBeauty",
    description: "Remove backgrounds from images automatically with our powerful AI-powered background removal tool.",
  },
  alternates: {
    canonical: "https://codebeauty.com/backgroundremover",
  },
};

export default function Page() {
  // return <BackgroundRemover />;
  // return <div>Hello</div>;
}
