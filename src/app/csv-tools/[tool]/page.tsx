import { CsvTools } from "@/components/sections/csv-tools";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSV Tools | CodeBeauty",
  description: "Process and convert CSV files with our powerful CSV tools. Convert CSV to JSON, XML, and more formats.",
  keywords: "csv tools, csv converter, csv processor, csv to json",
  openGraph: {
    title: "CSV Tools | CodeBeauty",
    description: "Process and convert CSV files with our powerful CSV tools. Convert CSV to JSON, XML, and more formats.",
    url: "https://codebeauty.com/csv-tools",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSV Tools | CodeBeauty",
    description: "Process and convert CSV files with our powerful CSV tools. Convert CSV to JSON, XML, and more formats.",
  },
  alternates: {
    canonical: "https://codebeauty.com/csv-tools",
  },
};

export default function csvtoolsPage() {
  return (
    <CsvTools />
  );
}
