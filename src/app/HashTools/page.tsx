import HashTools from "@/components/sections/hash-generator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hash Tools | CodeBeauty",
  description: "Generate and verify hashes using various algorithms including MD5, SHA1, SHA256, and more with our powerful hash tools.",
  keywords: "hash generator, md5, sha1, sha256, hash tools, password hash",
  openGraph: {
    title: "Hash Tools | CodeBeauty",
    description: "Generate and verify hashes using various algorithms including MD5, SHA1, SHA256, and more with our powerful hash tools.",
    url: "https://codebeauty.com/HashTools",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hash Tools | CodeBeauty",
    description: "Generate and verify hashes using various algorithms including MD5, SHA1, SHA256, and more with our powerful hash tools.",
  },
  alternates: {
    canonical: "https://codebeauty.com/HashTools",
  },
};

export default function sqlconvertersPage() {
    return (
      <HashTools />
    );
  }