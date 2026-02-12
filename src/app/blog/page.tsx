import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | CodeBeauty",
  description: "Read our latest blog posts about developer tools, coding tips, and technology insights.",
  keywords: "blog, developer blog, coding tips, technology blog",
  openGraph: {
    title: "Blog | CodeBeauty",
    description: "Read our latest blog posts about developer tools, coding tips, and technology insights.",
    url: "https://codebeauty.com/blog",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | CodeBeauty",
    description: "Read our latest blog posts about developer tools, coding tips, and technology insights.",
  },
  alternates: {
    canonical: "https://codebeauty.com/blog",
  },
};

export default function ulogPage() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Blog</h1>
      <p>/blog</p>
    </main>
  );
}
