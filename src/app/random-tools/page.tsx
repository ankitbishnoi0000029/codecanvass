import { RandomTools } from "@/components/sections/random-tools";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Random Tools | CodeBeauty",
  description: "Generate random data with our powerful random tools. Generate random numbers, strings, passwords, and more.",
  keywords: "random tools, random generator, random data, random number generator",
  openGraph: {
    title: "Random Tools | CodeBeauty",
    description: "Generate random data with our powerful random tools. Generate random numbers, strings, passwords, and more.",
    url: "https://codebeauty.com/random-tools",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Random Tools | CodeBeauty",
    description: "Generate random data with our powerful random tools. Generate random numbers, strings, passwords, and more.",
  },
  alternates: {
    canonical: "https://codebeauty.com/random-tools",
  },
};

export default function randomtoolsPage() {
  return (
    <RandomTools />
  );
}
