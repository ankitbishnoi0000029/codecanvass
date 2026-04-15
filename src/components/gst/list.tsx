import React from "react";
import { Calculator, FileText, Search } from "lucide-react";

// ONLY GST TOOLS (pure category)
const gstTools = [
  { name: "GST Calculator", desc: "Calculate GST instantly", href: "/tools/gst-calculator", icon: Calculator },
  { name: "GST Inclusive Calculator", desc: "Price including GST", href: "/tools/gst-inclusive", icon: Calculator },
  { name: "GST Exclusive Calculator", desc: "Price excluding GST", href: "/tools/gst-exclusive", icon: Calculator },
  { name: "Reverse GST Calculator", desc: "Reverse GST calculation", href: "/tools/reverse-gst", icon: Calculator },
  { name: "GST Split Calculator", desc: "Split CGST/SGST/IGST", href: "/tools/gst-split", icon: Calculator },
  { name: "GST Late Fee Calculator", desc: "Late fee estimation", href: "/tools/gst-late-fee", icon: Calculator },
  { name: "Input Tax Credit Calculator", desc: "Calculate ITC", href: "/tools/itc", icon: Calculator },
  { name: "Output Tax Calculator", desc: "Output GST", href: "/tools/output-tax", icon: Calculator },

  { name: "Invoice Generator", desc: "Create GST invoices", href: "/tools/invoice-generator", icon: FileText },
  { name: "E-Invoice Generator", desc: "Generate e-invoices", href: "/tools/e-invoice", icon: FileText },
  { name: "Bulk Invoice Generator", desc: "Generate bulk invoices", href: "/tools/bulk-invoice", icon: FileText },
  { name: "Invoice Number Generator", desc: "Auto invoice numbers", href: "/tools/invoice-number", icon: FileText },
  { name: "Tax Invoice Builder", desc: "Build GST invoices", href: "/tools/tax-invoice", icon: FileText },

  { name: "HSN Code Finder", desc: "Search HSN codes", href: "/tools/hsn-finder", icon: Search },
  { name: "GST Rate Finder", desc: "Find GST rates", href: "/tools/gst-rate", icon: Search },
  { name: "GST Number Validator", desc: "Validate GSTIN", href: "/tools/gstin-validator", icon: Search },
  { name: "GST Compliance Checker", desc: "Check GST compliance", href: "/tools/gst-compliance", icon: Search },

  { name: "GST Return Helper", desc: "Assist GST filing", href: "/tools/gst-return", icon: FileText },
  { name: "E-Way Bill Helper", desc: "E-Way bill assistance", href: "/tools/e-way", icon: FileText },
  { name: "GST Dashboard", desc: "GST analytics dashboard", href: "/tools/gst-dashboard", icon: FileText },
];

export default function GstToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 text-white">

      {/* Hero */}
      <div className="text-center py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-pink-500/20 to-purple-500/20 blur-3xl" />

        <h1 className="relative text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 text-transparent bg-clip-text">
          GST Tools Suite
        </h1>

        <p className="relative mt-6 text-gray-400 max-w-2xl mx-auto text-lg">
          Powerful GST calculators, invoice tools, and compliance utilities for daily business needs.
        </p>

        <a href="#tools" className="mt-8 inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 font-semibold">
          Explore GST Tools
        </a>
      </div>

      {/* Grid */}
      <div id="tools" className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {gstTools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <a key={i} href={tool.href} className="group relative p-[1px] rounded-2xl bg-gradient-to-r from-orange-500/30 via-pink-500/30 to-purple-500/30 hover:from-orange-500 hover:to-pink-600">
                <div className="rounded-2xl bg-gray-900/80 backdrop-blur-xl p-6 h-full border border-gray-800 group-hover:border-orange-500">
                  <Icon className="w-8 h-8 mb-4 text-orange-400 group-hover:scale-110" />
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-orange-400">{tool.name}</h3>
                  <p className="text-sm text-gray-400">{tool.desc}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* LONG SEO CONTENT */}
      <div className="max-w-5xl mx-auto px-6 pb-20 text-gray-400 text-sm leading-relaxed space-y-6">
        <h2 className="text-3xl font-bold text-white">Ultimate GST Tools Guide (Complete Resource)</h2>

        <p>
          GST (Goods and Services Tax) has transformed the taxation system by creating a unified structure for indirect taxes. Businesses, freelancers, and professionals must regularly calculate GST, generate invoices, validate GST numbers, and ensure compliance with government regulations. This GST tools platform is designed to simplify all these tasks using modern, fast, and accurate utilities.
        </p>

        <p>
          Our GST calculator tools allow users to instantly compute tax values including CGST, SGST, and IGST. Whether you want to calculate GST inclusive price or exclusive price, these tools eliminate manual errors and save valuable time. Reverse GST calculation is also available for users who want to derive base price from total price.
        </p>

        <p>
          Invoice generation is a critical part of GST compliance. With tools like invoice generator, e-invoice generator, and bulk invoice generator, businesses can create professional and compliant invoices in seconds. These invoices can include GSTIN, HSN codes, tax breakdown, and all required details.
        </p>

        <p>
          Compliance tools such as GST number validator and GST rate finder ensure that your data is always accurate. These tools help reduce the risk of penalties and make your workflow more efficient.
        </p>

        <p>
          HSN code finder simplifies product classification, while GST return helper assists users in preparing their returns accurately. E-way bill tools further enhance logistics compliance for goods movement.
        </p>

        <p>
          The platform is designed with an AI-inspired modern interface that prioritizes usability and performance. All tools are optimized for mobile and desktop devices, ensuring seamless access anytime, anywhere.
        </p>

        <p>
          Instead of using multiple websites or complex accounting software, this single platform provides everything you need for GST management. It is especially useful for small businesses, startups, and freelancers who want a simple yet powerful solution.
        </p>

        <p>
          Start using GST tools today to streamline your tax calculations, improve accuracy, and save time. With continuous updates and new tools being added regularly, this platform is your one-stop solution for GST and taxation needs.
        </p>

      </div>

      <div className="text-center pb-10 text-gray-500 text-sm">
        © {new Date().getFullYear()} GST Tools
      </div>
    </div>
  );
}
