import { QRGenerator } from "@/components/sections/qrGenerator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Code Generator | CodeBeauty",
  description: "Generate QR codes quickly and easily with our QR code generator. Create QR codes for URLs, text, and more.",
  keywords: "qr code generator, qr code, qr generator, barcode generator",
  openGraph: {
    title: "QR Code Generator | CodeBeauty",
    description: "Generate QR codes quickly and easily with our QR code generator. Create QR codes for URLs, text, and more.",
    url: "https://codebeauty.com/qrGenerator",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Code Generator | CodeBeauty",
    description: "Generate QR codes quickly and easily with our QR code generator. Create QR codes for URLs, text, and more.",
  },
  alternates: {
    canonical: "https://codebeauty.com/qrGenerator",
  },
};

export default function QRGeneratorPage() {
  return <QRGenerator />;
}