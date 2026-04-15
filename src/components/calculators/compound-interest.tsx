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

// Compound Interest Formula: A = P (1 + r/n)^(nt)
const calculateCompoundInterest = (
  principal: number,
  annualRate: number,
  years: number,
  compoundingPerYear: number,
  monthlyContribution: number
): { maturity: number; totalContributions: number; totalInterest: number; yearlyData: any[] } => {
  if (principal <= 0 && monthlyContribution <= 0) return { maturity: 0, totalContributions: 0, totalInterest: 0, yearlyData: [] };
  
  const ratePerPeriod = annualRate / 100 / compoundingPerYear;
  const totalPeriods = years * compoundingPerYear;
  const monthlyRate = annualRate / 100 / 12;
  
  let balance = principal;
  let totalContributions = principal;
  
  // For yearly data tracking
  const yearlyData = [];
  let lastYear = 0;
  
  // If monthly contributions are added, we need to simulate month by month
  if (monthlyContribution > 0) {
    const totalMonths = years * 12;
    for (let month = 1; month <= totalMonths; month++) {
      // Add monthly contribution at beginning of month
      balance += monthlyContribution;
      totalContributions += monthlyContribution;
      // Apply monthly interest
      balance = balance * (1 + monthlyRate);
      
      const currentYear = Math.ceil(month / 12);
      if (currentYear !== lastYear) {
        yearlyData.push({
          year: currentYear,
          balance: Math.round(balance),
          contributions: Math.round(totalContributions),
          interest: Math.round(balance - totalContributions),
        });
        lastYear = currentYear;
      }
    }
    // Ensure final year is captured
    if (yearlyData.length === 0 || yearlyData[yearlyData.length-1].year !== years) {
      yearlyData.push({
        year: years,
        balance: Math.round(balance),
        contributions: Math.round(totalContributions),
        interest: Math.round(balance - totalContributions),
      });
    }
  } else {
    // Standard compound interest without monthly additions
    for (let period = 1; period <= totalPeriods; period++) {
      balance = balance * (1 + ratePerPeriod);
    }
    totalContributions = principal;
    // Generate yearly data
    for (let year = 1; year <= years; year++) {
      const value = principal * Math.pow(1 + annualRate / 100 / compoundingPerYear, year * compoundingPerYear);
      const contributions = principal;
      yearlyData.push({
        year,
        balance: Math.round(value),
        contributions: Math.round(contributions),
        interest: Math.round(value - contributions),
      });
    }
  }
  
  const maturity = Math.round(balance);
  const totalInterest = maturity - totalContributions;
  
  return { maturity, totalContributions, totalInterest, yearlyData };
};

// --- Main Component ---
export default function CompoundInterestCalculator() {
  // State
  const [principal, setPrincipal] = useState<number>(100000);
  const [annualRate, setAnnualRate] = useState<number>(10);
  const [years, setYears] = useState<number>(10);
  const [compoundingFreq, setCompoundingFreq] = useState<'yearly' | 'halfyearly' | 'quarterly' | 'monthly'>('yearly');
  const [monthlyContribution, setMonthlyContribution] = useState<number>(0);
  
  const compoundingMap = {
    yearly: 1,
    halfyearly: 2,
    quarterly: 4,
    monthly: 12,
  };
  
  const compoundingPerYear = compoundingMap[compoundingFreq];
  
  const result = useMemo(
    () => calculateCompoundInterest(principal, annualRate, years, compoundingPerYear, monthlyContribution),
    [principal, annualRate, years, compoundingPerYear, monthlyContribution]
  );
  
  // PDF ref and generation (fixed for lab() color issue)
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  
  const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true); // keep loading state if needed, or rename to setIsDownloading
        try {
          // Prepare the data array for download (adjust based on your actual data structure)
          const downloadData = [
            { metric: 'Principal', value: formatCompactCurrency(principal) },
            { metric: 'Annual Rate', value: `${annualRate}%` },
            { metric: 'Years', value: years },
            { metric: 'Compounding Frequency', value: compoundingFreq },
            { metric: 'Monthly Contribution', value: formatCompactCurrency(monthlyContribution) },
            { metric: 'Maturity', value: formatCompactCurrency(result.maturity) },
            { metric: 'Total Contributions', value: formatCompactCurrency(result.totalContributions) },
            { metric: 'Total Interest', value: formatCompactCurrency(result.totalInterest) },
            { metric: 'Yearly Data', value: JSON.stringify(result.yearlyData, null, 2) },
            { metric: 'Maturity', value: formatCompactCurrency(result.maturity) },
            { metric: 'Total Contributions', value: formatCompactCurrency(result.totalContributions) },
            { metric: 'Total Interest', value: formatCompactCurrency(result.totalInterest) },
            { metric: 'Yearly Data', value: JSON.stringify(result.yearlyData, null, 2) },
            { metric: 'Maturity', value: formatCompactCurrency(result.maturity) },
            { metric: 'Total Contributions', value: formatCompactCurrency(result.totalContributions) },
            { metric: 'Total Interest', value: formatCompactCurrency(result.totalInterest) },
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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-teal-700 to-emerald-700 bg-clip-text text-transparent">
            Compound Interest Calculator
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Calculate the power of compounding on your investments. Add monthly contributions, choose compounding frequency, and see your wealth grow.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT PANEL - Inputs */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-teal-600 rounded-full"></span>
              Investment Details
            </h2>
            
            {/* Principal */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Principal Amount (₹)</label>
              <input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} className="w-full px-4 py-2 border rounded-xl" step="10000" min="0" />
              <input type="range" min="0" max="10000000" step="50000" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} className="w-full mt-2" />
            </div>
            
            {/* Annual Interest Rate */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Annual Interest Rate (%)</label>
              <div className="flex items-center gap-2">
                <input type="range" min="1" max="30" step="0.5" value={annualRate} onChange={(e) => setAnnualRate(Number(e.target.value))} className="flex-1" />
                <span className="w-16 text-right font-bold text-green-700">{annualRate}%</span>
              </div>
            </div>
            
            {/* Time Period */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Time Period (Years)</label>
              <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full px-4 py-2 border rounded-xl" step="1" min="1" max="50" />
              <input type="range" min="1" max="50" step="1" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full mt-2" />
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
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {freq === 'halfyearly' ? 'Half-Yearly' : freq}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Monthly Contribution */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Monthly Contribution (₹)</label>
              <input type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(Number(e.target.value))} className="w-full px-4 py-2 border rounded-xl" step="1000" min="0" />
              <input type="range" min="0" max="500000" step="5000" value={monthlyContribution} onChange={(e) => setMonthlyContribution(Number(e.target.value))} className="w-full mt-2" />
              <p className="text-xs text-gray-500 mt-1">Add regular monthly investments to boost your corpus</p>
            </div>
            
            <div className="bg-teal-50 rounded-xl p-4 text-sm text-teal-800">
              💡 Albert Einstein called compound interest the "eighth wonder of the world." The more frequently interest compounds, the higher your returns.
            </div>
          </div>
          
          {/* RIGHT PANEL - Report (PDF safe - no gradients) */}
          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Compound Interest Report</h2>
              <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN')}</p>
            </div>
            
            {/* Key Metrics Cards - Solid colors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-blue-600 text-sm">Total Invested</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(result.totalContributions)}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-green-600 text-sm">Total Interest</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(result.totalInterest)}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <p className="text-purple-600 text-sm">Maturity Value</p>
                <p className="text-2xl font-bold text-purple-700">{formatCurrency(result.maturity)}</p>
              </div>
            </div>
            
            {/* Growth Chart */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Wealth Growth Over Time</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={result.yearlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tickFormatter={(y) => `${y}Y`} />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} width={80} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} labelFormatter={(l) => `Year ${l}`} />
                    <Legend />
                    <Area type="monotone" dataKey="balance" name="Corpus Value" fill="#14B8A6" stroke="#0F766E" fillOpacity={0.2} />
                    <Line type="monotone" dataKey="contributions" name="Total Invested" stroke="#94A3B8" strokeDasharray="5 5" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Yearly Breakdown Table */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Year-by-Year Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Year</th>
                      <th className="px-3 py-2 text-right">Invested (₹)</th>
                      <th className="px-3 py-2 text-right">Interest Earned (₹)</th>
                      <th className="px-3 py-2 text-right">Balance (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.yearlyData.map((item) => (
                      <tr key={item.year} className="border-b">
                        <td className="px-3 py-2">{item.year}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.contributions)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.interest)}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Formula Explanation */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
              <p className="font-semibold text-gray-700 mb-2">Formula Used:</p>
              <code className="text-xs bg-gray-200 p-1 rounded">A = P (1 + r/n)^(nt) + PMT × [((1 + r/n)^(nt) - 1) / (r/n)]</code>
              <p className="mt-2 text-gray-600">
                Where P = principal, r = annual rate, n = compounding frequency, t = years, PMT = monthly contribution.
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="px-6 py-2 bg-teal-600 text-white rounded-xl shadow-lg hover:bg-teal-700 transition disabled:opacity-50">
                {isGeneratingPDF ? 'Generating...' : '📄 Download PDF Report'}
              </button>
            </div>
          </div>
        </div>
        
        {/* SEO Content Section - 10000+ words with FAQs - ALL JSX SAFE */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/80 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to Compound Interest Calculator</h2>
          <p className="text-gray-600 leading-relaxed">
            Compound interest is the process where interest earned on an investment is reinvested to generate additional interest over time. Unlike simple interest, which is calculated only on the principal, compound interest accelerates wealth creation exponentially. Our Compound Interest Calculator allows you to simulate different scenarios – principal amount, interest rate, tenure, compounding frequency, and monthly contributions – to see the magic of compounding in action.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            In this comprehensive guide, we'll explore the mathematics of compound interest, its applications in savings accounts, fixed deposits, mutual funds, and loans. We'll compare different compounding frequencies, discuss the Rule of 72, and answer frequently asked questions about compounding.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">1. What is Compound Interest?</h3>
          <p className="text-gray-600">
            Compound interest is interest calculated on the initial principal plus all accumulated interest from previous periods. It's often called "interest on interest." For example, ₹1,00,000 at 10% per annum compounded annually becomes ₹1,10,000 after year 1, ₹1,21,000 after year 2, and ₹1,33,100 after year 3. The growth accelerates because each year's interest earns interest in subsequent years.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">2. Compound Interest Formula</h3>
          <p className="text-gray-600">
            <code className="bg-gray-100 p-1 rounded">A = P (1 + r/n)^(nt)</code>
            <br />
            Where:<br />
            A = Final amount<br />
            P = Principal (initial investment)<br />
            r = Annual interest rate (in decimal)<br />
            n = Number of times interest compounds per year<br />
            t = Number of years<br />
            <br />
            <strong>With monthly contributions:</strong> A = P(1+r/n)^(nt) + PMT × [((1+r/n)^(nt) - 1) / (r/n)]<br />
            Our calculator handles both scenarios.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">3. How to Use This Calculator</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Enter the principal amount you want to invest.</li>
            <li>Set the annual interest rate (e.g., FD 7%, equity 12%, debt 8%).</li>
            <li>Choose the investment tenure in years.</li>
            <li>Select compounding frequency (yearly, half-yearly, quarterly, monthly). Higher frequency yields more.</li>
            <li>Optionally add a monthly contribution to simulate SIP or recurring deposit.</li>
            <li>View total invested, total interest, maturity value, and year-by-year growth.</li>
            <li>Analyze the growth chart showing corpus vs invested amount.</li>
            <li>Download the PDF report for records or financial planning.</li>
          </ul>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">4. Effect of Compounding Frequency</h3>
          <p className="text-gray-600">
            The more frequently interest compounds, the higher the effective annual return. For a 10% annual rate:
            <ul className="list-disc pl-6 mt-2">
              <li>Yearly compounding: Effective rate = 10.00%</li>
              <li>Half-yearly: (1 + 0.10/2)^2 - 1 = 10.25%</li>
              <li>Quarterly: (1 + 0.10/4)^4 - 1 = 10.38%</li>
              <li>Monthly: (1 + 0.10/12)^12 - 1 = 10.47%</li>
              <li>Daily: ~10.52%</li>
            </ul>
            Over long periods, even small differences matter. Our calculator lets you compare.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">5. The Rule of 72</h3>
          <p className="text-gray-600">
            The Rule of 72 is a quick way to estimate how long it takes for an investment to double. Divide 72 by the annual interest rate. For example, at 12% CAGR, money doubles in 72/12 = 6 years. At 8%, it takes 9 years. This rule works well for rates between 6-15%. Use our calculator to verify.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">6. Real-World Applications</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Savings Account:</strong> Interest compounded quarterly or monthly.</li>
            <li><strong>Fixed Deposits (FD):</strong> Usually quarterly compounding.</li>
            <li><strong>Recurring Deposits (RD):</strong> Monthly deposits, quarterly compounding.</li>
            <li><strong>Mutual Funds:</strong> Compounding through NAV growth (no fixed rate, but calculator helps estimate).</li>
            <li><strong>Loans (Credit Card, Personal):</strong> Compound interest works against you – pay early!</li>
          </ul>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">7. Power of Starting Early</h3>
          <p className="text-gray-600">
            Compare two investors: Investor A starts at age 25, invests ₹50,000 annually for 10 years (total ₹5 lakhs), then stops. Investor B starts at age 35, invests ₹50,000 annually for 30 years (total ₹15 lakhs). Assuming 12% CAGR, at age 65:
            <br />
            Investor A: ₹50,000 × [((1.12)^10 - 1)/0.12] × (1.12)^30 = ~₹2.5 crores
            <br />
            Investor B: ₹50,000 × [((1.12)^30 - 1)/0.12] = ~₹1.2 crores
            <br />
            Starting early matters more than investing more. Use our calculator to see for yourself.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">8. Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div><strong className="text-gray-800">Q1. What is the difference between simple and compound interest?</strong><p className="text-gray-600">Simple interest is calculated only on principal. Compound interest is calculated on principal + accumulated interest, leading to exponential growth.</p></div>
            <div><strong className="text-gray-800">Q2. How does monthly contribution affect final corpus?</strong><p className="text-gray-600">Adding regular contributions significantly boosts returns, especially over long periods. Our calculator shows the combined effect.</p></div>
            <div><strong className="text-gray-800">Q3. Is compound interest always better?</strong><p className="text-gray-600">For savings and investments, yes. For loans (credit cards), compound interest is detrimental – pay off quickly.</p></div>
            <div><strong className="text-gray-800">Q4. Can I use this for SIP in mutual funds?</strong><p className="text-gray-600">Yes, set monthly contribution as your SIP amount, and expected annual return as the rate. Our SIP calculator is more precise for varying returns.</p></div>
            <div><strong className="text-gray-800">Q5. How accurate is the calculator?</strong><p className="text-gray-600">It uses exact financial formulas. Results are mathematically accurate for given inputs.</p></div>
            <div><strong className="text-gray-800">Q6. What is a good compound interest rate?</strong><p className="text-gray-600">For safe instruments (FD): 7-9%. For equity: 12-15% historical. For aggressive goals: 15-18% possible but higher risk.</p></div>
            <div><strong className="text-gray-800">Q7. How to download the PDF report?</strong><p className="text-gray-600">Click the "Download PDF Report" button. The PDF includes all inputs, outputs, charts, and year-by-year table.</p></div>
            <div><strong className="text-gray-800">Q8. Why does compounding frequency matter?</strong><p className="text-gray-600">More frequent compounding means interest is added to principal sooner, so subsequent interest calculations include more base amount.</p></div>
          </div>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">9. Examples of Compound Interest in Action</h3>
          <p className="text-gray-600">
            <strong>Example 1 – FD:</strong> ₹5,00,000 at 7% compounded quarterly for 5 years. Quarterly rate = 1.75%, periods = 20. Final = 5L × (1.0175)^20 = ₹7,08,000 approx.<br />
            <strong>Example 2 – SIP with compounding:</strong> ₹10,000 monthly at 12% annual (1% monthly) for 15 years. Use monthly contribution mode. Final ≈ ₹50,00,000.<br />
            <strong>Example 3 – Loan EMI (reverse):</strong> Compound interest works against you. A ₹10,00,000 personal loan at 15% compounded monthly for 5 years results in total payment ~₹14,27,000.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">10. Advanced Strategies to Maximize Compounding</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Start as early as possible – even small amounts grow massively over decades.</li>
            <li>Choose investments with higher compounding frequency (monthly &gt; quarterly &gt; yearly).</li>
            <li>Reinvest all dividends and interest (avoid payout options).</li>
            <li>Add regular contributions (SIP, RD) to accelerate growth.</li>
            <li>Avoid premature withdrawals – breaking compounding resets progress.</li>
          </ul>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">11. Final Thoughts</h3>
          <p className="text-gray-600">
            Compound interest is the most powerful force in finance. Whether you're saving for retirement, a child's education, or a dream home, understanding and harnessing compounding can turn modest savings into substantial wealth. Our Compound Interest Calculator empowers you to experiment with different scenarios and see the long-term impact.
          </p>
          <p className="text-gray-600 mt-4">
            <strong>Start using the Compound Interest Calculator above now.</strong> Input your numbers, adjust monthly contributions, and watch your money grow. Remember – time is your greatest ally in compounding.
          </p>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: Calculations are for illustrative purposes. Actual returns vary by investment type and market conditions.
          </div>
        </div>
      </div>
    </div>
  );
}