import { ProgrammingEditors } from "@/components/sections/programming-editors";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programming Editors | CodeBeauty",
  description: "Edit and work with code using our powerful programming editors. Support for multiple programming languages.",
  keywords: "programming editor, code editor, text editor, online code editor",
  openGraph: {
    title: "Programming Editors | CodeBeauty",
    description: "Edit and work with code using our powerful programming editors. Support for multiple programming languages.",
    url: "https://codebeauty.com/programming-editors",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Programming Editors | CodeBeauty",
    description: "Edit and work with code using our powerful programming editors. Support for multiple programming languages.",
  },
  alternates: {
    canonical: "https://codebeauty.com/programming-editors",
  },
};

export default function programmingeditorsPage() {
  return (
   <ProgrammingEditors />
  );
}
