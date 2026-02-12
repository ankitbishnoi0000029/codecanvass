import MinifierPage from '@/components/sections/minifiear'
import React from 'react'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minifiers | CodeBeauty",
  description: "Minify your code and files to reduce size and improve performance. Minify CSS, JavaScript, HTML, and more.",
  keywords: "minifier, code minifier, css minifier, js minifier, html minifier",
  openGraph: {
    title: "Minifiers | CodeBeauty",
    description: "Minify your code and files to reduce size and improve performance. Minify CSS, JavaScript, HTML, and more.",
    url: "https://codebeauty.com/minifiears",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Minifiers | CodeBeauty",
    description: "Minify your code and files to reduce size and improve performance. Minify CSS, JavaScript, HTML, and more.",
  },
  alternates: {
    canonical: "https://codebeauty.com/minifiears",
  },
};

const page = () => {
  return (
    <MinifierPage />
  )
}

export default page