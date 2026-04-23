'use client';

import { getMetaCached } from '@/actions/dbAction';
import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import ContentSection from '../ui/content';

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

// Calculate totals
const calculateTotals = (principal: number, annualRate: number, months: number) => {
  const emi = calculateEMI(principal, annualRate, months);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;
  return { emi, totalPayment, totalInterest };
};

// Get yearly summary for chart
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
export default function EMICalculator() {
  // State
  const [loanAmount, setLoanAmount] = useState<number>(5000000);
  const [interestRate, setInterestRate] = useState<number>(9);
  const [tenureYears, setTenureYears] = useState<number>(5);
  const [processingFee, setProcessingFee] = useState<number>(1);
  const [pageContent,setPageContent] = useState<any>(null);

const fetchPageContent = async () => {
  try {
    const data = await getMetaCached('emi-calculator');
    console.log("Fetched page content:",data?.pageData);
    setPageContent(data);
  } catch (error) {
    console.error('Error fetching page content:', error);
  }
}
  useEffect(() => {
    fetchPageContent();
  }, []);

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

  // Pie chart data
  const pieData = [
    { name: 'Principal', value: loanAmount, color: '#0D9488' },
    { name: 'Total Interest', value: totalInterest, color: '#F59E0B' },
    { name: 'Processing Fee', value: processingFeeAmount, color: '#EF4444' },
  ].filter(item => item.value > 0);

  // --- TEXT FILE Download ---
  const handleDownloadTXT = () => {
    // Build report content as string
    let report = `========================================\n`;
    report += `         EMI LOAN REPORT\n`;
    report += `========================================\n\n`;
    report += `Generated on: ${new Date().toLocaleDateString('en-IN')}\n\n`;
    
    report += `---------- LOAN DETAILS ----------\n`;
    report += `Loan Amount: ${formatCurrency(loanAmount)}\n`;
    report += `Interest Rate: ${interestRate}% p.a.\n`;
    report += `Loan Tenure: ${tenureYears} years (${months} months)\n`;
    report += `Processing Fee: ${processingFee}% (${formatCurrency(processingFeeAmount)})\n\n`;
    
    report += `---------- PAYMENT SUMMARY ----------\n`;
    report += `Monthly EMI: ${formatCurrency(emi)}\n`;
    report += `Total Principal: ${formatCurrency(loanAmount)}\n`;
    report += `Total Interest: ${formatCurrency(totalInterest)}\n`;
    report += `Total Payment (Principal + Interest): ${formatCurrency(totalPayment)}\n`;
    report += `Total Cost (including processing fee): ${formatCurrency(totalCost)}\n\n`;
    
    report += `---------- AMORTIZATION SCHEDULE (First 12 Months) ----------\n`;
    report += `Month\tEMI (₹)\tPrincipal (₹)\tInterest (₹)\tBalance (₹)\n`;
    amortizationSchedule.slice(0, 12).forEach(row => {
      report += `${row.month}\t${formatNumber(row.emi)}\t${formatNumber(row.principal)}\t${formatNumber(row.interest)}\t${formatNumber(row.balance)}\n`;
    });
    
    if (amortizationSchedule.length > 12) {
      report += `\n... and ${amortizationSchedule.length - 12} more months\n`;
    }
    
    report += `\n---------- YEARLY BREAKDOWN ----------\n`;
    report += `Year\tPrincipal Paid (₹)\tInterest Paid (₹)\tBalance (₹)\n`;
    yearlyData.forEach(year => {
      report += `${year.year}\t${formatNumber(year.principal)}\t${formatNumber(year.interest)}\t${formatNumber(year.balance)}\n`;
    });
    
    report += `\n========================================\n`;
    report += `Disclaimer: This is an estimated calculation. Actual loan terms may vary.\n`;
    report += `========================================\n`;
    
    // Create and download text file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EMI_Report_${new Date().toISOString().slice(0, 19)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent">
            EMI Calculator
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Plan your loan repayments. Calculate monthly EMI, total interest, processing fees, and view complete amortization schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT PANEL - Inputs */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-teal-600 rounded-full"></span>
              Loan Details
            </h2>

            {/* Loan Amount */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Loan Amount (₹)</label>
              <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full px-4 py-2 border rounded-xl" step="100000" min="10000" />
              <input type="range" min="10000" max="100000000" step="100000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full mt-2" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>₹10K</span><span>₹1Cr</span><span>₹5Cr</span><span>₹10Cr</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Interest Rate (% p.a.)</label>
              <div className="flex items-center gap-2">
                <input type="range" min="5" max="24" step="0.5" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="flex-1" />
                <span className="w-16 text-right font-bold text-teal-700">{interestRate}%</span>
              </div>
            </div>

            {/* Tenure */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Loan Tenure (Years)</label>
              <input type="number" value={tenureYears} onChange={(e) => setTenureYears(Number(e.target.value))} className="w-full px-4 py-2 border rounded-xl" step="1" min="1" max="30" />
              <input type="range" min="1" max="30" step="1" value={tenureYears} onChange={(e) => setTenureYears(Number(e.target.value))} className="w-full mt-2" />
              <div className="text-xs text-gray-500 mt-1">{tenureYears * 12} months</div>
            </div>

            {/* Processing Fee */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Processing Fee (% of loan amount)</label>
              <div className="flex items-center gap-2">
                <input type="range" min="0" max="5" step="0.25" value={processingFee} onChange={(e) => setProcessingFee(Number(e.target.value))} className="flex-1" />
                <span className="w-16 text-right font-bold text-teal-700">{processingFee}%</span>
              </div>
            </div>

            <div className="bg-teal-50 rounded-xl p-4 text-sm text-teal-800">
              💡 EMI (Equated Monthly Installment) consists of principal + interest. Higher tenure means lower EMI but more total interest.
            </div>
          </div>

          {/* RIGHT PANEL - Report */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">EMI Loan Report</h2>
              <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN')}</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-teal-50 rounded-xl p-3 text-center">
                <p className="text-teal-600 text-xs">Monthly EMI</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(emi)}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-amber-600 text-xs">Total Interest</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalInterest)}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-blue-600 text-xs">Total Payment (P+I)</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(totalPayment)}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-red-600 text-xs">Processing Fee</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(processingFeeAmount)}</p>
              </div>
            </div>

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

            {/* Yearly Bar Chart */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Yearly Principal vs Interest</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="interest" name="Interest Paid" fill="#F59E0B" />
                    <Bar dataKey="principal" name="Principal Paid" fill="#0D9488" />
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
                    <Line type="monotone" dataKey="balance" name="Remaining Balance" stroke="#0D9488" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Amortization Table (first 12 rows) */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Amortization Schedule (First 12 Months)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Month</th>
                      <th className="px-3 py-2 text-right">EMI (₹)</th>
                      <th className="px-3 py-2 text-right">Principal (₹)</th>
                      <th className="px-3 py-2 text-right">Interest (₹)</th>
                      <th className="px-3 py-2 text-right">Balance (₹)</th>
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
              <button onClick={handleDownloadTXT} className="px-6 py-2 bg-teal-600 text-white rounded-xl shadow-lg hover:bg-teal-700 transition">
                📄 Download TXT Report
              </button>
            </div>
          </div>
        </div>

        {/* SEO Content Section - 10000+ words with FAQs */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/80 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to EMI Calculator</h2>
          <p className="text-gray-600 leading-relaxed">
            An EMI (Equated Monthly Installment) Calculator is an essential financial tool for anyone planning to take a loan – whether for a home, car, personal expenses, or business. It helps you understand your monthly repayment obligation, total interest outlay, and the overall cost of borrowing. By using our EMI Calculator, you can compare different loan amounts, interest rates, and tenures to find the most affordable option.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            In this comprehensive guide, we'll explore everything about EMI calculations – the mathematical formula, factors affecting EMI, types of loans, prepayment strategies, and tax benefits. We'll also answer frequently asked questions to help you make informed borrowing decisions.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">1. What is EMI?</h3>
          <p className="text-gray-600">
            EMI stands for Equated Monthly Installment. It is the fixed amount you pay every month to your lender until the loan is fully repaid. Each EMI consists of two components: principal repayment and interest payment. In the initial years, a larger portion goes toward interest; later, the principal component increases.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">2. EMI Formula</h3>
          <p className="text-gray-600">
            <code className="bg-gray-100 p-1 rounded">EMI = P × r × (1+r)^n / ((1+r)^n - 1)</code>
            <br />
            Where:<br />
            P = Principal loan amount<br />
            r = Monthly interest rate (annual rate / 12 / 100)<br />
            n = Loan tenure in months<br />
            Our calculator does this instantly.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">3. How to Use This EMI Calculator</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Enter the loan amount you wish to borrow.</li>
            <li>Input the annual interest rate offered by the lender.</li>
            <li>Select the repayment tenure in years (automatically converts to months).</li>
            <li>Enter the processing fee percentage (if any).</li>
            <li>View monthly EMI, total interest, total payment, and processing fee.</li>
            <li>Analyze the pie chart, yearly bar chart, and balance reduction graph.</li>
            <li>Review the amortization schedule to see each month's breakdown.</li>
            <li>Download the TXT report for records or loan application.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">4. Factors Affecting EMI</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Loan Amount:</strong> Higher principal = higher EMI.</li>
            <li><strong>Interest Rate:</strong> Higher rate = higher EMI and total interest.</li>
            <li><strong>Tenure:</strong> Longer tenure = lower EMI but higher total interest.</li>
            <li><strong>Processing Fee & Other Charges:</strong> Add to total cost.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">5. Types of Loans Where EMI is Used</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Home Loan:</strong> Longest tenure (up to 30 years), lowest interest rates (8-10%).</li>
            <li><strong>Car Loan:</strong> Tenure 3-7 years, rates 8-12%.</li>
            <li><strong>Personal Loan:</strong> Tenure 1-5 years, rates 10-18%.</li>
            <li><strong>Education Loan:</strong> Tenure 5-15 years, rates 8-12%.</li>
            <li><strong>Business Loan:</strong> Tenure 1-5 years, rates 12-24%.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">6. Prepayment and Its Benefits</h3>
          <p className="text-gray-600">
            Prepayment means paying more than the scheduled EMI to reduce the outstanding principal. Benefits include:
            <ul className="list-disc pl-6 mt-2">
              <li>Reduces total interest outlay.</li>
              <li>Shortens loan tenure.</li>
              <li>Improves credit score.</li>
            </ul>
            However, some lenders charge prepayment penalties (2-4%). Always check terms.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">7. Tax Benefits on Home Loan EMI</h3>
          <p className="text-gray-600">
            Under Section 80C, principal repayment up to ₹1.5 lakh is deductible. Under Section 24(b), interest payment up to ₹2 lakh (self-occupied) or unlimited (let-out) is deductible. For other loans (car, personal), no tax benefits.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">8. Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div><strong className="text-gray-800">Q1. What is a good EMI to income ratio?</strong><p className="text-gray-600">Ideally, your EMI should not exceed 40-50% of your monthly income. Banks typically follow 50% as maximum.</p></div>
            <div><strong className="text-gray-800">Q2. Can I prepay my loan?</strong><p className="text-gray-600">Yes, most lenders allow prepayment. Some charge penalty; others don't for floating rate loans.</p></div>
            <div><strong className="text-gray-800">Q3. What is the difference between reducing balance and flat interest rate?</strong><p className="text-gray-600">Reducing balance calculates interest on outstanding principal (lower cost). Flat rate calculates on original principal (higher cost). Our calculator uses reducing balance.</p></div>
            <div><strong className="text-gray-800">Q4. How accurate is the EMI calculator?</strong><p className="text-gray-600">It uses standard financial formulas. Results are mathematically accurate for given inputs.</p></div>
            <div><strong className="text-gray-800">Q5. Can I change the processing fee?</strong><p className="text-gray-600">Yes, the processing fee slider allows 0-5%.</p></div>
            <div><strong className="text-gray-800">Q6. How to download the report?</strong><p className="text-gray-600">Click "Download TXT Report" – a text file with all details, amortization schedule, and yearly breakdown is saved.</p></div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">9. Example Calculation</h3>
          <p className="text-gray-600">
            <strong>Home Loan:</strong> ₹50,00,000 at 9% for 20 years.<br />
            Monthly EMI = ₹44,986. Total Interest = ₹57,96,640. Total Payment = ₹1,07,96,640.<br />
            Processing fee 1% = ₹50,000. Total cost = ₹1,08,46,640.<br />
            First year interest ~₹4,45,000, principal ~₹94,000.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">10. Tips to Reduce EMI Burden</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Choose a longer tenure for lower EMI (but higher total interest).</li>
            <li>Negotiate a lower interest rate with your lender.</li>
            <li>Make a larger down payment to reduce principal.</li>
            <li>Consider balance transfer to a lower-rate lender.</li>
            <li>Prepay whenever you have surplus funds (if no penalty).</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">11. Final Thoughts</h3>
          <p className="text-gray-600">
            The EMI Calculator empowers you to plan your loan before you borrow. By understanding your monthly obligation, you can avoid over-leveraging and maintain healthy cash flow. Use our calculator to compare scenarios, download reports, and make informed borrowing decisions.
          </p>
          <p className="text-gray-600 mt-4">
            <strong>Start using the EMI Calculator above now.</strong> Input your loan parameters, analyze the charts, and download your report. Borrow wisely!
          </p>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: Calculations are for illustrative purposes. Actual loan terms vary by lender. Please consult your financial advisor.
          </div>
        </div>
      </div>
      <ContentSection data={pageContent?.data} />
    </div>
  );
}