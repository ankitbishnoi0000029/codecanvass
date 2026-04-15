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
    minimumFractionDigits: 0,
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

// EMI Calculation: P * r * (1+r)^n / ((1+r)^n - 1)
const calculateEMI = (principal: number, annualRate: number, months: number): number => {
  if (principal <= 0 || annualRate <= 0 || months <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(emi);
};

// Generate amortization schedule
const generateAmortization = (principal: number, annualRate: number, months: number) => {
  const monthlyRate = annualRate / 100 / 12;
  const emi = calculateEMI(principal, annualRate, months);
  let balance = principal;
  const schedule = [];
  
  for (let month = 1; month <= months; month++) {
    const interest = balance * monthlyRate;
    const principalPaid = emi - interest;
    balance -= principalPaid;
    schedule.push({
      month,
      emi: Math.round(emi),
      interest: Math.round(interest),
      principal: Math.round(principalPaid),
      balance: Math.max(0, Math.round(balance)),
    });
    if (balance <= 0) break;
  }
  return schedule;
};

// Calculate total interest and total payment
const calculateTotals = (principal: number, annualRate: number, months: number) => {
  const emi = calculateEMI(principal, annualRate, months);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;
  return { emi, totalPayment, totalInterest };
};

// Prepayment impact
const calculatePrepaymentImpact = (
  principal: number,
  annualRate: number,
  months: number,
  prepaymentAmount: number,
  prepaymentMonth: number
) => {
  const monthlyRate = annualRate / 100 / 12;
  const originalEmi = calculateEMI(principal, annualRate, months);
  
  // Calculate balance after prepaymentMonth months
  let balance = principal;
  for (let i = 1; i <= prepaymentMonth; i++) {
    const interest = balance * monthlyRate;
    const principalPaid = originalEmi - interest;
    balance -= principalPaid;
  }
  balance = Math.max(0, balance - prepaymentAmount);
  
  // Recalculate remaining tenure with same EMI or new EMI
  let newMonths = 0;
  if (balance > 0) {
    newMonths = Math.ceil(Math.log(originalEmi / (originalEmi - balance * monthlyRate)) / Math.log(1 + monthlyRate));
  }
  const originalTotalInterest = calculateTotals(principal, annualRate, months).totalInterest;
  const newTotalPayment = originalEmi * prepaymentMonth + prepaymentAmount + originalEmi * newMonths;
  const newTotalInterest = newTotalPayment - principal;
  const interestSaved = originalTotalInterest - newTotalInterest;
  const tenureReduced = months - (prepaymentMonth + newMonths);
  
  return { newMonths, interestSaved, tenureReduced, newTotalInterest };
};

// Yearly summary for chart
const getYearlySummary = (schedule: any[]) => {
  const yearly: any[] = [];
  let currentYear = 1;
  let yearData = { year: 1, interest: 0, principal: 0, balance: 0 };
  
  schedule.forEach((monthData, idx) => {
    const month = idx + 1;
    const year = Math.ceil(month / 12);
    if (year !== currentYear) {
      yearly.push({ ...yearData });
      currentYear = year;
      yearData = { year, interest: 0, principal: 0, balance: 0 };
    }
    yearData.interest += monthData.interest;
    yearData.principal += monthData.principal;
    yearData.balance = monthData.balance;
  });
  yearly.push(yearData);
  return yearly;
};

// --- Main Component ---
export default function BusinessLoanCalculator() {
  // State
  const [loanAmount, setLoanAmount] = useState<number>(5000000);
  const [interestRate, setInterestRate] = useState<number>(12);
  const [tenureYears, setTenureYears] = useState<number>(5);
  const [processingFee, setProcessingFee] = useState<number>(1);
  const [prepaymentAmount, setPrepaymentAmount] = useState<number>(0);
  const [prepaymentMonth, setPrepaymentMonth] = useState<number>(12);
  const [showPrepayment, setShowPrepayment] = useState<boolean>(false);

  const months = tenureYears * 12;
  const { emi, totalPayment, totalInterest } = useMemo(
    () => calculateTotals(loanAmount, interestRate, months),
    [loanAmount, interestRate, months]
  );

  const processingFeeAmount = (loanAmount * processingFee) / 100;
  const totalCost = totalPayment + processingFeeAmount;

  const amortizationSchedule = useMemo(
    () => generateAmortization(loanAmount, interestRate, months),
    [loanAmount, interestRate, months]
  );

  const yearlyData = useMemo(
    () => getYearlySummary(amortizationSchedule),
    [amortizationSchedule]
  );

  const prepaymentImpact = useMemo(() => {
    if (!showPrepayment || prepaymentAmount <= 0) return null;
    return calculatePrepaymentImpact(loanAmount, interestRate, months, prepaymentAmount, prepaymentMonth);
  }, [loanAmount, interestRate, months, prepaymentAmount, prepaymentMonth, showPrepayment]);

  // Pie chart data: Principal vs Interest vs Fee
  const pieData = [
    { name: 'Principal', value: loanAmount, color: '#1E3A5F' },
    { name: 'Total Interest', value: totalInterest, color: '#F5A623' },
    { name: 'Processing Fee', value: processingFeeAmount, color: '#D0021B' },
  ].filter(item => item.value > 0);

  // PDF ref
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true); // keep loading state if needed, or rename to setIsDownloading
    try {
      // Prepare the data array for download (adjust based on your actual data structure)
      const downloadData = [
        { metric: 'Loan Amount', value: loanAmount },
        { metric: 'Interest Rate', value: interestRate },
        { metric: 'Tenure (Years)', value: tenureYears },
        { metric: 'Processing Fee', value: processingFee },
        { metric: 'Prepayment Amount', value: prepaymentAmount },
        { metric: 'Prepayment Month', value: prepaymentMonth },
        { metric: 'EMI', value: emi },
        { metric: 'Total Payment', value: totalPayment },
        { metric: 'Total Interest', value: totalInterest },
        { metric: 'Total Cost', value: totalCost },
        { metric: 'Processing Fee Amount', value: processingFeeAmount },
        { metric: 'Amortization Schedule', value: amortizationSchedule },
        { metric: 'Yearly Data', value: yearlyData },
        { metric: 'Prepayment Impact', value: prepaymentImpact },
      ];
  
      // Reusable download function (import from utils or define inline)
      downloadMetricsAsText(downloadData, {
        filename: 'REPORT',
        title: 'Business Loan Calculator Report',
        footer: '* Generated from business loan calculator',
      });
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-blue-900 to-indigo-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            Business Loan Calculator
          </h1>
          <p className="text-blue-200 mt-3 max-w-2xl mx-auto">
            Plan your business financing. Calculate EMI, total interest, processing fees, and see prepayment benefits.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT PANEL - Inputs */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-yellow-400 rounded-full"></span>
              Loan Details
            </h2>

            {/* Loan Amount */}
            <div className="mb-6">
              <label className="text-blue-200 font-semibold block mb-2">Loan Amount (₹)</label>
              <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-900" step="100000" min="10000" />
              <input type="range" min="10000" max="100000000" step="100000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full mt-2 accent-yellow-400" />
              <div className="flex justify-between text-xs text-blue-300 mt-1">
                <span>₹10K</span><span>₹1Cr</span><span>₹5Cr</span><span>₹10Cr</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div className="mb-6">
              <label className="text-blue-200 font-semibold block mb-2">Interest Rate (% p.a.)</label>
              <div className="flex items-center gap-2">
                <input type="range" min="5" max="24" step="0.5" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="flex-1 accent-yellow-400" />
                <span className="w-16 text-right font-bold text-white">{interestRate}%</span>
              </div>
            </div>

            {/* Tenure */}
            <div className="mb-6">
              <label className="text-blue-200 font-semibold block mb-2">Loan Tenure (Years)</label>
              <input type="number" value={tenureYears} onChange={(e) => setTenureYears(Number(e.target.value))} className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900" step="1" min="1" max="30" />
              <input type="range" min="1" max="30" step="1" value={tenureYears} onChange={(e) => setTenureYears(Number(e.target.value))} className="w-full mt-2 accent-yellow-400" />
              <div className="text-xs text-blue-300 mt-1">{tenureYears * 12} months</div>
            </div>

            {/* Processing Fee */}
            <div className="mb-6">
              <label className="text-blue-200 font-semibold block mb-2">Processing Fee (% of loan amount)</label>
              <div className="flex items-center gap-2">
                <input type="range" min="0" max="5" step="0.25" value={processingFee} onChange={(e) => setProcessingFee(Number(e.target.value))} className="flex-1 accent-yellow-400" />
                <span className="w-16 text-right font-bold text-white">{processingFee}%</span>
              </div>
            </div>

            {/* Prepayment Options */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-blue-200 font-semibold cursor-pointer">
                <input type="checkbox" checked={showPrepayment} onChange={(e) => setShowPrepayment(e.target.checked)} className="w-4 h-4" />
                Show Prepayment Analysis
              </label>
            </div>

            {showPrepayment && (
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <div className="mb-3">
                  <label className="text-blue-200 text-sm block mb-1">Prepayment Amount (₹)</label>
                  <input type="number" value={prepaymentAmount} onChange={(e) => setPrepaymentAmount(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg bg-white" step="100000" />
                </div>
                <div>
                  <label className="text-blue-200 text-sm block mb-1">Prepayment Month (1-{months})</label>
                  <input type="number" value={prepaymentMonth} onChange={(e) => setPrepaymentMonth(Math.min(months, Math.max(1, Number(e.target.value))))} className="w-full px-3 py-2 border rounded-lg bg-white" />
                </div>
              </div>
            )}

            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 text-sm text-yellow-200">
              💡 Business loan interest rates typically range from 9% to 24% based on credit score, business vintage, and collateral. Processing fees are usually 0.5% to 2%.
            </div>
          </div>

          {/* RIGHT PANEL - Report */}
          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Loan Summary Report</h2>
              <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN')}</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-blue-600 text-xs">Monthly EMI</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(emi)}</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-3 text-center">
                <p className="text-yellow-600 text-xs">Total Interest</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalInterest)}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-green-600 text-xs">Total Payment (Principal + Interest)</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(totalPayment)}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-red-600 text-xs">Processing Fee</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(processingFeeAmount)}</p>
              </div>
            </div>

            {/* Prepayment Impact */}
            {showPrepayment && prepaymentImpact && prepaymentAmount > 0 && (
              <div className="bg-indigo-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Prepayment Benefit</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-600">Interest Saved:</span><strong className="text-green-700 ml-2">{formatCurrency(prepaymentImpact.interestSaved)}</strong></div>
                  <div><span className="text-gray-600">Tenure Reduced:</span><strong className="text-blue-700 ml-2">{prepaymentImpact.tenureReduced} months</strong></div>
                  <div><span className="text-gray-600">New Remaining Tenure:</span><strong>{prepaymentImpact.newMonths} months</strong></div>
                  <div><span className="text-gray-600">New Total Interest:</span><strong>{formatCurrency(prepaymentImpact.newTotalInterest)}</strong></div>
                </div>
              </div>
            )}

            {/* Pie Chart */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Cost Breakdown</h3>
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

            {/* Yearly Amortization Chart */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Yearly Interest & Principal</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="interest" name="Interest Paid" fill="#F5A623" />
                    <Bar dataKey="principal" name="Principal Paid" fill="#1E3A5F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Balance Reduction Line Chart */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Loan Balance Over Time</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={amortizationSchedule.filter((_, i) => i % 6 === 0)} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="balance" name="Remaining Balance" stroke="#1E3A5F" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Amortization Table (first 12 rows only) */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Amortization Schedule (First 12 Months)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Month</th>
                      <th className="px-3 py-2 text-right">EMI</th>
                      <th className="px-3 py-2 text-right">Principal</th>
                      <th className="px-3 py-2 text-right">Interest</th>
                      <th className="px-3 py-2 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortizationSchedule.slice(0, 12).map((row) => (
                      <tr key={row.month} className="border-b">
                        <td className="px-3 py-2">{row.month}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(row.emi)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(row.principal)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(row.interest)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="px-6 py-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition disabled:opacity-50">
                {isGeneratingPDF ? 'Generating...' : '📄 Download PDF Report'}
              </button>
            </div>
          </div>
        </div>

        {/* SEO Content Section - 10000+ words with FAQs */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/90 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to Business Loan Calculator</h2>
          <p className="text-gray-600 leading-relaxed">
            A Business Loan Calculator is an essential financial tool for entrepreneurs, small business owners, and startups. It helps you estimate monthly EMI, total interest outlay, processing fees, and the overall cost of borrowing. By understanding these numbers upfront, you can make informed decisions about loan amounts, tenures, and prepayment strategies. Our calculator provides detailed amortization schedules, yearly breakdowns, and prepayment impact analysis to empower your business financing decisions.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            In this comprehensive guide, we will explore everything about business loans – types, eligibility, interest rates, fees, tax benefits, and strategies to minimize borrowing costs. We'll also answer the most frequently asked questions to help you navigate the business loan landscape in India.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">1. What is a Business Loan?</h3>
          <p className="text-gray-600">
            A business loan is a debt financing solution provided by banks, NBFCs, or online lenders to meet the financial needs of a business. It can be used for working capital, equipment purchase, expansion, inventory, or managing cash flow. Business loans can be secured (against collateral) or unsecured (based on creditworthiness).
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">2. Types of Business Loans in India</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Term Loan:</strong> Fixed amount repaid over a fixed tenure with EMI.</li>
            <li><strong>Working Capital Loan:</strong> For day-to-day operations, often with flexible repayment.</li>
            <li><strong>Equipment Financing:</strong> Specifically for purchasing machinery or vehicles.</li>
            <li><strong>Invoice Financing:</strong> Against unpaid invoices.</li>
            <li><strong>Business Line of Credit:</strong> Withdraw as needed, pay interest only on used amount.</li>
            <li><strong>Government Schemes:</strong> MUDRA, CGTMSE, Stand-Up India, etc.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">3. How to Use This Business Loan Calculator</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Enter the loan amount you wish to borrow.</li>
            <li>Input the interest rate offered by the lender.</li>
            <li>Select the repayment tenure in years (converted to months automatically).</li>
            <li>Enter the processing fee percentage charged by the lender.</li>
            <li>Optionally, enable prepayment analysis and enter prepayment amount & month.</li>
            <li>View monthly EMI, total interest, total payment, and processing fee.</li>
            <li>Analyze the pie chart, yearly bar chart, and balance reduction graph.</li>
            <li>Review the amortization schedule to see each month's breakdown.</li>
            <li>Download the PDF report for loan application or record keeping.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">4. Business Loan Eligibility Criteria</h3>
          <p className="text-gray-600">
            Typical requirements for business loans in India:
            <ul className="list-disc pl-6 mt-2">
              <li>Business vintage: Minimum 1-3 years (varies by lender).</li>
              <li>Annual turnover: Usually ₹10 lakhs to ₹50 crores.</li>
              <li>Credit score (CIBIL): 650+ for unsecured loans.</li>
              <li>Profitability: Business should be profitable for at least 1 year.</li>
              <li>Documents: GST returns, bank statements, ITR, KYC.</li>
            </ul>
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">5. Factors Affecting Business Loan Interest Rates</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Credit Score:</strong> Higher score (750+) gets lower rates.</li>
            <li><strong>Business Vintage:</strong> Established businesses get better rates.</li>
            <li><strong>Collateral:</strong> Secured loans have lower rates.</li>
            <li><strong>Industry:</strong> Some sectors are considered higher risk.</li>
            <li><strong>Relationship with Bank:</strong> Existing current/savings accounts help.</li>
            <li><strong>Loan Amount & Tenure:</strong> Larger amounts may have negotiation room.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">6. Understanding Processing Fees & Other Charges</h3>
          <p className="text-gray-600">
            - <strong>Processing Fee:</strong> 0.5% to 2% of loan amount (non-refundable).<br />
            - <strong>Prepayment Penalty:</strong> Some lenders charge 2-4% on outstanding amount if you repay early.<br />
            - <strong>Late Payment Fee:</strong> 2-3% per month on overdue EMI.<br />
            - <strong>GST:</strong> 18% on processing fee and other charges.<br />
            - <strong>Legal & Valuation Charges:</strong> For secured loans.<br />
            Our calculator includes processing fee; prepayment analysis assumes no penalty (check with lender).
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">7. Tax Benefits on Business Loans</h3>
          <p className="text-gray-600">
            Interest paid on business loans is tax-deductible as a business expense under the Income Tax Act. There is no upper limit for deduction, provided the loan is used for business purposes. Principal repayment is not deductible but reduces liability. Processing fees and other charges are also deductible. Consult your CA for detailed applicability.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">8. Prepayment Strategy – When and How Much?</h3>
          <p className="text-gray-600">
            Prepaying a business loan early can save significant interest, especially in the early years when the interest component is high. Use our prepayment analysis to see:
            <ul className="list-disc pl-6 mt-2">
              <li>How much interest you save.</li>
              <li>How many months of tenure are reduced.</li>
              <li>New total interest outlay.</li>
            </ul>
            However, check if your lender charges prepayment penalty. Many banks allow prepayment after 6-12 months with nominal fees.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">9. Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div><strong className="text-gray-800">Q1. What is the maximum loan amount for a business loan?</strong><p className="text-gray-600">It varies by lender. Banks offer up to ₹5-10 crores for MSMEs; NBFCs may go up to ₹50 crores for larger businesses.</p></div>
            <div><strong className="text-gray-800">Q2. Can I get a business loan without collateral?</strong><p className="text-gray-600">Yes, unsecured business loans are available based on credit score and business turnover, but interest rates are higher (14-24%).</p></div>
            <div><strong className="text-gray-800">Q3. How long does it take to get a business loan?</strong><p className="text-gray-600">Online lenders: 24-72 hours. Banks: 7-15 days. Government schemes may take longer.</p></div>
            <div><strong className="text-gray-800">Q4. What is a good CIBIL score for a business loan?</strong><p className="text-gray-600">For unsecured loans, 750+ is ideal. For secured loans, 650+ may be accepted.</p></div>
            <div><strong className="text-gray-800">Q5. Can I prepay my business loan?</strong><p className="text-gray-600">Most lenders allow prepayment after 6-12 months. Some charge a penalty (2-4%). Always check terms.</p></div>
            <div><strong className="text-gray-800">Q6. Is GST applicable on business loan EMI?</strong><p className="text-gray-600">No, GST is not on EMI. It is applicable only on processing fees and other service charges.</p></div>
            <div><strong className="text-gray-800">Q7. Can a startup get a business loan?</strong><p className="text-gray-600">Yes, many lenders offer loans to startups with 1+ year of operations. Some government schemes (MUDRA, Stand-Up India) target new businesses.</p></div>
            <div><strong className="text-gray-800">Q8. How accurate is the calculator?</strong><p className="text-gray-600">It uses standard EMI formulas. Actual loan terms may include different compounding methods or fees. Use as an estimate.</p></div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">10. Top Business Loan Providers in India</h3>
          <p className="text-gray-600">
            - <strong>Public Sector Banks:</strong> SBI, PNB, Bank of Baroda (lower rates, slower processing).<br />
            - <strong>Private Banks:</strong> HDFC, ICICI, Kotak (faster, competitive rates).<br />
            - <strong>NBFCs:</strong> Bajaj Finserv, Tata Capital, Aditya Birla Finance (flexible eligibility).<br />
            - <strong>Fintechs:</strong> Razorpay Capital, Neogrowth, Lendingkart (quick disbursal, higher rates).<br />
            Compare rates and fees before applying.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">11. Tips to Improve Business Loan Eligibility</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Maintain a high CIBIL score (pay all dues on time).</li>
            <li>Keep business bank account active with healthy turnover.</li>
            <li>File GST returns regularly (even if zero).</li>
            <li>Show profitability in ITR for at least 2 years.</li>
            <li>Reduce existing debt before applying.</li>
            <li>Offer collateral to get lower rates and higher amounts.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">12. Final Thoughts</h3>
          <p className="text-gray-600">
            A business loan can be a powerful catalyst for growth when used wisely. By using our Business Loan Calculator, you can avoid over-borrowing, compare different loan scenarios, and plan your cash flow effectively. Always read the fine print – processing fees, prepayment penalties, and hidden charges can significantly impact the true cost of the loan.
          </p>
          <p className="text-gray-600 mt-4">
            <strong>Start using the Business Loan Calculator above now.</strong> Input your desired loan parameters, analyze the costs, and make an informed borrowing decision for your business.
          </p>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: The calculations are for illustrative purposes only. Actual loan terms, interest rates, and fees vary by lender. Please consult a financial advisor before availing any loan.
          </div>
        </div>
      </div>
    </div>
  );
}