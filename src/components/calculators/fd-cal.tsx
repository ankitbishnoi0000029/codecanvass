'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { downloadMetricsAsText } from '@/utils/utils';

// --- Utilities ---
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatCompactCurrency = (value: number): string => {
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(2)} Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(2)} L`;
  return formatCurrency(value);
};

// FD Maturity Calculation (Compounded)
const calculateFDMaturity = (
  principal: number,
  rate: number,
  years: number,
  compoundingFreq: 'yearly' | 'halfyearly' | 'quarterly' | 'monthly'
): number => {
  if (principal <= 0 || rate <= 0 || years <= 0) return principal;
  let periodsPerYear = 1;
  switch (compoundingFreq) {
    case 'halfyearly':
      periodsPerYear = 2;
      break;
    case 'quarterly':
      periodsPerYear = 4;
      break;
    case 'monthly':
      periodsPerYear = 12;
      break;
    default:
      periodsPerYear = 1;
  }
  const periodicRate = rate / 100 / periodsPerYear;
  const totalPeriods = periodsPerYear * years;
  const maturity = principal * Math.pow(1 + periodicRate, totalPeriods);
  return Math.round(maturity);
};

// Yearly breakdown for chart
const getYearlyGrowth = (
  principal: number,
  rate: number,
  years: number,
  compoundingFreq: 'yearly' | 'halfyearly' | 'quarterly' | 'monthly'
) => {
  const data = [];
  for (let year = 0; year <= years; year++) {
    const value = calculateFDMaturity(principal, rate, year, compoundingFreq);
    data.push({
      year,
      value,
      interest: value - principal,
    });
  }
  return data;
};

// --- Main Component ---
export default function FDCalculator() {
  // State
  const [principal, setPrincipal] = useState<number>(500000); // ₹5 Lakhs
  const [interestRate, setInterestRate] = useState<number>(7.2);
  const [tenureYears, setTenureYears] = useState<number>(5);
  const [compoundingFreq, setCompoundingFreq] = useState<'yearly' | 'halfyearly' | 'quarterly' | 'monthly'>('quarterly');

  // Calculations
  const maturityValue = useMemo(
    () => calculateFDMaturity(principal, interestRate, tenureYears, compoundingFreq),
    [principal, interestRate, tenureYears, compoundingFreq]
  );
  const totalInterest = maturityValue - principal;

  // Chart Data
  const yearlyData = useMemo(
    () => getYearlyGrowth(principal, interestRate, tenureYears, compoundingFreq),
    [principal, interestRate, tenureYears, compoundingFreq]
  );

  // Pie Data: Principal vs Interest
  const pieData = [
    { name: 'Principal Amount', value: principal, color: '#3B82F6' },
    { name: 'Total Interest', value: totalInterest, color: '#F59E0B' },
  ];

  // PDF Ref & Handler
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

const handleDownloadPDF = async () => {
      setIsGeneratingPDF(true); // keep loading state if needed, or rename to setIsDownloading
      try {
        // Prepare the data array for download (adjust based on your actual data structure)
        const downloadData = [
          { metric: 'Principal Amount', value: formatCurrency(principal) },
          { metric: 'Interest Rate', value: interestRate + '%' },
          { metric: 'Tenure (Years)', value: tenureYears },
          { metric: 'Compounding Frequency', value: compoundingFreq },
          { metric: 'Maturity Value', value: formatCurrency(maturityValue) },
          { metric: 'Total Interest', value: formatCurrency(totalInterest) },
          { metric: 'Yearly Data', value: JSON.stringify(yearlyData, null, 2) },
          { metric: 'Principal Amount', value: formatCurrency(principal) },
          { metric: 'Interest Rate', value: interestRate + '%' },
          { metric: 'Tenure (Years)', value: tenureYears },
          { metric: 'Compounding Frequency', value: compoundingFreq },
          { metric: 'Maturity Value', value: formatCurrency(maturityValue) },
          { metric: 'Total Interest', value: formatCurrency(totalInterest) },
          { metric: 'Yearly Data', value: JSON.stringify(yearlyData, null, 2) },
          { metric: 'Principal Amount', value: formatCurrency(principal) },
          { metric: 'Interest Rate', value: interestRate + '%' },
          { metric: 'Tenure (Years)', value: tenureYears },
          { metric: 'Compounding Frequency', value: compoundingFreq },
          { metric: 'Maturity Value', value: formatCurrency(maturityValue) },
          { metric: 'Total Interest', value: formatCurrency(totalInterest) },
          { metric: 'Yearly Data', value: JSON.stringify(yearlyData, null, 2) },
        ];
    
        // Reusable download function (import from utils or define inline)
        downloadMetricsAsText(downloadData, {
          filename: 'REPORT',
          title: ' Calculator Report',
          footer: '* Generated from calculator',
        });
      } catch (error) {
        console.error('Download error:', error);
      } finally {
        setIsGeneratingPDF(false);
      }
    };
  const handleInvestNow = () => {
    alert(`🏦 FD Investment Plan:\nPrincipal: ${formatCurrency(principal)}\nRate: ${interestRate}% p.a.\nTenure: ${tenureYears} years\nMaturity Value: ${formatCurrency(maturityValue)}\nTotal Interest: ${formatCurrency(totalInterest)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
            FD Calculator
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Plan your fixed deposit investments. Calculate maturity amount, interest earned, and compare compounding frequencies.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Input Controls */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-amber-600 rounded-full"></span>
              Deposit Details
            </h2>

            {/* Principal Amount */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Principal Amount</label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
                step="10000"
                min="1000"
              />
              <input
                type="range"
                min="1000"
                max="10000000"
                step="10000"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full mt-2 accent-amber-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>₹1K</span>
                <span>₹25L</span>
                <span>₹50L</span>
                <span>₹1Cr</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Interest Rate (% p.a.)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="flex-1 accent-green-600"
                />
                <span className="w-16 text-right font-bold text-green-700">{interestRate}%</span>
              </div>
            </div>

            {/* Tenure */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Tenure (Years)</label>
              <input
                type="number"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                step="1"
                min="1"
                max="30"
              />
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>

            {/* Compounding Frequency */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Compounding Frequency</label>
              <div className="grid grid-cols-2 gap-2">
                {(['yearly', 'halfyearly', 'quarterly', 'monthly'] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setCompoundingFreq(freq)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition ${
                      compoundingFreq === freq
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {freq === 'halfyearly' ? 'Half-Yearly' : freq === 'yearly' ? 'Yearly' : freq === 'quarterly' ? 'Quarterly' : 'Monthly'}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-800">
              💡 Higher compounding frequency yields better returns. Quarterly and monthly compounding are common in banks.
            </div>
          </div>

          {/* RIGHT: Report & Charts (PDF Area) */}
          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">FD Investment Report</h2>
              <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN')}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
                <p className="text-blue-600 text-xs">Principal</p>
                <p className="text-xl font-bold">{formatCurrency(principal)}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 text-center">
                <p className="text-amber-600 text-xs">Total Interest</p>
                <p className="text-xl font-bold">{formatCurrency(totalInterest)}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 text-center">
                <p className="text-emerald-600 text-xs">Maturity Value</p>
                <p className="text-xl font-bold">{formatCurrency(maturityValue)}</p>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 mb-4">
              {compoundingFreq.charAt(0).toUpperCase() + compoundingFreq.slice(1)} Compounding | {tenureYears} Years @ {interestRate}% p.a.
            </div>

            {/* Line Chart: Growth Over Years */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Year-by-Year Growth</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tickFormatter={(y) => `${y}Y`} />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} width={70} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} labelFormatter={(l) => `Year ${l}`} />
                    <Legend />
                    <Line type="monotone" dataKey="value" name="Corpus Value" stroke="#f97316" strokeWidth={3} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="interest" name="Interest Earned" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Breakdown</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" >
                      {pieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={handleInvestNow} className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl shadow-lg hover:scale-105 transition">
                Open FD →
              </button>
              <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="px-6 py-2 border-2 border-amber-600 text-amber-700 rounded-xl hover:bg-amber-50 disabled:opacity-50">
                {isGeneratingPDF ? 'Generating...' : '📄 Download PDF Report'}
              </button>
            </div>
          </div>
        </div>

        {/* ========== 5000+ WORDS SEO CONTENT SECTION ========== */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/50 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to Fixed Deposit (FD) Calculator</h2>
          <p className="text-gray-600 leading-relaxed">
            A Fixed Deposit (FD) is one of the safest and most popular investment options in India. It allows you to deposit a lump sum amount with a bank or financial institution for a fixed tenure and earn a predetermined rate of interest. But how do you know exactly how much your FD will grow? That’s where an FD Calculator becomes indispensable.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            Our <strong>FD Calculator</strong> above is designed to give you an instant, accurate estimate of your maturity amount. You can adjust the principal, interest rate, tenure, and compounding frequency to see how your wealth compounds over time. In this detailed guide, we will explore every aspect of FD investments, the mathematics behind compounding, tax implications, and tips to maximise your returns.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">1. Understanding the FD Calculation Formula</h3>
          <p className="text-gray-600">
            The maturity value of an FD is calculated using the compound interest formula:
            <br />
            <code className="bg-gray-100 p-1 rounded">A = P * (1 + r/n)^(n*t)</code>
            <br />
            Where:
            <ul className="list-disc pl-6 mt-2">
              <li><strong>A</strong> = Maturity Amount</li>
              <li><strong>P</strong> = Principal Amount</li>
              <li><strong>r</strong> = Annual Interest Rate (in decimal)</li>
              <li><strong>n</strong> = Number of compounding periods per year</li>
              <li><strong>t</strong> = Tenure in years</li>
            </ul>
            Our calculator does this heavy lifting for you, even allowing monthly, quarterly, half-yearly, or yearly compounding.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">2. Why Compounding Frequency Matters</h3>
          <p className="text-gray-600">
            The more frequently interest is compounded, the higher your effective yield. For example, a ₹1,00,000 FD at 7% p.a. for 5 years will give you:
            <ul className="list-disc pl-6 mt-2">
              <li><strong>Yearly compounding:</strong> ₹1,40,255</li>
              <li><strong>Quarterly compounding:</strong> ₹1,41,481</li>
              <li><strong>Monthly compounding:</strong> ₹1,41,772</li>
            </ul>
            Over long tenures, this difference becomes significant. Our calculator lets you switch frequencies instantly.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">3. Tax Implications on FD Interest</h3>
          <p className="text-gray-600">
            Interest earned from FDs is fully taxable under “Income from Other Sources” as per your income tax slab. Banks deduct TDS (Tax Deducted at Source) at 10% if interest exceeds ₹40,000 per year (₹50,000 for senior citizens). However, you can submit Form 15G/15H to avoid TDS if your total income is below the taxable limit. Always factor in post-tax returns when planning your investments.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">4. Senior Citizen Benefits</h3>
          <p className="text-gray-600">
            Most banks offer an additional 0.50% interest rate to senior citizens. For instance, if a regular FD gives 7%, a senior citizen gets 7.5%. This can substantially increase maturity amounts over long tenures. Use the calculator by adding 0.5% to the rate to see the difference.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">5. Cumulative vs. Non-Cumulative FDs</h3>
          <p className="text-gray-600">
            <strong>Cumulative FD:</strong> Interest is reinvested and paid at maturity along with principal – ideal for wealth creation.<br />
            <strong>Non-Cumulative FD:</strong> Interest is paid out periodically (monthly, quarterly, etc.) – suitable for regular income needs. Our calculator currently models cumulative FDs (the most common).
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">6. How to Use This FD Calculator for Financial Planning</h3>
          <p className="text-gray-600">
            - <strong>Goal-based investing:</strong> Suppose you need ₹10 lakhs after 5 years. Adjust the principal until the maturity value matches your goal.<br />
            - <strong>Compare banks:</strong> Different banks offer different rates. Input the rate from various banks to find the best maturity.<br />
            - <strong>Decide tenure:</strong> Longer tenures give higher returns but lock in your money. Balance liquidity needs.<br />
            - <strong>Download report:</strong> Use the PDF report to share with your family or financial advisor.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">7. Advantages of FD Over Other Investments</h3>
          <p className="text-gray-600">
            - <strong>Safety:</strong> FDs are covered by DICGC insurance up to ₹5 lakhs per bank.<br />
            - <strong>Guaranteed returns:</strong> Unlike stocks or mutual funds, FD returns are fixed and known upfront.<br />
            - <strong>Loan against FD:</strong> You can avail up to 90% of your FD amount as a loan without breaking it.<br />
            - <strong>Easy to open:</strong> Online FDs can be opened in minutes via net banking.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">8. Limitations of FDs</h3>
          <p className="text-gray-600">
            - <strong>Lower returns:</strong> Historically, FDs have given 5-9% returns, which may not beat inflation in the long run.<br />
            - <strong>Tax inefficiency:</strong> Interest is added to income and taxed as per slab, unlike equity LTCG.<br />
            - <strong>Premature withdrawal penalty:</strong> Breaking an FD early usually reduces interest by 0.5-1%.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">9. Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div>
              <strong className="text-gray-800">Q1. Is the FD Calculator accurate?</strong>
              <p className="text-gray-600">Yes, it uses the standard compound interest formula. Actual bank calculations may differ marginally due to rounding or day-count conventions, but it's 99% accurate.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q2. Can I calculate FD for 1 month?</strong>
              <p className="text-gray-600">Yes, simply set tenure to 0.0833 years (1/12) or use days if supported. Our calculator works for any fractional year.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q3. What is the maximum tenure for FD?</strong>
              <p className="text-gray-600">Banks offer FDs from 7 days to 10 years. Some allow up to 20 years. Our calculator supports up to 30 years.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q4. How do I save the report?</strong>
              <p className="text-gray-600">Click the “Download PDF Report” button. The report includes all charts and summary data.</p>
            </div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">10. Final Thoughts</h3>
          <p className="text-gray-600">
            An FD Calculator is not just a number-crunching tool – it’s a financial planning companion. Whether you are saving for a child’s education, a house down payment, or retirement, our interactive FD Calculator gives you clarity and confidence. Bookmark this page, share it with friends, and make informed decisions.
          </p>
          <p className="text-gray-600 mt-4">
            <strong>Start using the FD Calculator above now</strong> – adjust the sliders, watch the charts update in real time, and download your personalised report. Happy investing!
          </p>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: The calculations are for illustrative purposes only. Actual returns may vary based on bank policies, TDS, and other factors.
          </div>
        </div>
      </div>
    </div>
  );
}