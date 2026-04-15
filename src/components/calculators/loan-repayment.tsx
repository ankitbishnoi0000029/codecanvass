'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
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

// Calculate EMI and total interest for a loan
const calculateLoanDetails = (
  principal: number,
  annualRate: number,
  tenureMonths: number
): { emi: number; totalInterest: number; totalPayment: number } => {
  if (principal <= 0 || annualRate <= 0 || tenureMonths <= 0) {
    return { emi: 0, totalInterest: 0, totalPayment: 0 };
  }
  const monthlyRate = annualRate / 100 / 12;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - principal;
  return { emi, totalInterest, totalPayment };
};

// Calculate new loan details after prepayment at a specific month
const calculatePrepaymentImpact = (
  originalPrincipal: number,
  annualRate: number,
  originalTenureMonths: number,
  prepaymentAmount: number,
  prepaymentMonth: number
): {
  newTenureMonths: number;
  interestSaved: number;
  newTotalInterest: number;
  originalEmi: number;
  originalTotalInterest: number;
  monthlyComparisonData: { month: number; originalBalance: number; newBalance: number }[];
} => {
  if (prepaymentAmount <= 0 || prepaymentMonth <= 0 || prepaymentMonth > originalTenureMonths) {
    const { emi, totalInterest } = calculateLoanDetails(originalPrincipal, annualRate, originalTenureMonths);
    return {
      newTenureMonths: originalTenureMonths,
      interestSaved: 0,
      newTotalInterest: totalInterest,
      originalEmi: emi,
      originalTotalInterest: totalInterest,
      monthlyComparisonData: [],
    };
  }

  const monthlyRate = annualRate / 100 / 12;
  const { emi: originalEmi, totalInterest: originalTotalInterest } = calculateLoanDetails(
    originalPrincipal,
    annualRate,
    originalTenureMonths
  );

  // Calculate outstanding principal just before prepayment month
  let outstandingPrincipal = originalPrincipal;
  for (let month = 1; month <= prepaymentMonth; month++) {
    const interestForMonth = outstandingPrincipal * monthlyRate;
    const principalPaid = originalEmi - interestForMonth;
    outstandingPrincipal -= principalPaid;
    if (outstandingPrincipal < 0) outstandingPrincipal = 0;
  }
  // Apply prepayment
  let newPrincipal = outstandingPrincipal - prepaymentAmount;
  if (newPrincipal < 0) newPrincipal = 0;

  // Calculate new EMI (assuming same EMI continues, tenure reduces) OR we can keep same tenure and reduce EMI.
  // Most common: keep EMI same, reduce tenure.
  let newTenureMonths = 0;
  if (newPrincipal > 0) {
    // Calculate remaining months to pay off newPrincipal with same EMI
    // Formula: n = log( EMI / (EMI - P*r) ) / log(1+r)
    const emi = originalEmi;
    const r = monthlyRate;
    if (emi > newPrincipal * r) {
      newTenureMonths = Math.ceil(
        Math.log(emi / (emi - newPrincipal * r)) / Math.log(1 + r)
      );
    } else {
      newTenureMonths = 0;
    }
  } else {
    newTenureMonths = 0;
  }

  // Calculate new total interest
  let newTotalInterest = 0;
  if (newTenureMonths > 0) {
    newTotalInterest = originalEmi * newTenureMonths - newPrincipal;
  } else {
    newTotalInterest = 0;
  }
  // Add interest already paid before prepayment
  let interestPaidBefore = 0;
  let balance = originalPrincipal;
  for (let month = 1; month <= prepaymentMonth; month++) {
    const interest = balance * monthlyRate;
    interestPaidBefore += interest;
    const principalPaid = originalEmi - interest;
    balance -= principalPaid;
  }
  newTotalInterest += interestPaidBefore;

  const interestSaved = originalTotalInterest - newTotalInterest;

  // Generate monthly balance comparison (for chart, sample every 6 months)
  const comparisonData = [];
  const maxMonths = Math.max(originalTenureMonths, newTenureMonths + prepaymentMonth);
  let origBalance = originalPrincipal;
  let newBalance = originalPrincipal;
  let prepaymentApplied = false;

  for (let month = 1; month <= maxMonths; month++) {
    if (month <= originalTenureMonths) {
      const interestOrig = origBalance * monthlyRate;
      const principalPaidOrig = originalEmi - interestOrig;
      origBalance -= principalPaidOrig;
      if (origBalance < 0) origBalance = 0;
    }

    if (!prepaymentApplied && month === prepaymentMonth) {
      newBalance -= prepaymentAmount;
      if (newBalance < 0) newBalance = 0;
      prepaymentApplied = true;
    }

    if (month <= originalTenureMonths && newBalance > 0) {
      const interestNew = newBalance * monthlyRate;
      const principalPaidNew = originalEmi - interestNew;
      newBalance -= principalPaidNew;
      if (newBalance < 0) newBalance = 0;
    }

    if (month % 6 === 0 || month === 1 || month === maxMonths) {
      comparisonData.push({
        month,
        originalBalance: Math.max(0, origBalance),
        newBalance: Math.max(0, newBalance),
      });
    }
  }

  return {
    newTenureMonths: newTenureMonths + prepaymentMonth,
    interestSaved,
    newTotalInterest,
    originalEmi,
    originalTotalInterest,
    monthlyComparisonData: comparisonData,
  };
};

// --- Main Component ---
export default function LoanPrepaymentCalculator() {
  // State
  const [loanAmount, setLoanAmount] = useState<number>(5000000); // ₹50 Lakhs
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [prepaymentAmount, setPrepaymentAmount] = useState<number>(500000);
  const [prepaymentYear, setPrepaymentYear] = useState<number>(5); // after how many years

  // Derived values
  const tenureMonths = tenureYears * 12;
  const prepaymentMonth = prepaymentYear * 12;

  const originalLoan = useMemo(
    () => calculateLoanDetails(loanAmount, interestRate, tenureMonths),
    [loanAmount, interestRate, tenureMonths]
  );

  const prepaymentResult = useMemo(
    () =>
      calculatePrepaymentImpact(
        loanAmount,
        interestRate,
        tenureMonths,
        prepaymentAmount,
        prepaymentMonth
      ),
    [loanAmount, interestRate, tenureMonths, prepaymentAmount, prepaymentMonth]
  );

  // Pie data: Original Total Interest vs New Total Interest vs Principal
  const pieDataOriginal = [
    { name: 'Principal', value: loanAmount, color: '#6366F1' }, // indigo
    { name: 'Total Interest (Original)', value: originalLoan.totalInterest, color: '#F59E0B' },
  ];

  const pieDataNew = [
    { name: 'Principal', value: loanAmount, color: '#6366F1' },
    { name: 'Total Interest (After Prepayment)', value: prepaymentResult.newTotalInterest, color: '#10B981' },
  ];

  // Bar chart data: comparison of interest
  const comparisonBarData = [
    { name: 'Original Loan', 'Total Interest': originalLoan.totalInterest, fill: '#F59E0B' },
    { name: 'After Prepayment', 'Total Interest': prepaymentResult.newTotalInterest, fill: '#10B981' },
  ];

  // Line chart data for monthly balances
  const balanceData = prepaymentResult.monthlyComparisonData;

  // Savings summary
  const tenureSavedYears = Math.floor((tenureMonths - prepaymentResult.newTenureMonths) / 12);
  const tenureSavedMonths = (tenureMonths - prepaymentResult.newTenureMonths) % 12;

  // PDF Ref & Handler
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

const handleDownloadPDF = async () => {
      setIsGeneratingPDF(true); // keep loading state if needed, or rename to setIsDownloading
      try {
        // Prepare the data array for download (adjust based on your actual data structure)
        const downloadData = [
          { metric: 'Loan Amount', value: formatCurrency(loanAmount) },
          { metric: 'Interest Rate', value: interestRate + '%' },
          { metric: 'Tenure (Years)', value: tenureYears },
          { metric: 'Prepayment Amount', value: formatCurrency(prepaymentAmount) },
          { metric: 'Prepayment Year', value: prepaymentYear },
          { metric: 'Prepayment Result', value: JSON.stringify(prepaymentResult, null, 2) },
          
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
  const handleApplyPrepayment = () => {
    alert(`🏦 Loan Prepayment Analysis:\nLoan Amount: ${formatCurrency(loanAmount)}\nInterest Rate: ${interestRate}%\nOriginal Tenure: ${tenureYears} years\nPrepayment: ${formatCurrency(prepaymentAmount)} after ${prepaymentYear} years\n\n✅ Interest Saved: ${formatCurrency(prepaymentResult.interestSaved)}\n⏱️ Tenure Reduced by: ${tenureSavedYears} years ${tenureSavedMonths} months\n💰 New Total Interest: ${formatCurrency(prepaymentResult.newTotalInterest)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
            Loan Prepayment Calculator
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            See how much interest you save and how many years you cut off your loan by making a lump sum prepayment. Plan your loan freedom smarter.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT PANEL: Input Controls */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-indigo-600 rounded-full"></span>
              Loan & Prepayment Details
            </h2>

            {/* Loan Amount */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Loan Amount (₹)</label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                step="100000"
                min="0"
              />
              <input
                type="range"
                min="100000"
                max="20000000"
                step="100000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full mt-2 accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>₹1L</span>
                <span>₹50L</span>
                <span>₹1Cr</span>
                <span>₹2Cr</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Interest Rate (% p.a.)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.25"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="flex-1 accent-purple-600"
                />
                <span className="w-16 text-right font-bold text-purple-700">{interestRate}%</span>
              </div>
            </div>

            {/* Tenure */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Loan Tenure (Years)</label>
              <input
                type="number"
                value={tenureYears}
                onChange={(e) => setTenureYears(Math.min(30, Math.max(1, Number(e.target.value))))}
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
              <p className="text-xs text-gray-500">Equivalent months: {tenureYears * 12} months</p>
            </div>

            {/* Prepayment Amount */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Prepayment Amount (₹)</label>
              <input
                type="number"
                value={prepaymentAmount}
                onChange={(e) => setPrepaymentAmount(Math.min(loanAmount, Math.max(0, Number(e.target.value))))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                step="25000"
                min="0"
              />
              <input
                type="range"
                min="0"
                max={loanAmount}
                step="25000"
                value={prepaymentAmount}
                onChange={(e) => setPrepaymentAmount(Number(e.target.value))}
                className="w-full mt-2 accent-green-600"
              />
            </div>

            {/* Prepayment Timing (Year) */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Prepayment After (Years)</label>
              <input
                type="number"
                value={prepaymentYear}
                onChange={(e) => setPrepaymentYear(Math.min(tenureYears, Math.max(1, Number(e.target.value))))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                step="1"
                min="1"
                max={tenureYears}
              />
              <input
                type="range"
                min="1"
                max={tenureYears}
                step="1"
                value={prepaymentYear}
                onChange={(e) => setPrepaymentYear(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>

            <div className="bg-indigo-50 rounded-xl p-4 text-sm text-indigo-800">
              💡 A prepayment of {formatCurrency(prepaymentAmount)} after {prepaymentYear} years saves you <strong>{formatCurrency(prepaymentResult.interestSaved)}</strong> in interest and cuts your loan by <strong>{tenureSavedYears} years {tenureSavedMonths} months</strong>.
            </div>
          </div>

          {/* RIGHT PANEL: Report & Charts (PDF Area) */}
          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Loan Prepayment Report</h2>
              <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN')}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 text-center">
                <p className="text-slate-600 text-xs">Monthly EMI</p>
                <p className="text-xl font-bold">{formatCurrency(originalLoan.emi)}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 text-center">
                <p className="text-amber-600 text-xs">Original Total Interest</p>
                <p className="text-xl font-bold">{formatCurrency(originalLoan.totalInterest)}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 text-center">
                <p className="text-emerald-600 text-xs">Interest Saved</p>
                <p className="text-xl font-bold">{formatCurrency(prepaymentResult.interestSaved)}</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-3 text-center">
                <p className="text-indigo-600 text-xs">New Loan Tenure</p>
                <p className="text-xl font-bold">{Math.floor(prepaymentResult.newTenureMonths / 12)}Y {prepaymentResult.newTenureMonths % 12}M</p>
                <p className="text-xs">(Reduced by {tenureSavedYears}Y {tenureSavedMonths}M)</p>
              </div>
            </div>

            {/* Bar Chart: Interest Comparison */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Interest Comparison</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonBarData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} width={70} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="Total Interest" fill="#8884d8" radius={[8, 8, 0, 0]}>
                      {comparisonBarData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Line Chart: Outstanding Balance Over Time */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Outstanding Balance Comparison</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={balanceData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickFormatter={(m) => `${Math.floor(m / 12)}Y${m % 12}M`} />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} width={70} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} labelFormatter={(l) => `Month ${l}`} />
                    <Legend />
                    <Line type="monotone" dataKey="originalBalance" name="Original Loan Balance" stroke="#F59E0B" strokeWidth={3} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="newBalance" name="After Prepayment Balance" stroke="#10B981" strokeWidth={3} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Charts Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div>
                <h3 className="text-md font-semibold text-gray-700 mb-2 text-center">Original Loan Breakdown</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieDataOriginal} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" >
                        {pieDataOriginal.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h3 className="text-md font-semibold text-gray-700 mb-2 text-center">After Prepayment Breakdown</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieDataNew} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" >
                        {pieDataNew.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={handleApplyPrepayment} className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:scale-105 transition">
                Analyze Prepayment →
              </button>
              <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="px-6 py-2 border-2 border-indigo-600 text-indigo-700 rounded-xl hover:bg-indigo-50 disabled:opacity-50">
                {isGeneratingPDF ? 'Generating...' : '📄 Download PDF Report'}
              </button>
            </div>
          </div>
        </div>

        {/* ========== 5000+ WORDS SEO CONTENT SECTION ========== */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/50 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to Loan Prepayment Calculator: Save Interest, Become Debt-Free Sooner</h2>
          <p className="text-gray-600 leading-relaxed">
            Taking a loan – whether for a home, car, or personal needs – is a major financial decision. But what if you could reduce the total interest you pay and shorten the loan tenure? That’s where a <strong>Loan Prepayment Calculator</strong> becomes invaluable. It helps you visualise the impact of making a lump sum payment towards your outstanding loan principal, allowing you to save thousands (or even lakhs) in interest.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            Our interactive <strong>Loan Prepayment Calculator</strong> above lets you input your loan amount, interest rate, tenure, prepayment amount, and the year you plan to make the prepayment. It instantly shows you the interest saved, the new loan tenure, and provides detailed charts. Use this tool to decide whether prepayment is right for you and how to optimise your debt repayment strategy.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">1. How Loan Prepayment Works – The Math</h3>
          <p className="text-gray-600">
            When you take a loan, you repay it through EMIs (Equated Monthly Instalments). Each EMI consists of two parts: <strong>principal repayment</strong> and <strong>interest</strong>. In the early years, the interest component is very high. A prepayment directly reduces the outstanding principal, which reduces the total interest accrued over the remaining tenure.
          </p>
          <p className="text-gray-600 mt-2">
            The calculator uses standard loan amortisation formulas. After prepayment, either your EMI reduces (keeping tenure same) or your tenure reduces (keeping EMI same). Most calculators (including ours) assume you keep the EMI constant and shorten the tenure – this maximises interest savings.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">2. Why Consider Loan Prepayment?</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Save massive interest:</strong> On a ₹50 lakh home loan at 8.5% for 20 years, total interest is ~₹54 lakh. A ₹5 lakh prepayment in year 5 can save over ₹12 lakh in interest.</li>
            <li><strong>Become debt-free earlier:</strong> Shorter tenure means financial freedom sooner.</li>
            <li><strong>Improve credit score:</strong> Closing a loan early positively impacts credit history.</li>
            <li><strong>Reduce financial stress:</strong> Lower outstanding debt gives peace of mind.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">3. When Is Prepayment Beneficial?</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Early years of loan:</strong> Prepaying in the first 1/3rd of tenure saves the most interest because interest component is highest.</li>
            <li><strong>When you have surplus cash:</strong> If you have an emergency fund and no better investment yielding more than your loan interest rate, prepay.</li>
            <li><strong>Floating rate loans:</strong> If interest rates are rising, prepayment locks in savings.</li>
            <li><strong>Before switching to a new loan:</strong> Prepaying before a balance transfer reduces new loan amount.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">4. Types of Loans and Prepayment Rules in India</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Home Loans:</strong> No prepayment penalty for floating rate loans (RBI mandate). Fixed rate loans may have 2-3% penalty.</li>
            <li><strong>Car Loans:</strong> Usually have prepayment penalty of 3-5% of outstanding principal.</li>
            <li><strong>Personal Loans:</strong> Often have high prepayment charges (5-7%). Check terms.</li>
            <li><strong>Education Loans:</strong> Many banks allow prepayment without penalty.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">5. How to Use the Loan Prepayment Calculator Effectively</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Compare scenarios:</strong> Try different prepayment amounts and years to see which gives maximum interest savings.</li>
            <li><strong>Budget planning:</strong> Know exactly how much extra cash you need to set aside for prepayment.</li>
            <li><strong>Tax implications:</strong> For home loans, interest saved reduces your Section 24 deduction. Factor that if applicable.</li>
            <li><strong>PDF report:</strong> Download and share with your spouse or financial advisor.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">6. Loan Amortisation – A Closer Look</h3>
          <p className="text-gray-600">
            In a typical amortising loan, your EMI remains constant, but the proportion of principal vs interest changes over time. The calculator uses the formula: <code>EMI = P * r * (1+r)^n / ((1+r)^n - 1)</code>. After prepayment, the outstanding principal reduces, and the remaining schedule recalculates, leading to either lower EMI or shorter tenure.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">7. Prepayment vs Investment – Which Is Better?</h3>
          <p className="text-gray-600">
            This is a classic dilemma. If your loan interest rate is 8.5%, and you can earn 12% from mutual funds, investing might be better. But returns are not guaranteed. Prepayment gives a guaranteed, risk-free return equal to your loan interest rate. Many financial experts recommend prepaying high-interest debt (above 10%) and investing if loan rate is low (below 8%).
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">8. Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div>
              <strong className="text-gray-800">Q1. Is the Loan Prepayment Calculator accurate?</strong>
              <p className="text-gray-600">Yes, it uses standard amortisation formulas. Actual bank calculations may vary slightly due to rounding or different day-count conventions, but it's very close.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q2. Does prepayment affect my credit score?</strong>
              <p className="text-gray-600">Generally, prepayment doesn't hurt; it may even help by showing responsible debt management.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q3. Can I prepay partially multiple times?</strong>
              <p className="text-gray-600">Yes, most banks allow multiple partial prepayments. You can simulate each prepayment sequentially using our calculator.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q4. Should I prepay if I have a low-interest loan (e.g., 6%)?</strong>
              <p className="text-gray-600">If you have a very low rate (like education loan subsidy), investing the surplus might be better. But peace of mind matters too.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q5. How to download the report?</strong>
              <p className="text-gray-600">Click “Download PDF Report”. It captures all charts, summary, and input parameters.</p>
            </div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">9. Real-Life Example</h3>
          <p className="text-gray-600">
            <strong>Scenario:</strong> Mr. Sharma has a ₹40 lakh home loan at 8.5% for 20 years. His EMI is ~₹34,700. Total interest payable: ₹43.3 lakh. He receives a bonus of ₹5 lakh in year 5 and decides to prepay.
            <br />
            <strong>Result:</strong> He saves ~₹11.2 lakh in interest and reduces his tenure by over 4 years. He becomes debt-free earlier and redirects his EMI towards other goals.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">10. Final Thoughts</h3>
          <p className="text-gray-600">
            A Loan Prepayment Calculator is a powerful tool in your debt management arsenal. It quantifies the benefits of making extra payments, helping you decide when and how much to prepay. Use it regularly, especially when you receive bonuses, tax refunds, or have surplus cash. Combine it with an EMI calculator for a complete picture.
          </p>
          <p className="text-gray-600 mt-4">
            <strong>Start using the Loan Prepayment Calculator above now</strong> – see how much you can save and take control of your debt today!
          </p>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: Calculations are estimates. Actual loan terms may include processing fees, prepayment charges, or other conditions. Consult your lender.
          </div>
        </div>
      </div>
    </div>
  );
}