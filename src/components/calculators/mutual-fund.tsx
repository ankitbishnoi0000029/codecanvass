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
  AreaChart,
  Area,
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
  return new Intl.NumberFormat('en-IN').format(Math.round(value));
};

const formatCompactCurrency = (value: number): string => {
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(2)} Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(2)} L`;
  if (value >= 1e3) return `₹${(value / 1e3).toFixed(0)} K`;
  return `₹${value}`;
};

// Lump Sum Future Value
const calculateLumpsum = (principal: number, annualReturn: number, years: number): number => {
  if (principal <= 0 || annualReturn <= 0 || years <= 0) return principal;
  const rate = annualReturn / 100;
  return principal * Math.pow(1 + rate, years);
};

// SIP Future Value
const calculateSIP = (monthlyInvestment: number, annualReturn: number, years: number): number => {
  if (monthlyInvestment <= 0 || annualReturn <= 0 || years <= 0) return 0;
  const monthlyRate = annualReturn / 100 / 12;
  const months = years * 12;
  const futureValue = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  return Math.round(futureValue);
};

// Yearly growth data for Lump Sum
const getLumpsumGrowth = (principal: number, annualReturn: number, years: number) => {
  const data: { year: number; value: number }[] = [];
  for (let year = 0; year <= years; year++) {
    const value = calculateLumpsum(principal, annualReturn, year);
    data.push({ year, value });
  }
  return data;
};

// Yearly growth data for SIP
const getSIPGrowth = (monthlyInvestment: number, annualReturn: number, years: number) => {
  const data: { year: number; value: number; invested: number; returns: number }[] = [];
  for (let year = 0; year <= years; year++) {
    const value = calculateSIP(monthlyInvestment, annualReturn, year);
    const invested = monthlyInvestment * year * 12;
    data.push({ year, value, invested, returns: value - invested });
  }
  return data;
};

// Impact of expense ratio
const calculateExpenseImpact = (
  mode: 'lumpsum' | 'sip',
  amount: number,
  annualReturn: number,
  years: number,
  expenseRatio: number
) => {
  const reducedReturn = Math.max(0, annualReturn - expenseRatio);
  if (mode === 'lumpsum') {
    const withoutExpense = calculateLumpsum(amount, annualReturn, years);
    const withExpense = calculateLumpsum(amount, reducedReturn, years);
    const loss = withoutExpense - withExpense;
    return { withoutExpense, withExpense, loss, reducedReturn };
  } else {
    const withoutExpense = calculateSIP(amount, annualReturn, years);
    const withExpense = calculateSIP(amount, reducedReturn, years);
    const loss = withoutExpense - withExpense;
    return { withoutExpense, withExpense, loss, reducedReturn };
  }
};

// --- Main Component ---
export default function MutualFundCalculator() {
  const [mode, setMode] = useState<'lumpsum' | 'sip'>('lumpsum');
  const [investmentAmount, setInvestmentAmount] = useState<number>(100000);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [years, setYears] = useState<number>(10);
  const [expenseRatio, setExpenseRatio] = useState<number>(1.0);
  const [monthlySIP, setMonthlySIP] = useState<number>(5000);

  const lumpsumMaturity = useMemo(
    () => calculateLumpsum(investmentAmount, expectedReturn, years),
    [investmentAmount, expectedReturn, years]
  );

  const sipMaturity = useMemo(
    () => calculateSIP(monthlySIP, expectedReturn, years),
    [monthlySIP, expectedReturn, years]
  );

  const currentMaturity = mode === 'lumpsum' ? lumpsumMaturity : sipMaturity;
  const totalInvested = mode === 'lumpsum' ? investmentAmount : monthlySIP * years * 12;
  const totalReturns = currentMaturity - totalInvested;

  const expenseImpact = useMemo(
    () => calculateExpenseImpact(mode, mode === 'lumpsum' ? investmentAmount : monthlySIP, expectedReturn, years, expenseRatio),
    [mode, investmentAmount, monthlySIP, expectedReturn, years, expenseRatio]
  );

  const lumpsumChartData = useMemo(
    () => getLumpsumGrowth(investmentAmount, expectedReturn, years),
    [investmentAmount, expectedReturn, years]
  );

  const sipChartData = useMemo(
    () => getSIPGrowth(monthlySIP, expectedReturn, years),
    [monthlySIP, expectedReturn, years]
  );

  const chartData = mode === 'lumpsum' ? lumpsumChartData : sipChartData;

  const pieData = [
    { name: 'Total Invested', value: totalInvested, color: '#3B82F6' },
    { name: 'Total Returns', value: totalReturns, color: '#10B981' },
  ];

  const expenseComparisonData = [
    { name: 'Without Expense', value: expenseImpact.withoutExpense, color: '#10B981' },
    { name: 'With Expense', value: expenseImpact.withExpense, color: '#EF4444' },
  ];

  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

 const handleDownloadPDF = async () => {
       setIsGeneratingPDF(true); // keep loading state if needed, or rename to setIsDownloading
       try {
         // Prepare the data array for download (adjust based on your actual data structure)
         const downloadData = [
           { metric: 'Mode', value: mode === 'lumpsum' ? 'Lump Sum' : 'SIP' },
           { metric: 'Investment Amount', value: formatCurrency(totalInvested) },
           { metric: 'Expected Return', value: expectedReturn + '%' },
           { metric: 'Tenure', value: years + ' years' },
           { metric: 'Maturity Value', value: formatCurrency(currentMaturity) },
           { metric: 'Total Returns', value: formatCurrency(totalReturns) },
           { metric: 'Expense Ratio Impact', value: formatCurrency(expenseImpact.loss) },
           { metric: 'Expense Ratio', value: expenseRatio + '%' }, 
           { metric: 'Monthly SIP', value: formatCurrency(monthlySIP) },
           { metric: 'Total Invested', value: formatCurrency(totalInvested) },
           { metric: 'Total Returns', value: formatCurrency(totalReturns) },
           { metric: 'Expense Ratio Impact', value: formatCurrency(expenseImpact.loss) },
           
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
    alert(`📈 Mutual Fund Projection (${mode === 'lumpsum' ? 'Lump Sum' : 'SIP'}):\nInvestment: ${formatCurrency(totalInvested)}\nExpected Returns: ${expectedReturn}% p.a.\nTenure: ${years} years\nMaturity Value: ${formatCurrency(currentMaturity)}\nTotal Returns: ${formatCurrency(totalReturns)}\nExpense Ratio Impact: ${formatCurrency(expenseImpact.loss)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
            Mutual Fund Calculator
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Plan your mutual fund investments – Lump Sum or SIP. Estimate future value, total returns, and the impact of expense ratios.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT PANEL - Inputs */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-purple-600 rounded-full"></span>
              Investment Details
            </h2>

            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => setMode('lumpsum')}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${mode === 'lumpsum' ? 'bg-white shadow text-purple-700' : 'text-gray-600'}`}
              >
                Lump Sum
              </button>
              <button
                onClick={() => setMode('sip')}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${mode === 'sip' ? 'bg-white shadow text-purple-700' : 'text-gray-600'}`}
              >
                SIP (Monthly)
              </button>
            </div>

            {mode === 'lumpsum' ? (
              <div className="mb-6">
                <label className="text-gray-700 font-semibold block mb-2">Lump Sum Amount (₹)</label>
                <input type="number" value={investmentAmount} onChange={(e) => setInvestmentAmount(Number(e.target.value))} className="w-full px-4 py-2 border rounded-xl" step="10000" min="0" />
                <input type="range" min="5000" max="10000000" step="50000" value={investmentAmount} onChange={(e) => setInvestmentAmount(Number(e.target.value))} className="w-full mt-2" />
              </div>
            ) : (
              <div className="mb-6">
                <label className="text-gray-700 font-semibold block mb-2">Monthly SIP Amount (₹)</label>
                <input type="number" value={monthlySIP} onChange={(e) => setMonthlySIP(Number(e.target.value))} className="w-full px-4 py-2 border rounded-xl" step="500" min="500" />
                <input type="range" min="500" max="100000" step="500" value={monthlySIP} onChange={(e) => setMonthlySIP(Number(e.target.value))} className="w-full mt-2" />
              </div>
            )}

            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Expected Annual Return (%)</label>
              <div className="flex items-center gap-2">
                <input type="range" min="4" max="20" step="0.5" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} className="flex-1" />
                <span className="w-16 text-right font-bold text-green-700">{expectedReturn}%</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Investment Tenure (Years)</label>
              <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full px-4 py-2 border rounded-xl" step="1" min="1" max="50" />
              <input type="range" min="1" max="50" step="1" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full mt-2" />
            </div>

            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Expense Ratio (%)</label>
              <div className="flex items-center gap-2">
                <input type="range" min="0" max="2.5" step="0.1" value={expenseRatio} onChange={(e) => setExpenseRatio(Number(e.target.value))} className="flex-1" />
                <span className="w-16 text-right font-bold text-orange-700">{expenseRatio}%</span>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 text-sm text-purple-800">
              💡 Even a 1% difference in expense ratio can reduce your final corpus by 20-30% over long periods. Always prefer Direct plans.
            </div>
          </div>

          {/* RIGHT PANEL - Report (PDF capture area) - Using SOLID colors to avoid lab() errors */}
          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Mutual Fund Report</h2>
              <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN')}</p>
            </div>

            {/* Summary Cards with SOLID colors (no gradients) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-100 rounded-xl p-3 text-center">
                <p className="text-blue-600 text-xs">Total Invested</p>
                <p className="text-xl font-bold">{formatCurrency(totalInvested)}</p>
              </div>
              <div className="bg-green-100 rounded-xl p-3 text-center">
                <p className="text-green-600 text-xs">Total Returns</p>
                <p className="text-xl font-bold">{formatCurrency(totalReturns)}</p>
              </div>
              <div className="bg-purple-100 rounded-xl p-3 text-center">
                <p className="text-purple-600 text-xs">Maturity Value</p>
                <p className="text-xl font-bold">{formatCurrency(currentMaturity)}</p>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 mb-4">
              {mode === 'lumpsum' ? `Lump Sum ₹${formatNumber(investmentAmount)}` : `SIP ₹${formatNumber(monthlySIP)}/month`} for {years} years @ {expectedReturn}% p.a.
            </div>

            {/* Growth Chart */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Wealth Growth Over Time</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tickFormatter={(y) => `${y}Y`} />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} width={80} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} labelFormatter={(l) => `Year ${l}`} />
                    <Legend />
                    <Area type="monotone" dataKey="value" name="Corpus Value" fill="#8B5CF6" stroke="#6D28D9" fillOpacity={0.2} />
                    {mode === 'sip' && <Line type="monotone" dataKey="invested" name="Total Invested" stroke="#94A3B8" strokeDasharray="5 5" />}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
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

            {/* Expense Impact Bar Chart */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Impact of Expense Ratio</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expenseComparisonData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="value" name="Maturity Value" fill="#8884d8">
                      {expenseComparisonData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-center mt-2 text-gray-600">You lose <strong className="text-red-600">{formatCurrency(expenseImpact.loss)}</strong> due to {expenseRatio}% expense ratio</p>
            </div>

            {/* Detailed Stats */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
              <div className="flex justify-between py-1"><span>Investment Mode:</span><strong>{mode === 'lumpsum' ? 'Lump Sum' : 'SIP'}</strong></div>
              <div className="flex justify-between py-1"><span>Annual Return (Gross):</span><strong>{expectedReturn}%</strong></div>
              <div className="flex justify-between py-1"><span>Expense Ratio:</span><strong>{expenseRatio}%</strong></div>
              <div className="flex justify-between py-1"><span>Effective Return (Net):</span><strong>{(expectedReturn - expenseRatio).toFixed(2)}%</strong></div>
              <div className="flex justify-between py-1"><span>Total Invested:</span><strong>{formatCurrency(totalInvested)}</strong></div>
              <div className="flex justify-between py-1"><span>Total Returns (Gross):</span><strong>{formatCurrency(totalReturns)}</strong></div>
              <div className="flex justify-between py-1"><span>Final Maturity:</span><strong className="text-purple-700">{formatCurrency(currentMaturity)}</strong></div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={handleCalculate} className="px-6 py-2 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 transition">
                Calculate →
              </button>
              <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="px-6 py-2 border-2 border-purple-600 text-purple-700 rounded-xl hover:bg-purple-50 disabled:opacity-50">
                {isGeneratingPDF ? 'Generating...' : '📄 Download PDF Report'}
              </button>
            </div>
          </div>
        </div>

        {/* SEO & FAQ Section */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/50 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to Mutual Fund Calculator</h2>
          <p className="text-gray-600 leading-relaxed">
            A Mutual Fund Calculator helps you estimate future value of your investments. Use it to plan for retirement, child education, or any financial goal.
          </p>
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div><strong>Q1. Is the mutual fund calculator accurate?</strong><p className="text-gray-600">Yes, it uses standard formulas. Actual returns vary with market performance.</p></div>
            <div><strong>Q2. What is a good expected return?</strong><p className="text-gray-600">Equity: 12-15%, Debt: 6-9%, Hybrid: 9-12% (historical).</p></div>
            <div><strong>Q3. Direct vs Regular – which is better?</strong><p className="text-gray-600">Direct plans have lower expense ratios, hence better long-term returns.</p></div>
            <div><strong>Q4. How to download report?</strong><p className="text-gray-600">Click "Download PDF Report" – the PDF includes all charts and data.</p></div>
          </div>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: Past performance does not guarantee future returns. Please consult a financial advisor.
          </div>
        </div>
      </div>
    </div>
  );
}