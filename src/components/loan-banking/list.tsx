import React from "react";
import { Calculator, Wallet, BarChart3, TrendingUp, CreditCard, Banknote } from "lucide-react";

// LOAN & BANKING TOOLS
const loanTools = [
  { name: "Personal Loan Calculator", desc: "Calculate personal loan EMI", href: "/tools/personal-loan", icon: Calculator },
  { name: "Home Loan Calculator", desc: "Home loan EMI & interest", href: "/tools/home-loan", icon: Calculator },
  { name: "Car Loan Calculator", desc: "Car loan planning", href: "/tools/car-loan", icon: Calculator },
  { name: "Education Loan Calculator", desc: "Student loan estimation", href: "/tools/education-loan", icon: Calculator },
  { name: "Loan Eligibility Calculator", desc: "Check eligibility", href: "/tools/loan-eligibility", icon: Wallet },
  { name: "Loan Comparison Tool", desc: "Compare loans easily", href: "/tools/loan-compare", icon: BarChart3 },

  { name: "Credit Card EMI Calculator", desc: "Convert CC to EMI", href: "/tools/cc-emi", icon: CreditCard },
  { name: "Interest Rate Calculator", desc: "Calculate interest rates", href: "/tools/interest-rate", icon: Calculator },
  { name: "Amortization Calculator", desc: "Loan schedule breakdown", href: "/tools/amortization", icon: BarChart3 },
  { name: "Gold Loan Calculator", desc: "Gold loan value", href: "/tools/gold-loan", icon: Wallet },
  { name: "Loan Balance Calculator", desc: "Remaining balance", href: "/tools/loan-balance", icon: Calculator },
  { name: "Credit Score Estimator", desc: "Estimate credit score", href: "/tools/credit-score", icon: TrendingUp },

  { name: "Savings Goal Calculator", desc: "Plan savings goals", href: "/tools/savings-goal", icon: Wallet },
  { name: "Recurring Deposit Calculator", desc: "RD returns", href: "/tools/rd", icon: Banknote },
  { name: "Fixed Deposit Calculator", desc: "FD returns", href: "/tools/fd", icon: Banknote },
  { name: "Bank IFSC Finder", desc: "Find IFSC codes", href: "/tools/ifsc", icon: BarChart3 },
];

export default function LoanBankingToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">

      {/* Hero */}
      <div className="text-center py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-indigo-500/20 blur-3xl" />

        <h1 className="relative text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-500 text-transparent bg-clip-text">
          Loan & Banking Tools
        </h1>

        <p className="relative mt-6 text-gray-400 max-w-2xl mx-auto text-lg">
          Smart calculators and banking tools to manage loans, savings, and financial planning.
        </p>

        <a href="#tools" className="mt-8 inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold">
          Explore Tools
        </a>
      </div>

      {/* Grid */}
      <div id="tools" className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loanTools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <a key={i} href={tool.href} className="group relative p-[1px] rounded-2xl bg-gradient-to-r from-blue-500/30 via-cyan-500/30 to-indigo-500/30 hover:from-blue-500 hover:to-indigo-600">
                <div className="rounded-2xl bg-gray-900/80 backdrop-blur-xl p-6 h-full border border-gray-800 group-hover:border-blue-500">
                  <Icon className="w-8 h-8 mb-4 text-blue-400 group-hover:scale-110" />
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400">{tool.name}</h3>
                  <p className="text-sm text-gray-400">{tool.desc}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* SEO Content */}
      <div className="max-w-5xl mx-auto px-6 pb-20 text-gray-400 text-sm leading-relaxed space-y-6">
        <h2 className="text-3xl font-bold text-white">Complete Loan & Banking Tools Guide</h2>
        <p>
          Loan and banking tools are essential for managing personal and business finances. Whether you are planning to take a loan, calculate EMI, or track your savings, these tools simplify complex financial calculations.
        </p>
        <p>
          Loan calculators such as personal loan, home loan, and car loan calculators help users estimate monthly payments and total interest. These tools allow better financial planning before taking any loan.
        </p>
        <p>
          Banking tools like FD and RD calculators help estimate returns on savings. Credit score estimators and loan eligibility tools help users understand their financial position.
        </p>
        <p>
          With a modern AI-inspired interface, these tools provide fast, accurate, and user-friendly experiences across all devices.
        </p>
      </div>

      <div className="text-center pb-10 text-gray-500 text-sm">
        © {new Date().getFullYear()} Loan & Banking Tools
      </div>
    </div>
  );
}
