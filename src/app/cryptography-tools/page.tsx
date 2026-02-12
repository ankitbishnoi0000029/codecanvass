import { CryptographyTools } from "@/components/sections/cryptography-tools";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cryptography Tools | CodeBeauty",
  description: "Encrypt, decrypt, and hash data with our powerful cryptography tools. MD5, SHA, AES, and more encryption tools.",
  keywords: "cryptography tools, encryption, decryption, hashing, md5, sha256",
  openGraph: {
    title: "Cryptography Tools | CodeBeauty",
    description: "Encrypt, decrypt, and hash data with our powerful cryptography tools. MD5, SHA, AES, and more encryption tools.",
    url: "https://codebeauty.com/cryptography-tools",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cryptography Tools | CodeBeauty",
    description: "Encrypt, decrypt, and hash data with our powerful cryptography tools. MD5, SHA, AES, and more encryption tools.",
  },
  alternates: {
    canonical: "https://codebeauty.com/cryptography-tools",
  },
};

export default function cryptographytoolsPage() {
  return (
    <CryptographyTools />
  );
}
