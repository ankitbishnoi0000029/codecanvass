import { Minifier } from "@/components/sections/minifier";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minifier | CodeBeauty",
  description: "Minify your code and files to reduce size and improve performance. Minify CSS, JavaScript, HTML, and more.",
  keywords: "minifier, code minifier, css minifier, js minifier, html minifier",
  openGraph: {
    title: "Minifier | CodeBeauty",
    description: "Minify your code and files to reduce size and improve performance. Minify CSS, JavaScript, HTML, and more.",
    url: "https://codebeauty.com/minifier",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Minifier | CodeBeauty",
    description: "Minify your code and files to reduce size and improve performance. Minify CSS, JavaScript, HTML, and more.",
  },
  alternates: {
    canonical: "https://codebeauty.com/minifier",
  },
};

export default function minifierPage() {
  return (
    <Minifier />
  );
}
