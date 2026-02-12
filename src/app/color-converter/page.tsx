import { ColorConverter } from '@/components/sections/color-converter'
import React from 'react'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Converter | CodeBeauty",
  description: "Convert colors between different formats including HEX, RGB, HSL, and more with our powerful color converter tool.",
  keywords: "color converter, hex to rgb, rgb to hex, color picker, color tools",
  openGraph: {
    title: "Color Converter | CodeBeauty",
    description: "Convert colors between different formats including HEX, RGB, HSL, and more with our powerful color converter tool.",
    url: "https://codebeauty.com/color-converter",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Color Converter | CodeBeauty",
    description: "Convert colors between different formats including HEX, RGB, HSL, and more with our powerful color converter tool.",
  },
  alternates: {
    canonical: "https://codebeauty.com/color-converter",
  },
};

const page = () => {
  return (
    <ColorConverter />
  )
}

export default page