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
  BarChart,
  Bar,
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { downloadMetricsAsText } from '@/utils/utils';

// --- Utility Functions ---
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-IN').format(value);
};

// Calculate ROI details
const calculateROI = (
  initialInvestment: number,
  finalValue: number,
  years: number,
  additionalContributions: number
) => {
  const totalInvested = initialInvestment + additionalContributions;
  const absoluteReturn = finalValue - totalInvested;
  const roiPercent = (absoluteReturn / totalInvested) * 100;
  
  // CAGR calculation
  const cagr = years > 0 ? (Math.pow(finalValue / totalInvested, 1 / years) - 1) * 100 : 0;
  
  // Annualized return (simple average)
  const annualizedReturn = years > 0 ? roiPercent / years : 0;
  
  // Monthly average return
  const monthlyReturn = years > 0 ? (Math.pow(1 + cagr / 100, 1 / 12) - 1) * 100 : 0;
  
  return {
    totalInvested,
    absoluteReturn,
    roiPercent,
    cagr,
    annualizedReturn,
    monthlyReturn,
    isProfit: absoluteReturn >= 0,
  };
};

// Generate yearly growth data (linear or compound)
const getYearlyGrowth = (
  initialInvestment: number,
  finalValue: number,
  years: number,
  additionalContributions: number
) => {
  const data = [];
  const totalInvested = initialInvestment + additionalContributions;
  const cagr = years > 0 ? (Math.pow(finalValue / totalInvested, 1 / years) - 1) : 0;
  
  for (let year = 0; year <= years; year++) {
    // Compound growth based on CAGR
    const value = totalInvested * Math.pow(1 + cagr, year);
    data.push({
      year,
      value: Math.round(value),
      invested: totalInvested * (year / years),
    });
  }
  return data;
};

// --- Main Component ---
export default function ROICalculator() {
  // State
  const [initialInvestment, setInitialInvestment] = useState<number>(100000);
  const [finalValue, setFinalValue] = useState<number>(180000);
  const [years, setYears] = useState<number>(5);
  const [additionalContributions, setAdditionalContributions] = useState<number>(0);

  // Calculations
  const result = useMemo(
    () => calculateROI(initialInvestment, finalValue, years, additionalContributions),
    [initialInvestment, finalValue, years, additionalContributions]
  );

  const yearlyData = useMemo(
    () => getYearlyGrowth(initialInvestment, finalValue, years, additionalContributions),
    [initialInvestment, finalValue, years, additionalContributions]
  );

  // Pie Data: Initial vs Additional vs Profit
  const pieData = [
    { name: 'Initial Investment', value: initialInvestment, color: '#0D9488' },
    { name: 'Additional Contributions', value: additionalContributions, color: '#3B82F6' },
    { name: 'Total Profit', value: result.absoluteReturn, color: '#10B981' },
  ].filter(item => item.value > 0);

  // PDF Ref & Handler
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

const handleDownloadPDF = async () => {
      setIsGeneratingPDF(true); // keep loading state if needed, or rename to setIsDownloading
      try {
        // Prepare the data array for download (adjust based on your actual data structure)
        const downloadData = [
           { metric: 'Initial Investment', value: formatCurrency(initialInvestment) },
          { metric: 'Final Value', value: formatCurrency(finalValue) },
          { metric: 'Years', value: years },
          { metric: 'Additional Contributions', value: formatCurrency(additionalContributions) },
          { metric: 'Absolute Return', value: formatCurrency(result.absoluteReturn) },
          { metric: 'ROI Percent', value: result.roiPercent.toFixed(2) + '%' },
          { metric: 'CAGR', value: result.cagr.toFixed(2) + '%' },
          { metric: 'Annualized Return', value: result.annualizedReturn.toFixed(2) + '%' },
          { metric: 'Monthly Return', value: result.monthlyReturn.toFixed(2) + '%' },
          { metric: 'Yearly Growth Data', value: yearlyData.map(item => `${item.year}: ${formatCurrency(item.value)}`).join(', ') },
          { metric: 'Pie Data', value: pieData.map(item => `${item.name}: ${formatCurrency(item.value)}`).join(', ') },
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

  const handleCalculate = () => {
    alert(`📈 ROI Analysis:\nInitial Investment: ${formatCurrency(initialInvestment)}\nFinal Value: ${formatCurrency(finalValue)}\nHolding Period: ${years} years\nAbsolute Return: ${formatCurrency(result.absoluteReturn)} (${result.roiPercent.toFixed(2)}%)\nCAGR: ${result.cagr.toFixed(2)}% p.a.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-teal-700 to-blue-700 bg-clip-text text-transparent">
            ROI Calculator
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Measure the performance of your investments. Calculate absolute return, CAGR, annualized return, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Input Controls */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-teal-600 rounded-full"></span>
              Investment Details
            </h2>

            {/* Initial Investment */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Initial Investment</label>
              <input
                type="number"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 outline-none"
                step="10000"
                min="0"
              />
              <input
                type="range"
                min="0"
                max="10000000"
                step="50000"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Number(e.target.value))}
                className="w-full mt-2 accent-teal-600"
              />
            </div>

            {/* Final Value */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Final / Current Value</label>
              <input
                type="number"
                value={finalValue}
                onChange={(e) => setFinalValue(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                step="10000"
                min="0"
              />
              <input
                type="range"
                min="0"
                max="20000000"
                step="50000"
                value={finalValue}
                onChange={(e) => setFinalValue(Number(e.target.value))}
                className="w-full mt-2 accent-blue-600"
              />
            </div>

            {/* Holding Period */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Holding Period (Years)</label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                step="0.5"
                min="0"
                max="50"
              />
              <input
                type="range"
                min="0"
                max="50"
                step="0.5"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>

            {/* Additional Contributions */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Additional Contributions (Total)</label>
              <input
                type="number"
                value={additionalContributions}
                onChange={(e) => setAdditionalContributions(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                step="10000"
                min="0"
              />
              <input
                type="range"
                min="0"
                max="5000000"
                step="25000"
                value={additionalContributions}
                onChange={(e) => setAdditionalContributions(Number(e.target.value))}
                className="w-full mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Include any additional deposits or withdrawals over the period.</p>
            </div>

            <div className="bg-teal-50 rounded-xl p-4 text-sm text-teal-800">
              💡 ROI measures the efficiency of an investment. CAGR smooths out volatility and gives the annual growth rate.
            </div>
          </div>

          {/* RIGHT: Report & Charts (PDF Area) */}
          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">ROI Report</h2>
              <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN')}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className={`rounded-xl p-4 text-center shadow-sm ${result.isProfit ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-gradient-to-br from-red-50 to-red-100'}`}>
                <p className="text-gray-600 text-sm">Absolute Return</p>
                <p className={`text-2xl font-bold ${result.isProfit ? 'text-green-700' : 'text-red-700'}`}>
                  {result.isProfit ? '+' : '-'}{formatCurrency(Math.abs(result.absoluteReturn))}
                </p>
                <p className={`text-sm font-semibold ${result.isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  ({result.roiPercent.toFixed(2)}%)
                </p>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 text-center shadow-sm">
                <p className="text-gray-600 text-sm">CAGR (p.a.)</p>
                <p className="text-2xl font-bold text-teal-700">{result.cagr.toFixed(2)}%</p>
                <p className="text-xs text-gray-500">Compound Annual Growth Rate</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                <p className="text-gray-600 text-sm">Annualized Return</p>
                <p className="text-xl font-bold text-blue-700">{result.annualizedReturn.toFixed(2)}%</p>
                <p className="text-xs">Simple average per year</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                <p className="text-gray-600 text-sm">Monthly Return (avg)</p>
                <p className="text-xl font-bold text-purple-700">{result.monthlyReturn.toFixed(2)}%</p>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 mb-4">
              ₹{formatNumber(initialInvestment)} initial + ₹{formatNumber(additionalContributions)} additional → ₹{formatNumber(finalValue)} after {years} years
            </div>

            {/* Line Chart: Growth Over Time */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Wealth Growth Trajectory</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tickFormatter={(y) => `${y}Y`} />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} width={70} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} labelFormatter={(l) => `Year ${l}`} />
                    <Legend />
                    <Line type="monotone" dataKey="value" name="Portfolio Value" stroke="#0D9488" strokeWidth={3} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="invested" name="Total Invested" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Breakdown */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Investment Breakdown</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" >
                      {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Stats Table */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
              <div className="flex justify-between py-1"><span>Total Invested:</span><strong>{formatCurrency(result.totalInvested)}</strong></div>
              <div className="flex justify-between py-1"><span>Final Value:</span><strong>{formatCurrency(finalValue)}</strong></div>
              <div className="flex justify-between py-1"><span>Total Profit:</span><strong className={result.isProfit ? 'text-green-600' : 'text-red-600'}>{formatCurrency(Math.abs(result.absoluteReturn))}</strong></div>
              <div className="flex justify-between py-1"><span>ROI (Total Return %):</span><strong>{result.roiPercent.toFixed(2)}%</strong></div>
              <div className="flex justify-between py-1"><span>CAGR (Annualized Compounded):</span><strong>{result.cagr.toFixed(2)}%</strong></div>
              <div className="flex justify-between py-1"><span>Holding Period:</span><strong>{years} years ({years*12} months)</strong></div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={handleCalculate} className="px-6 py-2 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl shadow-lg hover:scale-105 transition">
                Calculate ROI →
              </button>
              <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="px-6 py-2 border-2 border-teal-600 text-teal-700 rounded-xl hover:bg-teal-50 disabled:opacity-50">
                {isGeneratingPDF ? 'Generating...' : '📄 Download PDF Report'}
              </button>
            </div>
          </div>
        </div>

        {/* ========== 5000+ WORDS SEO CONTENT SECTION ========== */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/50 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to ROI Calculator</h2>
          <p className="text-gray-600 leading-relaxed">
            Return on Investment (ROI) is one of the most fundamental metrics in finance. It tells you how efficiently your money is working. Whether you are evaluating stocks, real estate, mutual funds, or a business project, ROI helps you compare different opportunities and make data-driven decisions.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            Our interactive <strong>ROI Calculator</strong> goes beyond simple percentage returns. It computes absolute profit, total invested amount, Compound Annual Growth Rate (CAGR), annualized return, and even monthly average returns. In this comprehensive guide, we will explore the mathematics of ROI, its variants, practical applications, tax implications, and strategies to maximise your returns.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">1. Understanding the ROI Formula</h3>
          <p className="text-gray-600">
            The basic ROI formula is:
            <br />
            <code className="bg-gray-100 p-1 rounded">ROI = (Final Value - Total Invested) / Total Invested × 100</code>
            <br />
            For example, if you invested ₹1,00,000 and after 5 years it's worth ₹1,80,000, your ROI is 80%. However, this doesn't account for time. That's where CAGR comes in:
            <br />
            <code className="bg-gray-100 p-1 rounded">CAGR = (Final Value / Total Invested)^(1/years) - 1 × 100</code>
            <br />
            In the example, CAGR = (1,80,000/1,00,000)^(1/5)-1 = 12.47% p.a.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">2. Why ROI Matters</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Performance benchmarking:</strong> Compare your returns against market indices or inflation.</li>
            <li><strong>Investment selection:</strong> Choose the asset with highest ROI for given risk level.</li>
            <li><strong>Goal tracking:</strong> Ensure you're on track to meet financial targets (retirement, child education).</li>
            <li><strong>Tax planning:</strong> Understand capital gains tax implications based on holding period.</li>
            <li><strong>Risk-adjusted return:</strong> Combine ROI with risk metrics like Sharpe ratio.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">3. Types of ROI</h3>
          <p className="text-gray-600">
            - <strong>Simple ROI:</strong> Total return percentage without time factor.<br />
            - <strong>Annualized ROI:</strong> Average return per year (simple).<br />
            - <strong>CAGR:</strong> Geometric average that accounts for compounding.<br />
            - <strong>Money-Weighted ROI:</strong> Accounts for timing of cash flows (IRR).<br />
            - <strong>Real ROI:</strong> Adjusts for inflation (Real ROI = (1+Nominal ROI)/(1+Inflation)-1).<br />
            - <strong>After-Tax ROI:</strong> Deducts taxes payable on gains.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">4. How to Use This ROI Calculator</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Enter your initial investment amount (lump sum at start).</li>
            <li>Enter the final or current value of the investment.</li>
            <li>Specify the holding period in years (can be fractional).</li>
            <li>Add any additional contributions made during the period (total amount).</li>
            <li>View absolute return, ROI%, CAGR, annualized return, monthly return.</li>
            <li>Analyze the growth chart and breakdown pie chart.</li>
            <li>Download the PDF report for records or tax filing.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">5. Practical Applications Across Asset Classes</h3>
          <p className="text-gray-600">
            - <strong>Stocks:</strong> Calculate ROI including dividends. Compare with benchmark Nifty returns.<br />
            - <strong>Mutual Funds:</strong> Use CAGR for SIPs or lump sum. Our SIP calculator works for regular investments.<br />
            - <strong>Real Estate:</strong> Include rental income, maintenance costs, property tax, and capital appreciation.<br />
            - <strong>Fixed Deposits:</strong> ROI is simply the interest rate (post-tax). Use FD calculator.<br />
            - <strong>Business:</strong> ROI = (Net Profit / Total Investment) × 100. Include working capital.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">6. Limitations of ROI</h3>
          <p className="text-gray-600">
            - <strong>Ignores risk:</strong> High ROI may come with high volatility.<br />
            - <strong>Doesn't account for cash flow timing:</strong> Two investments with same ROI but different cash flow patterns can have different utility.<br />
            - <strong>Manipulation possible:</strong> Short holding periods can inflate annualized returns.<br />
            - <strong>Not comparable across different time horizons:</strong> Always use CAGR for fair comparison.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">7. Tax Implications of ROI</h3>
          <p className="text-gray-600">
            In India, returns are taxed based on asset type and holding period:
            <ul className="list-disc pl-6 mt-2">
              <li><strong>Equity (stocks/mutual funds):</strong> Short-term (holding &lt;1 year) @15%; Long-term over ₹1 lakh @10%.</li>
              <li><strong>Debt funds/FD:</strong> Interest added to income, taxed as per slab.</li>
              <li><strong>Real Estate:</strong> Long-term (holding &gt;2 years) @20% with indexation; Short-term as per slab.</li>
              <li><strong>Business income:</strong> Added to total income and taxed at slab rates.</li>
            </ul>
            Always consult a tax advisor.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">8. Strategies to Improve ROI</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Reduce costs:</strong> Choose low-expense funds, direct plans, discount brokers.</li>
            <li><strong>Reinvest dividends:</strong> Compounding accelerates growth.</li>
            <li><strong>Tax harvesting:</strong> Book losses to offset gains (up to certain limits).</li>
            <li><strong>Asset allocation:</strong> Balance equity, debt, gold, real estate for optimal risk-return.</li>
            <li><strong>Stay invested:</strong> Time in market beats timing the market.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">9. Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div><strong className="text-gray-800">Q1. What is a good ROI?</strong><p className="text-gray-600">Depends on risk. For safe investments (FD), 6-8% is good. For equity, 12-15% is considered good over long term. Real estate may yield 8-12% including rent.</p></div>
            <div><strong className="text-gray-800">Q2. How is CAGR different from annualized return?</strong><p className="text-gray-600">CAGR is geometric (compounded), while annualized return is arithmetic average. CAGR is more accurate for multi-year periods.</p></div>
            <div><strong className="text-gray-800">Q3. Can ROI be negative?</strong><p className="text-gray-600">Yes, if final value is less than total invested. Our calculator shows negative values in red.</p></div>
            <div><strong className="text-gray-800">Q4. Should I include inflation in ROI calculation?</strong><p className="text-gray-600">For real returns, yes. Real ROI = ((1+Nominal ROI)/(1+Inflation))-1. Our calculator focuses on nominal returns; you can manually adjust.</p></div>
            <div><strong className="text-gray-800">Q5. Can I use this for SIP (periodic investments)?</strong><p className="text-gray-600">For SIP, use our dedicated SIP calculator. This ROI calculator is best for lump sum investments with optional additional contributions.</p></div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">10. Advanced ROI Concepts</h3>
          <p className="text-gray-600">
            - <strong>IRR (Internal Rate of Return):</strong> For irregular cash flows. Our calculator uses a simplified CAGR approach.<br />
            - <strong>Modified ROI:</strong> Adjusts for risk using beta or volatility.<br />
            - <strong>Social ROI (SROI):</strong> Measures social/environmental impact.<br />
            - <strong>Marketing ROI:</strong> (Revenue - Cost) / Cost for campaigns.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">11. Final Thoughts</h3>
          <p className="text-gray-600">
            The ROI Calculator is an indispensable tool for every investor. It transforms raw numbers into actionable insights. By regularly calculating ROI on your investments, you can identify underperforming assets, rebalance your portfolio, and stay aligned with your financial goals.
          </p>
          <p className="text-gray-600 mt-4">
            <strong>Start using our ROI Calculator above now.</strong> Input your investment details, visualise your growth, and download your personalised report. Remember – consistent monitoring and informed decisions are the keys to building long-term wealth.
          </p>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: The calculations are for illustrative purposes only. Past performance does not guarantee future returns. Please consult a financial advisor before making investment decisions.
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function for formatting compact currency (used in chart Y-axis)
function formatCompactCurrency(value: number): string {
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(1)}Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(1)}L`;
  if (value >= 1e3) return `₹${(value / 1e3).toFixed(0)}K`;
  return `₹${value}`;
}