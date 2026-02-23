import { QRGenerator } from "@/components/sections/qrGenerator";
import { buildMetadata } from "@/utils/seo/metdata";

export async function generateMetadata() {
  return buildMetadata({
    table: "navbar",
    urlId: 'qrGenerator',
    route: `qrGenerator`,
    fallbackTitle:       "QR Generator Online",
    fallbackDescription: "Free online QR code generator to create QR codes instantly.",
    fallbackKeywords:    "qr generator, qr code, online qr generator, qr tools",
  });
}

export default function QRGeneratorPage() {
  return <QRGenerator />;
}