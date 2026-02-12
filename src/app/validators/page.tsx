import { Validators } from "@/components/sections/validators";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Validators | CodeBeauty",
  description: "Validate data formats with our powerful validator tools. Validate JSON, XML, CSV, and more.",
  keywords: "validator, json validator, xml validator, data validation, format validator",
  openGraph: {
    title: "Validators | CodeBeauty",
    description: "Validate data formats with our powerful validator tools. Validate JSON, XML, CSV, and more.",
    url: "https://codebeauty.com/validators",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Validators | CodeBeauty",
    description: "Validate data formats with our powerful validator tools. Validate JSON, XML, CSV, and more.",
  },
  alternates: {
    canonical: "https://codebeauty.com/validators",
  },
};

export default function validatorsPage() {
  return (
    <Validators />
  );
}
