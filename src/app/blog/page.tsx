
import BlogPage from "@/components/sections/blog/blog";
import type { Metadata } from "next";

/* ─── SEO Metadata ───────────────────────────────────────── */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://devlog.io";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "DevLog";

export const metadata: Metadata = {
  title: "Blog — DevLog",
  description:
    "In-depth tutorials, deep dives and engineering insights on Next.js, TypeScript, databases, system design and modern web development.",
  keywords: [
    "web development blog",
    "nextjs tutorials",
    "typescript guide",
    "system design",
    "react patterns",
    "software engineering",
  ],
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/blog`,
    title: "Blog — DevLog",
    description:
      "In-depth tutorials and engineering insights on Next.js, TypeScript and modern web development.",
    siteName: SITE_NAME,
    locale: "en_US",
    images: [
      {
        url: `${SITE_URL}/og/blog.jpg`,
        width: 1200,
        height: 630,
        alt: "DevLog — Tech Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@devlog_io",
    title: "Blog — DevLog",
    description:
      "In-depth tutorials and engineering insights on Next.js, TypeScript and modern web development.",
    images: [`${SITE_URL}/og/blog.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
};

export default function ulogPage() {
  return (
    <BlogPage />
  );
}
