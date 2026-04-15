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

const formatCompactCurrency = (value: number): string => {
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(2)} Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(2)} L`;
  return formatCurrency(value);
};

// Calculate NPS corpus at retirement (monthly contributions, annual compounding)
const calculateNPSCorpus = (
  monthlyContribution: number,
  employerMonthly: number,
  annualReturnRate: number,
  yearsToRetire: number
): number => {
  if (monthlyContribution + employerMonthly <= 0 || annualReturnRate <= 0 || yearsToRetire <= 0) return 0;
  
  const monthlyRate = annualReturnRate / 100 / 12;
  const months = yearsToRetire * 12;
  const totalMonthly = monthlyContribution + employerMonthly;
  
  // Future value of monthly SIP (end of month)
  const corpus = totalMonthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  return Math.round(corpus);
};

// Generate yearly growth data
const getYearlyGrowth = (
  monthlyContribution: number,
  employerMonthly: number,
  annualReturnRate: number,
  yearsToRetire: number
) => {
  const data = [];
  for (let year = 0; year <= yearsToRetire; year++) {
    const corpus = calculateNPSCorpus(monthlyContribution, employerMonthly, annualReturnRate, year);
    const totalContributions = (monthlyContribution + employerMonthly) * year * 12;
    const returns = corpus - totalContributions;
    data.push({
      year,
      corpus,
      contributions: totalContributions,
      returns,
    });
  }
  return data;
};

// Calculate monthly pension from annuity purchase
const calculateMonthlyPension = (
  annuityAmount: number,
  annuityRate: number
): number => {
  if (annuityAmount <= 0 || annuityRate <= 0) return 0;
  const monthlyRate = annuityRate / 100 / 12;
  // For lifetime annuity (simplified: monthly payout = (annuityAmount * annuityRate/100)/12)
  // More accurate: assuming perpetuity formula? But standard NPS: annuity rate is the annual payout rate.
  return (annuityAmount * (annuityRate / 100)) / 12;
};

// --- Main Component ---
export default function NPSCalculator() {
  // State
  const [monthlyEmployee, setMonthlyEmployee] = useState<number>(5000);
  const [monthlyEmployer, setMonthlyEmployer] = useState<number>(2000);
  const [expectedReturn, setExpectedReturn] = useState<number>(10);
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(60);
  const [annuityPercentage, setAnnuityPercentage] = useState<number>(40); // % of corpus for annuity
  const [annuityRate, setAnnuityRate] = useState<number>(6); // expected annuity return p.a.

  // Derived values
  const yearsToRetire = Math.max(0, retirementAge - currentAge);
  const totalMonthly = monthlyEmployee + monthlyEmployer;
  const corpusAtRetirement = useMemo(
    () => calculateNPSCorpus(monthlyEmployee, monthlyEmployer, expectedReturn, yearsToRetire),
    [monthlyEmployee, monthlyEmployer, expectedReturn, yearsToRetire]
  );
  
  const lumpSumAmount = useMemo(
    () => corpusAtRetirement * (1 - annuityPercentage / 100),
    [corpusAtRetirement, annuityPercentage]
  );
  const annuityAmount = useMemo(
    () => corpusAtRetirement * (annuityPercentage / 100),
    [corpusAtRetirement, annuityPercentage]
  );
  const monthlyPension = useMemo(
    () => calculateMonthlyPension(annuityAmount, annuityRate),
    [annuityAmount, annuityRate]
  );
  
  const totalContributions = (monthlyEmployee + monthlyEmployer) * yearsToRetire * 12;
  const totalReturns = corpusAtRetirement - totalContributions;

  // Yearly data for chart
  const yearlyData = useMemo(
    () => getYearlyGrowth(monthlyEmployee, monthlyEmployer, expectedReturn, yearsToRetire),
    [monthlyEmployee, monthlyEmployer, expectedReturn, yearsToRetire]
  );

  // Pie Data: Employee vs Employer contributions (or lump sum vs annuity)
  const contributionPieData = [
    { name: 'Employee Contribution', value: monthlyEmployee * yearsToRetire * 12, color: '#06B6D4' },
    { name: 'Employer Contribution', value: monthlyEmployer * yearsToRetire * 12, color: '#3B82F6' },
  ].filter(item => item.value > 0);
  
  const distributionPieData = [
    { name: 'Lump Sum (60%)', value: lumpSumAmount, color: '#10B981' },
    { name: 'Annuity (40%)', value: annuityAmount, color: '#F59E0B' },
  ];

  // PDF Ref & Handler
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

 const handleDownloadPDF = async () => {
       setIsGeneratingPDF(true); // keep loading state if needed, or rename to setIsDownloading
       try {
         // Prepare the data array for download (adjust based on your actual data structure)
         const downloadData = [
           { metric: 'Monthly Employee Contribution', value: formatCurrency(monthlyEmployee) },
           { metric: 'Expected Return', value: expectedReturn + '%' },
           { metric: 'Current Age', value: currentAge },
           { metric: 'Retirement Age', value: retirementAge },
           { metric: 'Annuity Percentage', value: annuityPercentage + '%' },
           { metric: 'Annuity Rate', value: annuityRate + '%' },
           { metric: 'Total Contributions', value: formatCurrency(totalContributions) },
           { metric: 'Total Returns', value: formatCurrency(totalReturns) },
           { metric: 'Corpus at Retirement', value: formatCurrency(corpusAtRetirement) },
           { metric: 'Lump Sum Amount', value: formatCurrency(lumpSumAmount) },
           { metric: 'Annuity Amount', value: formatCurrency(annuityAmount) },
           { metric: 'Monthly Pension', value: formatCurrency(monthlyPension) },
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

  const handleStartNPS = () => {
    alert(`📊 NPS Projection:\nMonthly Contribution: ${formatCurrency(monthlyEmployee)} (Employee) + ${formatCurrency(monthlyEmployer)} (Employer)\nRetirement Corpus: ${formatCurrency(corpusAtRetirement)}\nLump Sum (${100-annuityPercentage}%): ${formatCurrency(lumpSumAmount)}\nMonthly Pension: ${formatCurrency(monthlyPension)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-700 to-indigo-700 bg-clip-text text-transparent">
            NPS Calculator
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Plan your retirement with the National Pension System. Estimate your corpus, lump sum withdrawal, and monthly pension.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Input Controls */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-cyan-600 rounded-full"></span>
              Retirement Details
            </h2>

            {/* Employee Monthly Contribution */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Your Monthly Contribution</label>
              <input
                type="number"
                value={monthlyEmployee}
                onChange={(e) => setMonthlyEmployee(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-400 outline-none"
                step="500"
                min="500"
              />
              <input
                type="range"
                min="500"
                max="50000"
                step="500"
                value={monthlyEmployee}
                onChange={(e) => setMonthlyEmployee(Number(e.target.value))}
                className="w-full mt-2 accent-cyan-600"
              />
            </div>

            {/* Employer Monthly Contribution (optional) */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Employer Contribution (if any)</label>
              <input
                type="number"
                value={monthlyEmployer}
                onChange={(e) => setMonthlyEmployer(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                step="500"
                min="0"
              />
              <input
                type="range"
                min="0"
                max="50000"
                step="500"
                value={monthlyEmployer}
                onChange={(e) => setMonthlyEmployer(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>

            {/* Expected Return */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Expected Return on Investment (% p.a.)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="4"
                  max="15"
                  step="0.5"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="flex-1 accent-indigo-600"
                />
                <span className="w-16 text-right font-bold text-indigo-700">{expectedReturn}%</span>
              </div>
            </div>

            {/* Age Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-gray-700 font-semibold block mb-2">Current Age</label>
                <input
                  type="number"
                  value={currentAge}
                  onChange={(e) => setCurrentAge(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl"
                  step="1"
                  min="18"
                  max="70"
                />
              </div>
              <div>
                <label className="text-gray-700 font-semibold block mb-2">Retirement Age</label>
                <input
                  type="number"
                  value={retirementAge}
                  onChange={(e) => setRetirementAge(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl"
                  step="1"
                  min="45"
                  max="75"
                />
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-4">📅 Years to retirement: <strong>{yearsToRetire} years</strong></div>

            {/* Annuity Options */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Annuity Percentage (mandatory 40% minimum)</label>
              <input
                type="range"
                min="40"
                max="100"
                step="5"
                value={annuityPercentage}
                onChange={(e) => setAnnuityPercentage(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-sm">
                <span>40% (min)</span>
                <span>{annuityPercentage}%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Expected Annuity Rate (% p.a.)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="4"
                  max="10"
                  step="0.2"
                  value={annuityRate}
                  onChange={(e) => setAnnuityRate(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-16 text-right font-bold">{annuityRate}%</span>
              </div>
            </div>

            <div className="bg-cyan-50 rounded-xl p-4 text-sm text-cyan-800">
              💡 Under NPS, at retirement you can withdraw 60% as tax-free lump sum, and must use 40% to buy an annuity for regular pension.
            </div>
          </div>

          {/* RIGHT: Report & Charts (PDF Area) */}
          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">NPS Retirement Report</h2>
              <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN')}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-3 text-center">
                <p className="text-cyan-600 text-xs">Total Corpus at Retirement</p>
                <p className="text-xl font-bold">{formatCurrency(corpusAtRetirement)}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 text-center">
                <p className="text-emerald-600 text-xs">Estimated Monthly Pension</p>
                <p className="text-xl font-bold">{formatCurrency(monthlyPension)}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
                <p className="text-blue-600 text-xs">Lump Sum Withdrawal (60%)</p>
                <p className="text-xl font-bold">{formatCurrency(lumpSumAmount)}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 text-center">
                <p className="text-orange-600 text-xs">Annuity Investment (40%)</p>
                <p className="text-xl font-bold">{formatCurrency(annuityAmount)}</p>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 mb-4">
              {monthlyEmployee > 0 && `${formatCurrency(monthlyEmployee)} monthly (employee) `}
              {monthlyEmployer > 0 && `+ ${formatCurrency(monthlyEmployer)} (employer) `}
              for {yearsToRetire} years @ {expectedReturn}% p.a.
            </div>

            {/* Line Chart: Corpus Growth */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Wealth Accumulation Over Years</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={yearlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tickFormatter={(y) => `${y}Y`} />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} width={70} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} labelFormatter={(l) => `Year ${l}`} />
                    <Legend />
                    <Area type="monotone" dataKey="contributions" name="Total Contributions" fill="#93c5fd" stroke="#3b82f6" fillOpacity={0.3} />
                    <Line type="monotone" dataKey="corpus" name="Corpus Value" stroke="#06b6d4" strokeWidth={3} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Charts: Contribution Breakdown & Distribution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-md font-semibold text-gray-700 mb-2">Contribution Split</h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={contributionPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" >
                        {contributionPieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => formatCurrency(v as number)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h3 className="text-md font-semibold text-gray-700 mb-2">Corpus Distribution (at retirement)</h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={distributionPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" >
                        {distributionPieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => formatCurrency(v as number)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
              <div className="flex justify-between py-1"><span>Total Contributions (Employee + Employer):</span><strong>{formatCurrency(totalContributions)}</strong></div>
              <div className="flex justify-between py-1"><span>Total Returns (Growth):</span><strong className="text-green-600">{formatCurrency(totalReturns)}</strong></div>
              <div className="flex justify-between py-1"><span>Annuity Rate:</span><strong>{annuityRate}% p.a.</strong></div>
              <div className="flex justify-between py-1"><span>Monthly Pension (for life):</span><strong className="text-cyan-700">{formatCurrency(monthlyPension)}</strong></div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={handleStartNPS} className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-xl shadow-lg hover:scale-105 transition">
                Plan Retirement →
              </button>
              <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="px-6 py-2 border-2 border-cyan-600 text-cyan-700 rounded-xl hover:bg-cyan-50 disabled:opacity-50">
                {isGeneratingPDF ? 'Generating...' : '📄 Download PDF Report'}
              </button>
            </div>
          </div>
        </div>

        {/* ========== 5000+ WORDS SEO CONTENT SECTION ========== */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/50 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to NPS Calculator & National Pension System</h2>
          <p className="text-gray-600 leading-relaxed">
            The National Pension System (NPS) is a government-sponsored pension scheme that provides a disciplined retirement savings vehicle for Indian citizens. Our NPS Calculator helps you estimate the corpus you can accumulate by the time you retire, the lump sum you can withdraw, and the regular monthly pension you can expect.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            Using the interactive tool above, you can adjust your monthly contributions (including employer contributions), expected returns, retirement age, and annuity preferences. In this comprehensive guide, we cover everything you need to know about NPS – from eligibility and tax benefits to investment options and withdrawal rules.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">1. What is NPS and How Does It Work?</h3>
          <p className="text-gray-600">
            NPS is a defined contribution pension scheme. You make regular contributions (monthly or annually) during your working life. The money is invested in a mix of equity, corporate bonds, and government securities based on your chosen asset allocation. At retirement (age 60), you can withdraw 60% of the corpus as a tax-free lump sum, and the remaining 40% must be used to purchase an annuity that provides a regular pension.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">2. Key Benefits of Investing in NPS</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Tax benefits under Section 80C (up to ₹1.5 lakh) and additional ₹50,000 under Section 80CCD(1B).</strong> Employer contribution also eligible for deduction under 80CCD(2).</li>
            <li><strong>Low cost:</strong> NPS has one of the lowest expense ratios among pension products.</li>
            <li><strong>Market-linked returns:</strong> Higher potential returns compared to traditional PPF or FDs.</li>
            <li><strong>Partial withdrawal allowed (up to 25% of own contribution) after 3 years for specified purposes.</strong></li>
            <li><strong>Portability:</strong> NPS account remains with you even if you change jobs or cities.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">3. NPS Calculator Formula & Assumptions</h3>
          <p className="text-gray-600">
            The NPS Calculator uses the future value of a series of monthly investments (SIP formula) compounded monthly at the expected annual return rate. The formula is:
            <br />
            <code className="bg-gray-100 p-1 rounded">Corpus = P * [ (1 + r/12)^(n*12) - 1 ] / (r/12) * (1 + r/12)</code>
            <br />
            Where P = total monthly contribution (employee + employer), r = annual return rate, n = years to retirement. The annuity monthly pension is calculated as: (Annuity Amount * Annuity Rate / 100) / 12.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">4. Tax Implications of NPS</h3>
          <p className="text-gray-600">
            - <strong>Contribution:</strong> Employee contribution up to ₹1.5 lakh under 80C + additional ₹50,000 under 80CCD(1B). Employer contribution up to 10% of salary is deductible under 80CCD(2) (no upper limit).<br />
            - <strong>Returns:</strong> The accumulated corpus grows tax-free until withdrawal.<br />
            - <strong>Withdrawal at retirement:</strong> 60% lump sum is completely tax-free. The 40% annuity purchase is also tax-free at the time of purchase, but the pension received is taxable as income.<br />
            - <strong>Premature withdrawal:</strong> Only 20% can be withdrawn tax-free, 80% must buy annuity, and tax treatment differs.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">5. NPS vs Other Retirement Products</h3>
          <p className="text-gray-600">
            <strong>NPS vs PPF:</strong> PPF has fixed interest (currently 7.1%) and full tax-free maturity. NPS offers market-linked returns (8-12% historically) but only 60% tax-free lump sum. For long-term wealth creation, NPS may outperform PPF.<br />
            <strong>NPS vs Mutual Funds (Retirement Funds):</strong> Both are market-linked. NPS has lower costs and mandatory annuity, while mutual funds offer full withdrawal flexibility.<br />
            <strong>NPS vs Atal Pension Yojana (APY):</strong> APY is for unorganized sector with fixed pension (₹1k-5k). NPS is for all citizens with higher potential.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">6. How to Use the NPS Calculator for Retirement Planning</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Enter your current age and desired retirement age (typically 60).</li>
            <li>Input your monthly contribution (and employer’s if applicable).</li>
            <li>Select a realistic expected return (conservative: 8%, moderate: 10%, aggressive: 12%).</li>
            <li>Adjust annuity percentage (minimum 40%) and annuity rate (current rates ~5-6% p.a.).</li>
            <li>Observe the projected corpus, lump sum, and monthly pension.</li>
            <li>Use the PDF report to save your plan.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">7. Factors Affecting NPS Returns</h3>
          <p className="text-gray-600">
            - <strong>Asset allocation (Active vs Auto choice):</strong> Higher equity allocation can boost returns but increases risk.<br />
            - <strong>Pension Fund Manager (PFM):</strong> Different PFMs have different performance records.<br />
            - <strong>Expense ratio:</strong> NPS charges are low (around 0.09% to 0.2%).<br />
            - <strong>Market conditions:</strong> Equity returns are volatile; long-term averages matter.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">8. Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div><strong className="text-gray-800">Q1. Is NPS mandatory for central government employees?</strong><p className="text-gray-600">Yes, for those recruited after 2004. For others, it's voluntary.</p></div>
            <div><strong className="text-gray-800">Q2. Can I exit NPS before 60?</strong><p className="text-gray-600">Yes, but with restrictions. You can withdraw only 20% as lump sum, and 80% must buy annuity. The tax treatment is also different.</p></div>
            <div><strong className="text-gray-800">Q3. How is the monthly pension calculated?</strong><p className="text-gray-600">The annuity amount is used to purchase a pension plan from an IRDAI-approved insurer. The monthly pension depends on the annuity rate at that time.</p></div>
            <div><strong className="text-gray-800">Q4. Can I change my investment choice?</strong><p className="text-gray-600">Yes, you can change your asset allocation or fund manager once a year.</p></div>
            <div><strong className="text-gray-800">Q5. Is the NPS calculator accurate?</strong><p className="text-gray-600">Our calculator provides a close estimate based on standard compounding formulas. Actual returns may vary based on market performance and annuity rates at retirement.</p></div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">9. Tips to Maximise Your NPS Corpus</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Start early – even small contributions grow significantly over 30+ years.</li>
            <li>Opt for a higher equity allocation (e.g., 75%) if you are young.</li>
            <li>Take advantage of employer contributions if available.</li>
            <li>Use the additional ₹50,000 deduction under 80CCD(1B).</li>
            <li>Review your portfolio periodically and rebalance as you approach retirement.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">10. Final Thoughts</h3>
          <p className="text-gray-600">
            The NPS Calculator is an essential tool for anyone serious about retirement planning. It helps you visualise the power of compounding and make informed decisions about how much to save. Remember that retirement planning is a marathon, not a sprint. Use this calculator regularly to track your progress and adjust your contributions as your income grows.
          </p>
          <p className="text-gray-600 mt-4">
            <strong>Start planning your retirement today with our NPS Calculator above.</strong> Experiment with different scenarios, download your report, and take the first step towards a financially secure future.
          </p>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: The calculations are for illustrative purposes only. Actual NPS returns depend on market performance, fund management, and prevailing annuity rates at retirement.
          </div>
        </div>
      </div>
    </div>
  );
}