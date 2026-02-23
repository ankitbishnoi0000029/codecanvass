import { SyntaxHighlighting } from "@/components/sections/syntax-highlighting";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syntax Highlighting | CodeBeauty",
  description: "Highlight syntax in your code with our powerful syntax highlighting tools. Support for multiple programming languages.",
  keywords: "syntax highlighting, code highlighting, syntax highlighter, code formatter",
  openGraph: {
    title: "Syntax Highlighting | CodeBeauty",
    description: "Highlight syntax in your code with our powerful syntax highlighting tools. Support for multiple programming languages.",
    url: "https://codebeauty.com/syntax-highlighting",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Syntax Highlighting | CodeBeauty",
    description: "Highlight syntax in your code with our powerful syntax highlighting tools. Support for multiple programming languages.",
  },
  alternates: {
    canonical: "https://codebeauty.com/syntax-highlighting",
  },
};

export default function syntaxhighlightingPage() {
  return (
    <SyntaxHighlighting />
  );
}
