import { StringUtilities } from '../../components/sections/string-utilities'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "String Utilities | CodeBeauty",
  description: "Process and manipulate strings with our powerful string utility tools. Convert, format, and analyze text data.",
  keywords: "string utilities, string tools, text processing, string manipulation",
  openGraph: {
    title: "String Utilities | CodeBeauty",
    description: "Process and manipulate strings with our powerful string utility tools. Convert, format, and analyze text data.",
    url: "https://codebeauty.com/string-utilities",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "String Utilities | CodeBeauty",
    description: "Process and manipulate strings with our powerful string utility tools. Convert, format, and analyze text data.",
  },
  alternates: {
    canonical: "https://codebeauty.com/string-utilities",
  },
};

export default function Page() {
  return <StringUtilities />
}
