import React from "react";
import { Search, Globe, Link, FileText, BarChart3, Zap } from "lucide-react";

// SEO & MARKETING TOOLS
const seoTools = [
  { name: "Keyword Density Checker", desc: "Analyze keyword frequency", href: "/tools/keyword-density", icon: Search },
  { name: "Meta Tag Analyzer", desc: "Audit meta tags", href: "/tools/meta-analyzer", icon: FileText },
  { name: "Backlink Checker", desc: "Check backlinks", href: "/tools/backlink-checker", icon: Link },
  { name: "Domain Authority Checker", desc: "Check domain authority", href: "/tools/da-checker", icon: Globe },
  { name: "Page Speed Checker", desc: "Analyze speed", href: "/tools/page-speed", icon: Zap },

  { name: "Sitemap Generator", desc: "Generate XML sitemap", href: "/tools/sitemap-generator", icon: FileText },
  { name: "Robots.txt Generator", desc: "Create robots file", href: "/tools/robots-generator", icon: FileText },
  { name: "Broken Link Checker", desc: "Find broken links", href: "/tools/broken-links", icon: Link },
  { name: "Google Index Checker", desc: "Check indexing", href: "/tools/index-checker", icon: Globe },

  { name: "UTM Builder", desc: "Create tracking URLs", href: "/tools/utm-builder", icon: Link },
  { name: "Campaign URL Builder", desc: "Build campaign links", href: "/tools/campaign-url", icon: Link },

  { name: "Open Graph Generator", desc: "Generate OG tags", href: "/tools/open-graph", icon: FileText },
  { name: "Meta Tag Generator", desc: "Create SEO meta tags", href: "/tools/meta-generator", icon: FileText },

  { name: "Keyword Research Tool", desc: "Find keywords", href: "/tools/keyword-research", icon: Search },
  { name: "SERP Preview Tool", desc: "Preview search results", href: "/tools/serp-preview", icon: Globe },
  { name: "Website Audit Tool", desc: "Full SEO audit", href: "/tools/site-audit", icon: BarChart3 },

  { name: "Redirect Checker", desc: "Check redirects", href: "/tools/redirect-checker", icon: Link },
  { name: "Canonical Tag Checker", desc: "Check canonical", href: "/tools/canonical", icon: FileText },
  { name: "Alt Text Generator", desc: "Generate alt text", href: "/tools/alt-text", icon: FileText },
  { name: "Slug Generator", desc: "Create SEO slugs", href: "/tools/slug-generator", icon: FileText },
  { name: "XML Sitemap Validator", desc: "Validate sitemap", href: "/tools/sitemap-validator", icon: FileText },
];

export default function SeoToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 text-white">

      {/* Hero */}
      <div className="text-center py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 blur-3xl" />

        <h1 className="relative text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-500 text-transparent bg-clip-text">
          SEO & Marketing Tools
        </h1>

        <p className="relative mt-6 text-gray-400 max-w-2xl mx-auto text-lg">
          Advanced SEO tools to analyze, optimize, and grow your website traffic.
        </p>

        <a href="#tools" className="mt-8 inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 font-semibold hover:scale-105 transition">
          Explore Tools
        </a>
      </div>

      {/* Grid */}
      <div id="tools" className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {seoTools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <a key={i} href={tool.href} className="group relative p-[1px] rounded-2xl bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 hover:from-purple-500 hover:to-pink-600 transition">
                <div className="rounded-2xl bg-gray-900/80 backdrop-blur-xl p-6 h-full border border-gray-800 group-hover:border-pink-500 transition">
                  <Icon className="w-8 h-8 mb-4 text-pink-400 group-hover:scale-110 transition" />
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-pink-400">{tool.name}</h3>
                  <p className="text-sm text-gray-400">{tool.desc}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* SEO CONTENT */}
      <div className="max-w-5xl mx-auto px-6 pb-20 text-gray-400 text-sm leading-relaxed space-y-6">
        <h2 className="text-3xl font-bold text-white">Complete SEO & Marketing Tools Guide</h2>

        <p>
          SEO and marketing tools are essential for improving website visibility, increasing traffic, and boosting search engine rankings. Whether you are a blogger, developer, marketer, or business owner, having access to powerful SEO tools can significantly impact your growth.
        </p>

        <p>
          Tools like keyword density checker and keyword research tool help you identify the right keywords and optimize your content effectively. Meta tag analyzer and generator ensure that your pages are properly optimized for search engines.
        </p>

        <p>
          Technical SEO tools such as sitemap generator, robots.txt generator, and broken link checker help improve your website structure and crawling efficiency. These tools ensure that search engines can easily index your website.
        </p>

        <p>
          Marketing tools like UTM builder and campaign URL builder help track user behavior and campaign performance. This data is crucial for improving marketing strategies and ROI.
        </p>

        <p>
          With a modern AI-inspired interface, this platform provides fast, accurate, and user-friendly tools that work seamlessly across devices. Start using these tools today to boost your SEO performance and grow your online presence.
        </p>
      </div>

      <div className="text-center pb-10 text-gray-500 text-sm">
        © {new Date().getFullYear()} SEO Tools
      </div>
    </div>
  );
}
