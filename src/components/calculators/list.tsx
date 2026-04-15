import React from "react";
import { Calculator, TrendingUp, Wallet, PiggyBank, BarChart3 } from "lucide-react";

const tools = [
  { name: "EMI Calculator", desc: "Calculate monthly loan EMI instantly", href: "/calculators/emi-calculator", icon: Calculator },
  { name: "Simple Interest Calculator", desc: "Quickly compute simple interest", href: "/calculators/simple-interest", icon: Calculator },
  { name: "Compound Interest Calculator", desc: "See compound growth of money", href: "/calculators/compound-interest", icon: TrendingUp },
  { name: "SIP Calculator", desc: "Plan your SIP investments", href: "/calculators/sip-calculator", icon: TrendingUp },
  { name: "SWP Calculator", desc: "Estimate SWP withdrawals", href: "/calculators/swp-calculator", icon: Wallet },
  { name: "FD Calculator", desc: "Fixed deposit returns", href: "/calculators/fd-calculator", icon: PiggyBank },
  { name: "RD Calculator", desc: "Recurring deposit planning", href: "/calculators/rd-calculator", icon: PiggyBank },
  { name: "PPF Calculator", desc: "Plan PPF savings", href: "/calculators/ppf-calculator", icon: PiggyBank },
  { name: "NPS Calculator", desc: "Retirement planning made easy", href: "/calculators/nps-calculator", icon: Wallet },
  { name: "Inflation Calculator", desc: "Check inflation impact", href: "/calculators/inflation-calculator", icon: BarChart3 },
  { name: "ROI Calculator", desc: "Return on investment", href: "/calculators/roi-calculator", icon: BarChart3 },
  { name: "CAGR Calculator", desc: "Annual growth rate", href: "/calculators/cagr-calculator", icon: BarChart3 },
  { name: "Discount Calculator", desc: "Find discounts quickly", href: "/calculators/discount-calculator", icon: Calculator },
  { name: "Profit/Loss Calculator", desc: "Track profit & loss", href: "/calculators/profit-loss", icon: TrendingUp },
  { name: "Break-even Calculator", desc: "Find break-even point", href: "/calculators/break-even", icon: BarChart3 },
  { name: "Loan Prepayment Calculator", desc: "Plan loan closure", href: "/calculators/loan-prepayment", icon: Wallet },
  { name: "Tax Saving Calculator", desc: "Optimize taxes", href: "/calculators/tax-saving", icon: Wallet },
  { name: "Capital Gains Calculator", desc: "Calculate capital gains", href: "/calculators/capital-gains", icon: TrendingUp },
  { name: "Stock Average Calculator", desc: "Average stock price", href: "/calculators/stock-average", icon: TrendingUp },
  { name: "Brokerage Calculator", desc: "Calculate brokerage fees", href: "/calculators/brokerage", icon: Calculator },
  { name: "Intraday Profit Calculator", desc: "Intraday profit analysis", href: "/calculators/intraday-profit", icon: TrendingUp },
  { name: "Mutual Fund Calculator", desc: "MF returns estimation", href: "/calculators/mutual-fund", icon: PiggyBank },
  { name: "Inventory Management Tool", desc: "Manage inventory easily", href: "/calculators/inventory", icon: BarChart3 },
  { name: "Receipt Generator", desc: "Generate receipts fast", href: "/calculators/receipt-generator", icon: Calculator },
  { name: "Profit Margin Calculator", desc: "Calculate profit margins", href: "/calculators/profit-margin", icon: TrendingUp },
  { name: "Business Loan Calculator", desc: "Business loan planning", href: "/calculators/business-loan", icon: Wallet },
  { name: "Sales Tax Calculator", desc: "Calculate sales tax", href: "/calculators/sales-tax", icon: Calculator },
  { name: "Vendor Payment Tracker", desc: "Track vendor payments", href: "/calculators/vendor-payment", icon: Wallet },
];

export default function FinancialToolsWelcome() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative text-center py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl" />

        <h1 className="relative text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 text-transparent bg-clip-text">
          AI Financial Tools
        </h1>

        <p className="relative mt-6 text-gray-400 max-w-2xl mx-auto text-lg">
          Smart, fast and modern financial calculators to boost your productivity. 
          Plan investments, track profits, and grow your money with AI-powered tools.
        </p>

        <div className="relative mt-8 flex justify-center gap-4 flex-wrap">
          <a
            href="#calculators"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition font-semibold"
          >
            Explore Tools
          </a>

          <a
            href="/calculators/emi-calculator"
            className="px-6 py-3 rounded-xl border border-gray-700 hover:border-purple-500 transition"
          >
            Start with EMI
          </a>
        </div>
      </div>

      {/* Tools Grid */}
      <div id="calculators" className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold mb-10 text-center">Popular Tools</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <a
                key={index}
                href={tool.href}
                className="group relative p-[1px] rounded-2xl bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 hover:from-blue-500 hover:to-purple-600 transition"
              >
                <div className="rounded-2xl bg-gray-900/80 backdrop-blur-xl p-6 h-full border border-gray-800 group-hover:border-purple-500 transition">
                  <Icon className="w-8 h-8 mb-4 text-purple-400 group-hover:scale-110 transition" />

                  <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-400">
                    {tool.name}
                  </h3>

                  <p className="text-sm text-gray-400">
                    {tool.desc}
                  </p>
                </div>

                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 bg-gradient-to-r from-blue-500 to-purple-600 blur-xl transition" />
              </a>
            );
          })}
        </div>
      </div>

      {/* SEO Content Section */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold mb-6">All-in-One Financial Calculators & Business Tools</h2>
        <div className="space-y-6 text-gray-400 leading-relaxed text-sm">
          <p>
            Welcome to the ultimate collection of financial calculators and business tools designed to simplify your daily calculations and long-term planning. Whether you are an individual investor, a business owner, or someone who simply wants to manage personal finances better, this platform provides powerful and easy-to-use tools. From EMI calculators to advanced investment planning tools like SIP, CAGR, and ROI calculators, everything is available in one place with a modern AI-powered interface.
          </p>
          <p>
            Financial planning is one of the most important aspects of life today. With rising inflation, changing interest rates, and evolving investment opportunities, it becomes crucial to make informed decisions. Our tools help you analyze different scenarios quickly. For example, the EMI calculator helps you determine your monthly loan payments, while the compound interest calculator shows how your money can grow over time. These insights allow you to plan better and avoid financial risks.
          </p>
          <p>
            Investment tools like SIP, SWP, mutual fund, and stock average calculators are specially designed for modern investors. They allow you to simulate different investment strategies and understand returns before actually investing money. Similarly, tools like ROI and CAGR calculators give you a clear picture of performance over time, helping you compare different investment options effectively.
          </p>
          <p>
            For business users, we offer tools such as profit margin calculator, break-even calculator, inventory management, vendor payment tracker, and receipt generator. These tools help streamline daily operations and improve efficiency. Instead of relying on complex spreadsheets, you can now manage everything with simple and intuitive interfaces.
          </p>
          <p>
            Tax-related tools like tax saving calculator, capital gains calculator, and sales tax calculator help you stay compliant and optimize your savings. Understanding taxes can be complicated, but with the help of these tools, you can quickly estimate liabilities and plan accordingly.
          </p>
          <p>
            Another important category includes personal finance tracking tools such as net worth calculator and cash flow calculator. These tools give you a complete overview of your financial health. By tracking assets, liabilities, income, and expenses, you can make smarter financial decisions and achieve long-term goals.
          </p>
          <p>
            Our platform is designed with a focus on speed, accuracy, and user experience. The AI-inspired design ensures that everything looks modern and feels intuitive. Whether you are accessing the tools from a desktop or a mobile device, the responsive layout ensures a seamless experience.
          </p>
          <p>
            In today's digital world, having access to reliable financial tools is essential. This platform eliminates the need to visit multiple websites by bringing all important calculators under one roof. It not only saves time but also ensures consistency and accuracy in calculations.
          </p>
          <p>
            Start exploring the tools above and take control of your finances today. Whether your goal is to save more, invest smarter, or manage your business efficiently, these tools are built to support you every step of the way.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-10 text-gray-500 text-sm">
        © {new Date().getFullYear()} AI Financial Tools. All rights reserved.
      </div>
    </div>
  );
}
