import { NumberUtilities } from "@/components/sections/number-utilities";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Number Utilities | CodeBeauty",
  description: "Process and manipulate numbers with our powerful number utility tools. Convert, format, and calculate numbers.",
  keywords: "number utilities, number tools, math utilities, number converter",
  openGraph: {
    title: "Number Utilities | CodeBeauty",
    description: "Process and manipulate numbers with our powerful number utility tools. Convert, format, and calculate numbers.",
    url: "https://codebeauty.com/number-utilities",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Number Utilities | CodeBeauty",
    description: "Process and manipulate numbers with our powerful number utility tools. Convert, format, and calculate numbers.",
  },
  alternates: {
    canonical: "https://codebeauty.com/number-utilities",
  },
};

export default function numuerutilitiesPage() {
  return (
   <NumberUtilities />
  );
}
