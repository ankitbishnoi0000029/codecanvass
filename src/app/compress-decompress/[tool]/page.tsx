import { CompressDecompress } from "@/components/sections/compress-decompress";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress/Decompress Tools | CodeBeauty",
  description: "Compress and decompress files with our powerful compression tools. ZIP, GZIP, and more compression formats.",
  keywords: "compress, decompress, compression tools, zip tools, file compression",
  openGraph: {
    title: "Compress/Decompress Tools | CodeBeauty",
    description: "Compress and decompress files with our powerful compression tools. ZIP, GZIP, and more compression formats.",
    url: "https://codebeauty.com/compress-decompress",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compress/Decompress Tools | CodeBeauty",
    description: "Compress and decompress files with our powerful compression tools. ZIP, GZIP, and more compression formats.",
  },
  alternates: {
    canonical: "https://codebeauty.com/compress-decompress",
  },
};

export default function compressdecompressPage() {
  return (
    <CompressDecompress />
  );
}
