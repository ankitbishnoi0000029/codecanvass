import { ChartTools } from "@/components/sections/chart-tools";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chart Tools | CodeBeauty",
  description: "Create and customize charts with our powerful chart tools. Generate various types of charts and graphs.",
  keywords: "chart tools, graph tools, data visualization, chart generator",
  openGraph: {
    title: "Chart Tools | CodeBeauty",
    description: "Create and customize charts with our powerful chart tools. Generate various types of charts and graphs.",
    url: "https://codebeauty.com/chart-tools",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chart Tools | CodeBeauty",
    description: "Create and customize charts with our powerful chart tools. Generate various types of charts and graphs.",
  },
  alternates: {
    canonical: "https://codebeauty.com/chart-tools",
  },
};

export default function charttoolsPage() {
  return (
    <ChartTools />
  );
}
