
import { getMetaCached } from "@/actions/dbAction"
import { QRGenerator } from "@/components/sections/qrGenerator";

export const dynamic = "force-dynamic";
export async function generateMetadata() {

  const data = await getMetaCached('qr-generator');

  return {
    title: data?.title || "QR Generator Online",
    description: data?.description || "Free online QR code generator to create QR codes instantly.",
    keywords: data?.keywords || "qr generator, qr code, online qr generator, qr tools",
    robots: "index, follow",
  };
}




export default async function Page() {
  
  const data = await getMetaCached('qr-generator');

  return <QRGenerator data={data.pageData} />;
}

