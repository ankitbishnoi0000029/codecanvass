import { BitwiseTools } from "@/components/sections/bitwise-tools";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bitwise Tools | CodeBeauty",
  description: "Perform bitwise operations with our powerful bitwise tools. AND, OR, XOR, and more bitwise operations.",
  keywords: "bitwise tools, bitwise operations, binary operations, bitwise calculator",
  openGraph: {
    title: "Bitwise Tools | CodeBeauty",
    description: "Perform bitwise operations with our powerful bitwise tools. AND, OR, XOR, and more bitwise operations.",
    url: "https://codebeauty.com/bitwise-tools",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bitwise Tools | CodeBeauty",
    description: "Perform bitwise operations with our powerful bitwise tools. AND, OR, XOR, and more bitwise operations.",
  },
  alternates: {
    canonical: "https://codebeauty.com/bitwise-tools",
  },
};

export default function uitwisetoolsPage() {
  return (
    <BitwiseTools />
  );
}
