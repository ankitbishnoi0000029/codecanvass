import React from "react";
import { BarChart3, FileText, Calculator, Wallet, TrendingUp, Users } from "lucide-react";

// TOP BUSINESS TOOLS (50+)
const businessTools = [
  { name: "Invoice Generator", desc: "Create professional invoices", href: "/tools/invoice-generator", icon: FileText },
  { name: "Receipt Generator", desc: "Generate receipts easily", href: "/tools/receipt-generator", icon: FileText },
  { name: "Quotation Generator", desc: "Create business quotations", href: "/tools/quotation", icon: FileText },
  { name: "Purchase Order Generator", desc: "Generate PO documents", href: "/tools/purchase-order", icon: FileText },
  { name: "Billing Software", desc: "Simple billing tool", href: "/tools/billing", icon: Wallet },

  { name: "Profit Margin Calculator", desc: "Calculate business profit", href: "/tools/profit-margin", icon: TrendingUp },
  { name: "Break-even Calculator", desc: "Find break-even point", href: "/tools/break-even", icon: BarChart3 },
  { name: "ROI Calculator", desc: "Return on investment", href: "/tools/roi", icon: TrendingUp },
  { name: "CAGR Calculator", desc: "Annual growth rate", href: "/tools/cagr", icon: TrendingUp },
  { name: "Cash Flow Calculator", desc: "Track cash flow", href: "/tools/cash-flow", icon: Wallet },

  { name: "Expense Tracker", desc: "Track business expenses", href: "/tools/expense-tracker", icon: Wallet },
  { name: "Budget Planner", desc: "Plan business budget", href: "/tools/budget", icon: Wallet },
  { name: "Inventory Management", desc: "Manage stock", href: "/tools/inventory", icon: BarChart3 },
  { name: "Sales Tracker", desc: "Track daily sales", href: "/tools/sales", icon: BarChart3 },
  { name: "Vendor Payment Tracker", desc: "Manage vendor payments", href: "/tools/vendor", icon: Users },

  { name: "Employee Payroll", desc: "Generate payroll", href: "/tools/payroll", icon: Users },
  { name: "Salary Calculator", desc: "Calculate salaries", href: "/tools/salary", icon: Calculator },
  { name: "Loan Calculator", desc: "Business loan planning", href: "/tools/loan", icon: Calculator },
  { name: "Interest Calculator", desc: "Calculate interest", href: "/tools/interest", icon: Calculator },
  { name: "Discount Calculator", desc: "Calculate discounts", href: "/tools/discount", icon: Calculator },

  { name: "Tax Calculator", desc: "Estimate taxes", href: "/tools/tax", icon: Calculator },
  { name: "GST Invoice Tool", desc: "GST billing", href: "/tools/gst-invoice", icon: FileText },
  { name: "Business Name Generator", desc: "Find brand names", href: "/tools/business-name", icon: TrendingUp },
  { name: "Logo Idea Generator", desc: "Brand ideas", href: "/tools/logo-idea", icon: TrendingUp },
  { name: "Market Analysis Tool", desc: "Analyze market trends", href: "/tools/market-analysis", icon: BarChart3 },

  { name: "Customer Tracker", desc: "Manage customers", href: "/tools/customer", icon: Users },
  { name: "Lead Tracker", desc: "Track leads", href: "/tools/leads", icon: Users },
  { name: "Project Cost Calculator", desc: "Estimate project cost", href: "/tools/project-cost", icon: Calculator },
  { name: "Time Tracker", desc: "Track working time", href: "/tools/time-tracker", icon: BarChart3 },
  { name: "Product Pricing Tool", desc: "Set product price", href: "/tools/pricing", icon: Calculator },

  { name: "Freelance Invoice", desc: "Invoices for freelancers", href: "/tools/freelance-invoice", icon: FileText },
  { name: "Startup Cost Calculator", desc: "Estimate startup cost", href: "/tools/startup-cost", icon: Calculator },
  { name: "Revenue Calculator", desc: "Calculate revenue", href: "/tools/revenue", icon: TrendingUp },
  { name: "Profit Forecast Tool", desc: "Predict profits", href: "/tools/forecast", icon: TrendingUp },
  { name: "Business KPI Dashboard", desc: "Track KPIs", href: "/tools/kpi", icon: BarChart3 },

  { name: "Invoice PDF Generator", desc: "Download invoices", href: "/tools/invoice-pdf", icon: FileText },
  { name: "Contract Generator", desc: "Create contracts", href: "/tools/contract", icon: FileText },
  { name: "Agreement Generator", desc: "Generate agreements", href: "/tools/agreement", icon: FileText },
  { name: "HR Letter Generator", desc: "HR documents", href: "/tools/hr-letter", icon: FileText },
  { name: "Meeting Notes Tool", desc: "Record meetings", href: "/tools/meeting-notes", icon: FileText },

  { name: "Task Manager", desc: "Manage tasks", href: "/tools/tasks", icon: BarChart3 },
  { name: "Workflow Planner", desc: "Plan workflow", href: "/tools/workflow", icon: BarChart3 },
  { name: "Business Calendar", desc: "Manage schedule", href: "/tools/calendar", icon: BarChart3 },
  { name: "Reminder Tool", desc: "Set reminders", href: "/tools/reminder", icon: BarChart3 },
  { name: "Client Feedback Tool", desc: "Collect feedback", href: "/tools/feedback", icon: Users },
];

export default function BusinessToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">

      {/* Hero */}
      <div className="text-center py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />

        <h1 className="relative text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 text-transparent bg-clip-text">
          Business Tools Suite
        </h1>

        <p className="relative mt-6 text-gray-400 max-w-2xl mx-auto text-lg">
          Premium collection of business tools to manage finance, operations, and growth.
        </p>

        <a href="#tools" className="mt-8 inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold">
          Explore Tools
        </a>
      </div>

      {/* Grid */}
      <div id="tools" className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {businessTools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <a key={i} href={tool.href} className="group relative p-[1px] rounded-2xl bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 hover:from-indigo-500 hover:to-purple-600">
                <div className="rounded-2xl bg-gray-900/80 backdrop-blur-xl p-6 h-full border border-gray-800 group-hover:border-purple-500">
                  <Icon className="w-8 h-8 mb-4 text-purple-400 group-hover:scale-110" />
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-400">{tool.name}</h3>
                  <p className="text-sm text-gray-400">{tool.desc}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* SEO Content */}
      <div className="max-w-5xl mx-auto px-6 pb-20 text-gray-400 text-sm leading-relaxed space-y-6">
        <h2 className="text-3xl font-bold text-white">Ultimate Business Tools Guide</h2>
        <p>
          Business tools are essential for managing operations, finances, and growth. From invoicing and expense tracking to analytics and planning, these tools simplify complex workflows.
        </p>
        <p>
          This platform provides a premium collection of tools designed for startups, freelancers, and enterprises. Whether you need to generate invoices, track profits, or manage employees, everything is available in one place.
        </p>
        <p>
          With a modern AI-inspired design, these tools are fast, responsive, and easy to use across all devices. They help improve productivity and ensure accuracy in business decisions.
        </p>
      </div>

      <div className="text-center pb-10 text-gray-500 text-sm">
        © {new Date().getFullYear()} Business Tools
      </div>
    </div>
  );
}
