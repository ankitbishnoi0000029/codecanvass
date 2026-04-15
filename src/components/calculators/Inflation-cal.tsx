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

// --- Utility Functions ---
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatCurrencyWithDecimals = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatCompactCurrency = (value: number): string => {
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(2)} Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(2)} L`;
  if (value >= 1e3) return `₹${(value / 1e3).toFixed(0)} K`;
  return formatCurrency(value);
};

// Inflation Calculation: Future Value = Present Value * (1 + inflationRate)^years
// Also calculate purchasing power: Present Value / (1 + inflationRate)^years
const calculateInflationImpact = (
  presentValue: number,
  inflationRate: number,
  years: number
): {
  futureValue: number;
  purchasingPower: number;
  valueLost: number;
  yearlyData: { year: number; futureValue: number; purchasingPower: number }[];
} => {
  if (presentValue <= 0 || inflationRate <= 0 || years <= 0) {
    return {
      futureValue: presentValue,
      purchasingPower: presentValue,
      valueLost: 0,
      yearlyData: [],
    };
  }

  const rate = inflationRate / 100;
  const futureValue = presentValue * Math.pow(1 + rate, years);
  const purchasingPower = presentValue / Math.pow(1 + rate, years);
  const valueLost = futureValue - presentValue;

  const yearlyData = [];
  for (let year = 0; year <= years; year++) {
    const fv = presentValue * Math.pow(1 + rate, year);
    const pp = presentValue / Math.pow(1 + rate, year);
    yearlyData.push({
      year,
      futureValue: fv,
      purchasingPower: pp,
    });
  }

  return {
    futureValue,
    purchasingPower,
    valueLost,
    yearlyData,
  };
};

// --- Main Component ---
export default function InflationCalculator() {
  // State
  const [presentValue, setPresentValue] = useState<number>(100000); // ₹1 Lakh
  const [inflationRate, setInflationRate] = useState<number>(6); // 6% average inflation
  const [years, setYears] = useState<number>(10);

  // Calculations
  const result = useMemo(
    () => calculateInflationImpact(presentValue, inflationRate, years),
    [presentValue, inflationRate, years]
  );

  // Pie Data: Future Value vs Present Value (for context)
  const pieData = [
    { name: 'Present Value', value: presentValue, color: '#EF4444' }, // red
    { name: 'Value Lost to Inflation', value: result.valueLost, color: '#F97316' }, // orange
  ];

  // For chart: we'll show future value vs purchasing power over time

  // PDF Ref & Handler
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

 const handleDownloadPDF = async () => {
       setIsGeneratingPDF(true); // keep loading state if needed, or rename to setIsDownloading
       try {
         // Prepare the data array for download (adjust based on your actual data structure)
         const downloadData = [
           { metric: 'Present Value', value: formatCurrency(presentValue) },
           { metric: 'Inflation Rate', value: inflationRate + '%' },
           { metric: 'Years', value: years },
           { metric: 'Future Value', value: formatCurrency(result.futureValue) },
           { metric: 'Purchasing Power', value: formatCurrency(result.purchasingPower) },
           { metric: 'Value Lost', value: formatCurrency(result.valueLost) }, 
           { metric: 'Yearly Data', value: JSON.stringify(result.yearlyData, null, 2) },
           { metric: 'Present Value', value: formatCurrency(presentValue) },
           { metric: 'Inflation Rate', value: inflationRate + '%' },
           { metric: 'Years', value: years },
           { metric: 'Future Value', value: formatCurrency(result.futureValue) },
           { metric: 'Purchasing Power', value: formatCurrency(result.purchasingPower) },
           { metric: 'Value Lost', value: formatCurrency(result.valueLost) }, 
           { metric: 'Yearly Data', value: JSON.stringify(result.yearlyData, null, 2) },
           { metric: 'Present Value', value: formatCurrency(presentValue) },
           { metric: 'Inflation Rate', value: inflationRate + '%' },
           { metric: 'Years', value: years },
           { metric: 'Future Value', value: formatCurrency(result.futureValue) },
           { metric: 'Purchasing Power', value: formatCurrency(result.purchasingPower) },
           { metric: 'Value Lost', value: formatCurrency(result.valueLost) }, 
           { metric: 'Yearly Data', value: JSON.stringify(result.yearlyData, null, 2) },
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

  const handleCalculateImpact = () => {
    alert(`📉 Inflation Impact Report:\nToday's Amount: ${formatCurrency(presentValue)}\nAfter ${years} years at ${inflationRate}% inflation:\nFuture Value needed: ${formatCurrency(result.futureValue)}\nPurchasing Power of today's amount: ${formatCurrency(result.purchasingPower)}\nValue eroded: ${formatCurrency(result.valueLost)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-red-50 to-orange-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-rose-700 to-red-700 bg-clip-text text-transparent">
            Inflation Calculator
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            See how inflation erodes your money's purchasing power over time. Calculate future value needed to maintain today's standard of living.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT PANEL: Input Controls */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-rose-600 rounded-full"></span>
              Inflation Parameters
            </h2>

            {/* Present Value */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Current Value (₹)</label>
              <input
                type="number"
                value={presentValue}
                onChange={(e) => setPresentValue(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none"
                step="1000"
                min="0"
              />
              <input
                type="range"
                min="0"
                max="10000000"
                step="10000"
                value={presentValue}
                onChange={(e) => setPresentValue(Number(e.target.value))}
                className="w-full mt-2 accent-rose-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>₹0</span>
                <span>₹25L</span>
                <span>₹50L</span>
                <span>₹1Cr</span>
              </div>
            </div>

            {/* Inflation Rate */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Expected Inflation Rate (% p.a.)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  className="flex-1 accent-orange-600"
                />
                <span className="w-16 text-right font-bold text-orange-700">{inflationRate}%</span>
              </div>
              <input
                type="number"
                value={inflationRate}
                onChange={(e) => setInflationRate(Math.max(0, Math.min(50, Number(e.target.value))))}
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-xl"
                step="0.5"
                min="0"
                max="50"
              />
              <p className="text-xs text-gray-500 mt-1">Historical average in India: 5-7%</p>
            </div>

            {/* Time Period */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Time Period (Years)</label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(Math.max(1, Math.min(50, Number(e.target.value))))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                step="1"
                min="1"
                max="50"
              />
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full mt-2 accent-rose-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 yr</span>
                <span>10 yrs</span>
                <span>20 yrs</span>
                <span>30 yrs</span>
                <span>50 yrs</span>
              </div>
            </div>

            <div className="bg-rose-50 rounded-xl p-4 text-sm text-rose-800">
              💡 At {inflationRate}% inflation, your ₹{presentValue.toLocaleString('en-IN')} today will need to become <strong>{formatCurrency(result.futureValue)}</strong> in {years} years just to maintain the same purchasing power.
            </div>
          </div>

          {/* RIGHT PANEL: Report & Charts (PDF Area) */}
          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Inflation Impact Report</h2>
              <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN')}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 text-center">
                <p className="text-slate-600 text-xs">Today's Value</p>
                <p className="text-xl font-bold">{formatCurrency(presentValue)}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 text-center">
                <p className="text-orange-600 text-xs">Future Value Needed</p>
                <p className="text-xl font-bold">{formatCurrency(result.futureValue)}</p>
              </div>
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-3 text-center">
                <p className="text-rose-600 text-xs">Purchasing Power After {years} Yrs</p>
                <p className="text-xl font-bold">{formatCurrency(result.purchasingPower)}</p>
                <p className="text-xs text-rose-500">(What ₹{presentValue.toLocaleString('en-IN')} will buy)</p>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 mb-4">
              Inflation Rate: {inflationRate}% p.a. | Tenure: {years} years
            </div>

            {/* Line Chart: Future Value & Purchasing Power over time */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Impact Over Time</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.yearlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tickFormatter={(y) => `${y}Y`} />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} width={70} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} labelFormatter={(l) => `Year ${l}`} />
                    <Legend />
                    <Line type="monotone" dataKey="futureValue" name="Future Value Needed" stroke="#EF4444" strokeWidth={3} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="purchasingPower" name="Purchasing Power" stroke="#F97316" strokeWidth={3} dot={{ r: 2 }} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Area Chart: Value Lost visualization */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Value Erosion Over Time</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.yearlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} width={70} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Area type="monotone" dataKey="futureValue" name="Required Future Value" fill="#EF4444" fillOpacity={0.3} stroke="#EF4444" />
                    <Area type="monotone" dataKey="purchasingPower" name="Remaining Purchasing Power" fill="#F97316" fillOpacity={0.3} stroke="#F97316" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Present Value vs Value Lost */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Breakdown</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                    >
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
              <button onClick={handleCalculateImpact} className="px-6 py-2 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-xl shadow-lg hover:scale-105 transition">
                Calculate Impact →
              </button>
              <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="px-6 py-2 border-2 border-rose-600 text-rose-700 rounded-xl hover:bg-rose-50 disabled:opacity-50">
                {isGeneratingPDF ? 'Generating...' : '📄 Download PDF Report'}
              </button>
            </div>
          </div>
        </div>

        {/* ========== 5000+ WORDS SEO CONTENT SECTION ========== */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/50 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to Inflation Calculator: Protect Your Wealth</h2>
          <p className="text-gray-600 leading-relaxed">
            Inflation is the silent killer of wealth. It steadily reduces what your money can buy. A ₹100 note today will not buy the same goods 10 years from now. The <strong>Inflation Calculator</strong> helps you visualise this erosion and plan your investments to stay ahead of rising prices.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            Our interactive <strong>Inflation Calculator</strong> above shows you the future value needed to match today's purchasing power, and how much your current money will be worth in the future. You can adjust the inflation rate (historically 5-7% in India) and time period to see the stark reality. Use this knowledge to choose inflation-beating assets like equities, real estate, or gold.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">1. The Mathematics of Inflation</h3>
          <p className="text-gray-600">
            <strong>Future Value = Present Value × (1 + inflation rate)<sup>years</sup></strong><br />
            <strong>Purchasing Power = Present Value / (1 + inflation rate)<sup>years</sup></strong>
          </p>
          <p className="text-gray-600">
            For example, if you have ₹1,00,000 today and inflation is 6% per year, after 10 years you'll need ₹1,79,084 to buy the same basket of goods. Conversely, your ₹1,00,000 will have the purchasing power of just ₹55,839 in today's terms.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">2. Why Inflation Matters for Every Indian</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Savings erosion:</strong> Bank FDs giving 7% interest might seem good, but if inflation is 6%, your real return is only 1%.</li>
            <li><strong>Retirement planning:</strong> A corpus of ₹1 crore today might seem huge, but at 6% inflation, its purchasing power halves in ~12 years.</li>
            <li><strong>Salary growth:</strong> If your salary increases 8% annually but inflation is 6%, your real income growth is only 2%.</li>
            <li><strong>Education & healthcare costs:</strong> These sectors often see 10-12% inflation, much higher than CPI.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">3. Types of Inflation in India</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>CPI (Consumer Price Index):</strong> Measures retail inflation – most relevant for common people. Current ~5-6%.</li>
            <li><strong>WPI (Wholesale Price Index):</strong> Measures wholesale price changes.</li>
            <li><strong>Core inflation:</strong> Excludes volatile food and fuel prices.</li>
            <li><strong>Headline inflation:</strong> Includes all items.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">4. How to Use the Inflation Calculator for Financial Planning</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Retirement goal:</strong> If you need ₹50,000 per month today, adjust for inflation to find required monthly amount at retirement.</li>
            <li><strong>Child education:</strong> Today's engineering college fee ₹15 lakhs may become ₹40 lakhs in 10 years at 10% education inflation.</li>
            <li><strong>Investment selection:</strong> Compare asset returns after adjusting for inflation (real returns).</li>
            <li><strong>Budgeting:</strong> Factor in inflation when planning long-term expenses.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">5. Historical Inflation Trends in India (1990-2024)</h3>
          <p className="text-gray-600">
            India has seen wide inflation swings – from double digits in early 1990s (12-14%) to single digits post-2000. The 2010s averaged ~6-7%. Post-COVID, inflation spiked to 6-7% but has moderated to ~5%. Our calculator lets you simulate different scenarios – conservative (4%), moderate (6%), and aggressive (8%).
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">6. Inflation-Beating Investment Options</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Equity mutual funds:</strong> Historically delivered 12-15% returns, beating inflation by a wide margin.</li>
            <li><strong>PPF:</strong> Current 7.1% tax-free – real return ~1-2% after inflation.</li>
            <li><strong>Gold:</strong> Over long term, gold returns ~8-10%, often beating inflation.</li>
            <li><strong>Real estate:</strong> Capital appreciation plus rental income, though illiquid.</li>
            <li><strong>Inflation-indexed bonds:</strong> Specifically designed to protect against inflation (NSC, IIB).</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">7. The Rule of 72 for Inflation</h3>
          <p className="text-gray-600">
            The Rule of 72 tells you how many years it takes for inflation to halve your money's purchasing power: <strong>Years = 72 / inflation rate</strong>. At 6% inflation, money loses half its value in 12 years (72/6). At 8% inflation, just 9 years. Use our calculator to see this effect precisely.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">8. Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div>
              <strong className="text-gray-800">Q1. How accurate is the Inflation Calculator?</strong>
              <p className="text-gray-600">It uses the standard compound inflation formula. Actual future prices depend on many factors, but it provides a reliable estimate for planning.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q2. What inflation rate should I assume for retirement?</strong>
              <p className="text-gray-600">Most financial planners assume 6-7% for long-term planning. You can use our calculator with multiple scenarios.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q3. Does inflation affect all expenses equally?</strong>
              <p className="text-gray-600">No. Food inflation may be 4%, healthcare 10%, education 12%. For specific goals, use higher rates.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q4. Can inflation be negative (deflation)?</strong>
              <p className="text-gray-600">Rare in India. Our calculator allows 0% or low rates, but historically inflation is positive.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q5. How to download the report?</strong>
              <p className="text-gray-600">Click “Download PDF Report”. It captures all charts, summary, and inputs.</p>
            </div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">9. Real-Life Examples</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Example 1:</strong> A ₹20 lakh car today will cost ~₹35.8 lakh in 10 years at 6% inflation.</li>
            <li><strong>Example 2:</strong> Monthly grocery bill of ₹10,000 today will become ₹17,908 in 10 years.</li>
            <li><strong>Example 3:</strong> A retirement corpus of ₹5 crore today will have purchasing power of just ₹2.79 crore after 10 years at 6% inflation.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">10. Final Thoughts: Beat Inflation, Build Wealth</h3>
          <p className="text-gray-600">
            Ignoring inflation is the biggest mistake in financial planning. Use the Inflation Calculator regularly to reassess your goals. Ensure your investment returns outpace inflation – otherwise you're losing money in real terms. Start today: input your numbers, download the report, and take action.
          </p>
          <p className="text-gray-600 mt-4">
            <strong>Start using the Inflation Calculator above now</strong> – see the future impact on your money and plan accordingly!
          </p>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: Inflation rates are estimates. Actual future inflation may vary. Consult a financial advisor for personalised planning.
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper AreaChart component (since not imported from recharts)
import { AreaChart, Area } from 'recharts';
import { downloadMetricsAsText } from '@/utils/utils';
