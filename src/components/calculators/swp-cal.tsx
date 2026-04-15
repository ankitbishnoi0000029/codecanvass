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

// --- Utility Functions ---
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

// SWP Calculation: given lump sum, monthly withdrawal, annual return, compute monthly balances and months until depletion
const computeSWP = (
  lumpSum: number,
  monthlyWithdrawal: number,
  annualReturnPercent: number
): {
  months: number;
  totalWithdrawn: number;
  finalBalance: number;
  monthlyBalances: { month: number; balance: number }[];
  totalInterestEarned: number;
} => {
  if (lumpSum <= 0 || monthlyWithdrawal <= 0 || annualReturnPercent < 0) {
    return {
      months: 0,
      totalWithdrawn: 0,
      finalBalance: lumpSum,
      monthlyBalances: [{ month: 0, balance: lumpSum }],
      totalInterestEarned: 0,
    };
  }

  const monthlyRate = annualReturnPercent / 100 / 12;
  let balance = lumpSum;
  let month = 0;
  const balances = [{ month: 0, balance: lumpSum }];
  let totalWithdrawn = 0;
  let totalInterestEarned = 0;

  // Simulate month by month
  while (balance > 0 && balance >= monthlyWithdrawal) {
    // Apply interest for the month
    const interest = balance * monthlyRate;
    totalInterestEarned += interest;
    balance += interest;
    // Withdraw at month end
    balance -= monthlyWithdrawal;
    totalWithdrawn += monthlyWithdrawal;
    month++;
    balances.push({ month, balance: Math.max(0, balance) });
    // Safety break
    if (month > 600) break; // max 50 years
  }

  // If balance left but less than withdrawal, we can optionally withdraw partial? Usually SWP stops when insufficient.
  // For simplicity, we stop at last full withdrawal.
  const finalBalance = balance;
  return {
    months: month,
    totalWithdrawn,
    finalBalance,
    monthlyBalances: balances,
    totalInterestEarned,
  };
};

// For given tenure (years), compute maximum sustainable monthly withdrawal
const computeMaxWithdrawal = (
  lumpSum: number,
  annualReturnPercent: number,
  years: number
): number => {
  if (lumpSum <= 0 || annualReturnPercent <= 0 || years <= 0) return 0;
  const monthlyRate = annualReturnPercent / 100 / 12;
  const months = years * 12;
  // PMT formula: Withdrawal = P * r * (1+r)^n / ((1+r)^n - 1)
  const factor = Math.pow(1 + monthlyRate, months);
  const monthlyWithdrawal = (lumpSum * monthlyRate * factor) / (factor - 1);
  return monthlyWithdrawal;
};

// --- Main Component ---
export default function SWPCalculator() {
  // State for inputs
  const [lumpSum, setLumpSum] = useState<number>(1000000); // ₹10 Lakhs
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState<number>(10000);
  const [expectedReturn, setExpectedReturn] = useState<number>(8);
  const [tenureYears, setTenureYears] = useState<number>(10); // for "Max Withdrawal" mode

  // Mode: either "Calculate Duration" or "Calculate Withdrawal"
  const [mode, setMode] = useState<'duration' | 'withdrawal'>('duration');

  // Computed SWP results for duration mode
  const swpResult = useMemo(
    () => computeSWP(lumpSum, monthlyWithdrawal, expectedReturn),
    [lumpSum, monthlyWithdrawal, expectedReturn]
  );

  // For withdrawal mode: compute max monthly withdrawal for given tenure
  const maxWithdrawal = useMemo(
    () => computeMaxWithdrawal(lumpSum, expectedReturn, tenureYears),
    [lumpSum, expectedReturn, tenureYears]
  );

  // For charts: if duration mode, use monthlyBalances; if withdrawal mode, simulate balance with maxWithdrawal
  const chartData = useMemo(() => {
    if (mode === 'duration') {
      return swpResult.monthlyBalances.filter((_, idx) => idx % 6 === 0 || idx === swpResult.monthlyBalances.length - 1); // sample points for performance
    } else {
      // Simulate balance using maxWithdrawal over tenureYears
      const sim = computeSWP(lumpSum, maxWithdrawal, expectedReturn);
      return sim.monthlyBalances.filter((_, idx) => idx % 6 === 0 || idx === sim.monthlyBalances.length - 1);
    }
  }, [mode, lumpSum, expectedReturn, monthlyWithdrawal, maxWithdrawal, tenureYears, swpResult]);

  // Pie data: For duration mode: total withdrawn vs remaining balance (if any). For withdrawal mode: total withdrawals over tenure vs final balance (usually zero if exact)
  const pieData = useMemo(() => {
    if (mode === 'duration') {
      const remaining = swpResult.finalBalance;
      const withdrawn = swpResult.totalWithdrawn;
      return [
        { name: 'Total Withdrawn', value: withdrawn, color: '#10B981' },
        { name: 'Remaining Corpus', value: remaining, color: '#3B82F6' },
      ].filter(item => item.value > 0);
    } else {
      const sim = computeSWP(lumpSum, maxWithdrawal, expectedReturn);
      const totalWithdrawn = sim.totalWithdrawn;
      const finalRemaining = sim.finalBalance;
      return [
        { name: 'Total Withdrawn', value: totalWithdrawn, color: '#10B981' },
        { name: 'Remaining Corpus', value: finalRemaining, color: '#3B82F6' },
      ].filter(item => item.value > 0);
    }
  }, [mode, lumpSum, expectedReturn, monthlyWithdrawal, maxWithdrawal, tenureYears, swpResult]);

  const totalInvestment = lumpSum;
  const totalReturns = (mode === 'duration' ? swpResult.totalInterestEarned : (() => {
    const sim = computeSWP(lumpSum, maxWithdrawal, expectedReturn);
    return sim.totalInterestEarned;
  })());

  // Ref for PDF capture
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

 const handleDownloadPDF = async () => {
       setIsGeneratingPDF(true); // keep loading state if needed, or rename to setIsDownloading
       try {
         // Prepare the data array for download (adjust based on your actual data structure)
         const downloadData = [
           { metric: 'Initial Investment', value: formatCurrency(lumpSum) },
           { metric: 'Expected Return', value: expectedReturn + '%' },
           { metric: 'Time Period', value: tenureYears + ' years' },
           { metric: 'Monthly Withdrawal', value: formatCurrency(monthlyWithdrawal) },
           { metric: 'Total Investment', value: formatCurrency(totalInvestment) },
           { metric: 'Total Returns', value: formatCurrency(totalReturns) },
           { metric: 'Total Withdrawal', value: formatCurrency(swpResult.totalWithdrawn) },
           { metric: 'Final Balance', value: formatCurrency(swpResult.finalBalance) },
           { metric: 'Months', value: swpResult.months },
           { metric: 'Years', value: (swpResult.months / 12).toFixed(1) },
           { metric: 'Interest Earned', value: formatCurrency(swpResult.totalInterestEarned) },
           { metric: 'Interest Rate', value: (expectedReturn / 12).toFixed(2) + '%' },
           { metric: 'ROI', value: ((swpResult.totalInterestEarned / totalInvestment) * 100).toFixed(2) + '%' },
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

  const handleStartSWP = () => {
    alert(`📊 SWP Plan:\nInitial Investment: ${formatCurrency(lumpSum)}\nMonthly Withdrawal: ${formatCurrency(monthlyWithdrawal)}\nExpected Return: ${expectedReturn}% p.a.\nFunds will last for ${swpResult.months} months (${(swpResult.months / 12).toFixed(1)} years).\nTotal Withdrawn: ${formatCurrency(swpResult.totalWithdrawn)}`);
  };

  const handleApplyMaxWithdrawal = () => {
    if (tenureYears > 0) {
      setMonthlyWithdrawal(Math.round(maxWithdrawal));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-teal-700 to-blue-700 bg-clip-text text-transparent">
            SWP Calculator
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Systematic Withdrawal Plan – Estimate how long your lump sum investment lasts with regular monthly withdrawals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT PANEL: Inputs */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-teal-600 rounded-full"></span>
              Withdrawal Plan Details
            </h2>

            {/* Mode Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => setMode('duration')}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${mode === 'duration' ? 'bg-white shadow text-teal-700' : 'text-gray-600'}`}
              >
                Calculate Duration
              </button>
              <button
                onClick={() => setMode('withdrawal')}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${mode === 'withdrawal' ? 'bg-white shadow text-blue-700' : 'text-gray-600'}`}
              >
                Calculate Withdrawal Amount
              </button>
            </div>

            {/* Lump Sum Investment */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Lump Sum Investment</label>
              <input
                type="number"
                value={lumpSum}
                onChange={(e) => setLumpSum(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 outline-none"
                step="10000"
                min="0"
              />
              <input
                type="range"
                min="50000"
                max="10000000"
                step="50000"
                value={lumpSum}
                onChange={(e) => setLumpSum(Number(e.target.value))}
                className="w-full mt-2 accent-teal-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>₹50K</span>
                <span>₹25L</span>
                <span>₹50L</span>
                <span>₹1Cr</span>
              </div>
            </div>

            {/* Expected Return */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Expected Return (p.a.)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="flex-1 accent-green-600"
                />
                <span className="w-16 text-right font-bold text-green-700">{expectedReturn}%</span>
              </div>
            </div>

            {/* Conditional Inputs: Monthly Withdrawal OR Tenure */}
            {mode === 'duration' ? (
              <div className="mb-6">
                <label className="text-gray-700 font-semibold block mb-2">Monthly Withdrawal Amount</label>
                <input
                  type="number"
                  value={monthlyWithdrawal}
                  onChange={(e) => setMonthlyWithdrawal(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                  step="500"
                  min="500"
                />
                <input
                  type="range"
                  min="500"
                  max={lumpSum * 0.1}
                  step="500"
                  value={monthlyWithdrawal}
                  onChange={(e) => setMonthlyWithdrawal(Number(e.target.value))}
                  className="w-full mt-2"
                />
              </div>
            ) : (
              <div className="mb-6">
                <label className="text-gray-700 font-semibold block mb-2">Desired Tenure (years)</label>
                <input
                  type="number"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
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
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full mt-2"
                />
                <div className="mt-3">
                  <button
                    onClick={handleApplyMaxWithdrawal}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition"
                  >
                    Suggest Max Monthly Withdrawal: {formatCurrency(maxWithdrawal)}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-teal-50 rounded-xl p-4 text-sm text-teal-800">
              💡 SWP allows you to withdraw a fixed amount regularly while the remaining corpus continues to earn returns.
            </div>
          </div>

          {/* RIGHT PANEL: Report & Charts (PDF area) */}
          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">SWP Report</h2>
              <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN')}</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
                <p className="text-blue-600 text-xs">Initial Investment</p>
                <p className="text-xl font-bold">{formatCurrency(lumpSum)}</p>
              </div>
              {mode === 'duration' ? (
                <>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 text-center">
                    <p className="text-emerald-600 text-xs">Total Withdrawn</p>
                    <p className="text-xl font-bold">{formatCurrency(swpResult.totalWithdrawn)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 text-center">
                    <p className="text-purple-600 text-xs">Duration</p>
                    <p className="text-xl font-bold">{swpResult.months} months</p>
                    <p className="text-xs">({(swpResult.months / 12).toFixed(1)} years)</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 text-center">
                    <p className="text-emerald-600 text-xs">Suggested Monthly Withdrawal</p>
                    <p className="text-xl font-bold">{formatCurrency(maxWithdrawal)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 text-center">
                    <p className="text-purple-600 text-xs">Tenure</p>
                    <p className="text-xl font-bold">{tenureYears} years</p>
                  </div>
                </>
              )}
            </div>

            {/* Line Chart: Corpus Decline */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Corpus Over Time</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickFormatter={(m) => `${m}M`} />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} width={70} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} labelFormatter={(l) => `Month ${l}`} />
                    <Legend />
                    <Line type="monotone" dataKey="balance" name="Remaining Corpus" stroke="#f97316" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Withdrawn vs Remaining */}
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

            {/* Extra Info */}
            <div className="text-center text-gray-500 text-sm bg-gray-50 p-3 rounded-lg mb-4">
              Total Interest Earned: {formatCurrency(totalReturns)}
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={handleStartSWP}
                className="px-6 py-2 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl shadow-lg hover:scale-105 transition"
              >
                Start SWP →
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="px-6 py-2 border-2 border-teal-600 text-teal-700 rounded-xl hover:bg-teal-50 disabled:opacity-50"
              >
                {isGeneratingPDF ? 'Generating...' : '📄 Download PDF Report'}
              </button>
            </div>
          </div>
        </div>
        <div className="text-center text-gray-400 text-xs mt-8">
          *SWP calculations are estimates. Actual returns depend on market performance.
        </div>
      </div>
    </div>
  );
}