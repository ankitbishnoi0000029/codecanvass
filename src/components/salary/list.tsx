import React from "react";
import { Calculator, TrendingUp, Wallet, PiggyBank, BarChart3 } from "lucide-react";

const salaryTools = [
  { name: "Salary In-Hand Calculator", desc: "Calculate your take-home salary", href: "/tools/salary-in-hand", icon: Calculator },
  { name: "CTC Calculator", desc: "Break down your CTC", href: "/tools/ctc-calculator", icon: Wallet },
  { name: "PF Calculator", desc: "Estimate provident fund", href: "/tools/pf-calculator", icon: PiggyBank },
  { name: "ESI Calculator", desc: "Employee state insurance", href: "/tools/esi-calculator", icon: Calculator },
  { name: "Gratuity Calculator", desc: "Calculate gratuity amount", href: "/tools/gratuity-calculator", icon: Wallet },
  { name: "Bonus Calculator", desc: "Estimate bonuses", href: "/tools/bonus-calculator", icon: TrendingUp },
  { name: "Salary Hike Calculator", desc: "Check salary increments", href: "/tools/salary-hike", icon: TrendingUp },
  { name: "Overtime Calculator", desc: "Track overtime earnings", href: "/tools/overtime", icon: Calculator },
  { name: "Income Tax Calculator", desc: "Calculate income tax", href: "/tools/income-tax", icon: Wallet },
  { name: "Payslip Generator", desc: "Generate payslips", href: "/tools/payslip-generator", icon: Calculator },
  { name: "Offer Letter Generator", desc: "Create offer letters", href: "/tools/offer-letter", icon: Calculator },
  { name: "Experience Letter Generator", desc: "Generate experience letters", href: "/tools/experience-letter", icon: Calculator },
  { name: "Freelance Rate Calculator", desc: "Set freelance pricing", href: "/tools/freelance-rate", icon: TrendingUp },
  { name: "Hourly Wage Calculator", desc: "Calculate hourly income", href: "/tools/hourly-wage", icon: Calculator },
  { name: "Work Hour Tracker", desc: "Track working hours", href: "/tools/work-hours", icon: BarChart3 },
  { name: "Shift Calculator", desc: "Manage shifts", href: "/tools/shift-calculator", icon: BarChart3 },
  { name: "Leave Calculator", desc: "Track leave balance", href: "/tools/leave-calculator", icon: Wallet },
  { name: "Payroll Generator", desc: "Generate payroll reports", href: "/tools/payroll-generator", icon: Wallet },
  { name: "Retirement Calculator", desc: "Plan retirement savings", href: "/tools/retirement", icon: PiggyBank },
  { name: "Education Cost Calculator", desc: "Estimate education cost", href: "/tools/education-cost", icon: PiggyBank },
  { name: "Wealth Growth Calculator", desc: "Track wealth growth", href: "/tools/wealth-growth", icon: TrendingUp },
  { name: "Savings Calculator", desc: "Plan savings goals", href: "/tools/savings", icon: PiggyBank },
  { name: "Budget Planner", desc: "Manage your budget", href: "/tools/budget-planner", icon: Wallet },
  { name: "Expense Calculator", desc: "Track expenses", href: "/tools/expense-calculator", icon: Calculator },
  { name: "Loan Interest Calculator", desc: "Calculate loan interest", href: "/tools/loan-interest", icon: Calculator },
  { name: "Dividend Yield Calculator", desc: "Estimate dividend returns", href: "/tools/dividend-yield", icon: TrendingUp },
  { name: "Risk Reward Calculator", desc: "Analyze risk vs reward", href: "/tools/risk-reward", icon: BarChart3 },
];

export default function SalaryToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
      {/* Hero */}
      <div className="text-center py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-blue-600/20 to-purple-600/20 blur-3xl" />

        <h1 className="relative text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 text-transparent bg-clip-text">
          Salary & Employment Tools
        </h1>

        <p className="relative mt-6 text-gray-400 max-w-2xl mx-auto text-lg">
          Smart tools for salary calculation, payroll management, and personal finance planning.
        </p>

        <a
          href="#tools"
          className="relative inline-block mt-8 px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 font-semibold hover:opacity-90 transition"
        >
          Explore Tools
        </a>
      </div>

      {/* Tools Grid */}
      <div id="tools" className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {salaryTools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <a
                key={index}
                href={tool.href}
                className="group relative p-[1px] rounded-2xl bg-gradient-to-r from-green-500/30 via-blue-500/30 to-purple-500/30 hover:from-green-500 hover:to-blue-600 transition"
              >
                <div className="rounded-2xl bg-gray-900/80 backdrop-blur-xl p-6 h-full border border-gray-800 group-hover:border-green-500 transition">
                  <Icon className="w-8 h-8 mb-4 text-green-400 group-hover:scale-110 transition" />

                  <h3 className="text-lg font-semibold mb-2 group-hover:text-green-400">
                    {tool.name}
                  </h3>

                  <p className="text-sm text-gray-400">
                    {tool.desc}
                  </p>
                </div>

                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 bg-gradient-to-r from-green-500 to-blue-600 blur-xl transition" />
              </a>
            );
          })}
        </div>
      </div>

      {/* SEO Content Section */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold mb-6">Complete Guide to Salary, Payroll & Financial Planning Tools</h2>
        <div className="space-y-6 text-gray-400 leading-relaxed text-sm">
          <p>
            Salary and employment tools play a crucial role in modern financial planning. Whether you are a salaried employee, freelancer, HR professional, or business owner, having access to accurate and easy-to-use tools can make a huge difference. This page provides a comprehensive collection of calculators and generators that help you manage your salary, track expenses, plan investments, and optimize your financial future.
          </p>
          <p>
            Understanding your salary structure is the first step toward financial awareness. Tools like Salary In-Hand Calculator and CTC Calculator help break down your compensation into various components such as basic salary, allowances, deductions, and taxes. This allows you to clearly see how much money you actually receive after deductions like income tax, provident fund, and other contributions.
          </p>
          <p>
            Government-related deductions such as PF (Provident Fund) and ESI (Employee State Insurance) are important parts of salary planning. With our PF and ESI calculators, you can easily estimate your contributions and understand how they impact your take-home salary. Similarly, the gratuity calculator helps employees estimate the amount they will receive after long-term service.
          </p>
          <p>
            Salary growth is another important aspect of career planning. Tools like Salary Hike Calculator and Bonus Calculator allow you to evaluate different salary increment scenarios. Whether you are negotiating a new offer or expecting an appraisal, these tools help you make informed decisions.
          </p>
          <p>
            For freelancers and remote workers, tools such as Freelance Rate Calculator and Hourly Wage Calculator are extremely useful. They help determine fair pricing for services based on experience, workload, and market conditions. Work Hour Tracker and Shift Calculator further assist in managing time efficiently.
          </p>
          <p>
            Payroll and documentation tools like Payslip Generator, Offer Letter Generator, Experience Letter Generator, and Payroll Generator simplify HR processes. Businesses and startups can generate professional documents quickly without relying on complex software systems.
          </p>
          <p>
            Personal finance management tools such as Budget Planner, Expense Calculator, and Savings Calculator help individuals track their spending habits and plan for future goals. By monitoring income and expenses, users can build better financial discipline and avoid unnecessary debt.
          </p>
          <p>
            Long-term planning tools such as Retirement Calculator, Education Cost Calculator, and Wealth Growth Calculator are essential for securing your future. These tools allow you to estimate how much you need to save and invest in order to achieve your life goals.
          </p>
          <p>
            Investment-focused tools like Dividend Yield Calculator and Risk Reward Calculator help users analyze different investment opportunities. Understanding risk and return is critical in making smart investment decisions.
          </p>
          <p>
            In addition, tools like Loan Interest Calculator help you evaluate borrowing costs, ensuring that you choose the best financial options available. Whether you are taking a personal loan, home loan, or business loan, these insights can save you a significant amount of money.
          </p>
          <p>
            This platform is designed with a modern AI-inspired interface that focuses on simplicity, speed, and accuracy. All tools are optimized for performance and usability, ensuring a seamless experience across devices. Whether you are using a desktop, tablet, or mobile phone, you can access all tools effortlessly.
          </p>
          <p>
            By combining multiple tools into one platform, we eliminate the need to switch between different websites. This not only saves time but also ensures consistency in calculations. Each tool is carefully designed to provide accurate results and a user-friendly experience.
          </p>
          <p>
            Start using these salary and employment tools today to take control of your financial life. Whether your goal is to increase your income, reduce expenses, plan investments, or manage business operations, these tools provide everything you need in one place.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-10 text-gray-500 text-sm">
        © {new Date().getFullYear()} Salary Tools. All rights reserved.
      </div>
    </div>
  );
}
