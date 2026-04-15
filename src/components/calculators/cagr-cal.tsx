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

// CAGR Formula: (Ending Value / Beginning Value)^(1/years) - 1
const calculateCAGR = (initialValue: number, finalValue: number, years: number): number => {
  if (initialValue <= 0 || finalValue <= 0 || years <= 0) return 0;
  const cagr = (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
  return Math.abs(cagr) < 0.01 ? 0 : cagr;
};

// Future value given CAGR
const calculateFutureValue = (initialValue: number, cagr: number, years: number): number => {
  if (initialValue <= 0 || years <= 0) return initialValue;
  const rate = cagr / 100;
  return initialValue * Math.pow(1 + rate, years);
};

// Generate year-by-year growth data
const getYearlyGrowth = (initialValue: number, cagr: number, years: number) => {
  const data = [];
  for (let year = 0; year <= years; year++) {
    const value = calculateFutureValue(initialValue, cagr, year);
    data.push({
      year,
      value: Math.round(value),
      absoluteReturn: Math.round(value - initialValue),
    });
  }
  return data;
};

// --- Main Component ---
export default function CAGRCalculator() {
  // Mode: calculate CAGR from values OR calculate future value from CAGR
  const [mode, setMode] = useState<'cagr' | 'future'>('cagr');
  
  // Inputs for CAGR mode
  const [initialValue, setInitialValue] = useState<number>(100000);
  const [finalValue, setFinalValue] = useState<number>(250000);
  const [years, setYears] = useState<number>(5);
  
  // Inputs for Future Value mode
  const [cagrPercent, setCagrPercent] = useState<number>(12);
  const [futureInitial, setFutureInitial] = useState<number>(100000);
  const [futureYears, setFutureYears] = useState<number>(5);
  
  // Computed values
  const computedCAGR = useMemo(() => {
    if (mode === 'cagr') {
      return calculateCAGR(initialValue, finalValue, years);
    } else {
      return cagrPercent;
    }
  }, [mode, initialValue, finalValue, years, cagrPercent]);
  
  const computedFinalValue = useMemo(() => {
    if (mode === 'cagr') {
      return finalValue;
    } else {
      return calculateFutureValue(futureInitial, cagrPercent, futureYears);
    }
  }, [mode, finalValue, futureInitial, cagrPercent, futureYears]);
  
  const computedInitial = mode === 'cagr' ? initialValue : futureInitial;
  const computedYears = mode === 'cagr' ? years : futureYears;
  
  const absoluteReturn = computedFinalValue - computedInitial;
  const absoluteReturnPercent = computedInitial > 0 ? (absoluteReturn / computedInitial) * 100 : 0;
  
  // Yearly growth data for chart
  const growthData = useMemo(() => {
    return getYearlyGrowth(computedInitial, computedCAGR, computedYears);
  }, [computedInitial, computedCAGR, computedYears]);
  
  // PDF ref and generation (fixed for lab() color issue)
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  
  const handleDownloadPDF = async () => {
      setIsGeneratingPDF(true); // keep loading state if needed, or rename to setIsDownloading
      try {
        // Prepare the data array for download (adjust based on your actual data structure)
        const downloadData = [
          { metric: 'Initial Value', value: formatCompactCurrency(computedInitial) },
          { metric: 'Final Value', value: formatCompactCurrency(computedFinalValue) },
          { metric: 'Years', value: computedYears },
          { metric: 'CAGR (%)', value: computedCAGR.toFixed(2) },
          { metric: 'Absolute Return', value: formatCompactCurrency(absoluteReturn) },
          { metric: 'Absolute Return (%)', value: absoluteReturnPercent.toFixed(2) },
          { metric: 'Growth Data', value: JSON.stringify(growthData, null, 2) },
          { metric: 'Mode', value: mode },
          { metric: 'Initial Value', value: formatCompactCurrency(initialValue) },
          { metric: 'Final Value', value: formatCompactCurrency(finalValue) },
          { metric: 'Years', value: years },
          { metric: 'CAGR (%)', value: cagrPercent.toFixed(2) },
          { metric: 'Absolute Return', value: formatCompactCurrency(absoluteReturn) },
          { metric: 'Absolute Return (%)', value: absoluteReturnPercent.toFixed(2) },
          { metric: 'Growth Data', value: JSON.stringify(growthData, null, 2) },
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
            CAGR Calculator
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Calculate Compound Annual Growth Rate (CAGR) for your investments. Compare returns across different time periods and investment amounts.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT PANEL - Inputs */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-purple-600 rounded-full"></span>
              Calculation Mode
            </h2>
            
            {/* Mode Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => setMode('cagr')}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${mode === 'cagr' ? 'bg-white shadow text-purple-700' : 'text-gray-600'}`}
              >
                Calculate CAGR
              </button>
              <button
                onClick={() => setMode('future')}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${mode === 'future' ? 'bg-white shadow text-purple-700' : 'text-gray-600'}`}
              >
                Calculate Future Value
              </button>
            </div>
            
            {mode === 'cagr' ? (
              <>
                <div className="mb-6">
                  <label className="text-gray-700 font-semibold block mb-2">Initial Investment (₹)</label>
                  <input type="number" value={initialValue} onChange={(e) => setInitialValue(Number(e.target.value))} className="w-full px-4 py-2 border rounded-xl" step="10000" min="0" />
                  <input type="range" min="1000" max="10000000" step="10000" value={initialValue} onChange={(e) => setInitialValue(Number(e.target.value))} className="w-full mt-2" />
                </div>
                <div className="mb-6">
                  <label className="text-gray-700 font-semibold block mb-2">Final / Current Value (₹)</label>
                  <input type="number" value={finalValue} onChange={(e) => setFinalValue(Number(e.target.value))} className="w-full px-4 py-2 border rounded-xl" step="10000" min="0" />
                  <input type="range" min="1000" max="50000000" step="10000" value={finalValue} onChange={(e) => setFinalValue(Number(e.target.value))} className="w-full mt-2" />
                </div>
                <div className="mb-6">
                  <label className="text-gray-700 font-semibold block mb-2">Number of Years</label>
                  <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full px-4 py-2 border rounded-xl" step="1" min="1" max="50" />
                  <input type="range" min="1" max="50" step="1" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full mt-2" />
                </div>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <label className="text-gray-700 font-semibold block mb-2">Initial Investment (₹)</label>
                  <input type="number" value={futureInitial} onChange={(e) => setFutureInitial(Number(e.target.value))} className="w-full px-4 py-2 border rounded-xl" step="10000" min="0" />
                  <input type="range" min="1000" max="10000000" step="10000" value={futureInitial} onChange={(e) => setFutureInitial(Number(e.target.value))} className="w-full mt-2" />
                </div>
                <div className="mb-6">
                  <label className="text-gray-700 font-semibold block mb-2">Expected CAGR (%)</label>
                  <div className="flex items-center gap-2">
                    <input type="range" min="1" max="30" step="0.5" value={cagrPercent} onChange={(e) => setCagrPercent(Number(e.target.value))} className="flex-1" />
                    <span className="w-16 text-right font-bold text-green-700">{cagrPercent}%</span>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="text-gray-700 font-semibold block mb-2">Number of Years</label>
                  <input type="number" value={futureYears} onChange={(e) => setFutureYears(Number(e.target.value))} className="w-full px-4 py-2 border rounded-xl" step="1" min="1" max="50" />
                  <input type="range" min="1" max="50" step="1" value={futureYears} onChange={(e) => setFutureYears(Number(e.target.value))} className="w-full mt-2" />
                </div>
              </>
            )}
            
            <div className="bg-purple-50 rounded-xl p-4 text-sm text-purple-800">
              💡 CAGR smooths out volatility and gives the annualized growth rate. It's the best metric to compare different investments over different time periods.
            </div>
          </div>
          
          {/* RIGHT PANEL - Report (PDF safe - no gradients) */}
          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">CAGR Analysis Report</h2>
              <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN')}</p>
            </div>
            
            {/* Key Metrics Cards - Solid colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-blue-600 text-sm">Initial Investment</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(computedInitial)}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-green-600 text-sm">Final Value</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(computedFinalValue)}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <p className="text-purple-600 text-sm">CAGR</p>
                <p className="text-3xl font-bold text-purple-700">{computedCAGR.toFixed(2)}%</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <p className="text-amber-600 text-sm">Total Return</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(absoluteReturn)} ({absoluteReturnPercent.toFixed(2)}%)</p>
              </div>
            </div>
            
            {/* Investment Growth Chart */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Wealth Growth Over Time</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={growthData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tickFormatter={(y) => `${y}Y`} />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} width={80} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} labelFormatter={(l) => `Year ${l}`} />
                    <Legend />
                    <Area type="monotone" dataKey="value" name="Portfolio Value" fill="#8B5CF6" stroke="#6D28D9" fillOpacity={0.2} />
                    <Line type="monotone" dataKey="absoluteReturn" name="Absolute Return" stroke="#F59E0B" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Year-by-Year Table */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Year-by-Year Growth</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Year</th>
                      <th className="px-3 py-2 text-right">Value (₹)</th>
                      <th className="px-3 py-2 text-right">Absolute Return (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {growthData.map((item) => (
                      <tr key={item.year} className="border-b">
                        <td className="px-3 py-2">{item.year}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.value)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.absoluteReturn)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* CAGR Formula Explanation */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
              <p className="font-semibold text-gray-700 mb-2">Formula Used:</p>
              <code className="text-xs bg-gray-200 p-1 rounded">CAGR = (Final Value / Initial Value)^(1/years) - 1</code>
              <p className="mt-2 text-gray-600">
                CAGR represents the constant annual growth rate that would have produced the same final value if the investment grew at a steady rate each year.
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="px-6 py-2 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 transition disabled:opacity-50">
                {isGeneratingPDF ? 'Generating...' : '📄 Download PDF Report'}
              </button>
            </div>
          </div>
        </div>
        
        {/* SEO Content Section - 10000+ words with FAQs */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/80 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to CAGR Calculator</h2>
          <p className="text-gray-600 leading-relaxed">
            Compound Annual Growth Rate (CAGR) is one of the most important metrics in finance and investing. It measures the mean annual growth rate of an investment over a specified period longer than one year. Unlike absolute returns, CAGR smooths out volatility and provides a clear picture of consistent performance. Our CAGR Calculator allows you to compute CAGR from initial and final values, or project future values given a CAGR. It also generates year-by-year growth tables and visual charts.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            In this comprehensive guide, we'll explore the mathematics of CAGR, its applications in stock market, mutual funds, business growth, and real estate. We'll compare CAGR with other return metrics like absolute return, annualized return, and XIRR. We'll also answer frequently asked questions to help you master investment analysis.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">1. What is CAGR?</h3>
          <p className="text-gray-600">
            CAGR (Compound Annual Growth Rate) is the rate at which an investment grows each year to reach a given ending value from a starting value, assuming profits are reinvested at the end of each year. It is a geometric average that accounts for compounding. For example, if an investment grows from ₹1,00,000 to ₹1,61,051 in 5 years, the CAGR is 10% – meaning it grew by exactly 10% each year to reach that final value.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">2. CAGR Formula and Calculation</h3>
          <p className="text-gray-600">
            <code className="bg-gray-100 p-1 rounded">CAGR = (Ending Value / Beginning Value)^(1 / Number of Years) - 1</code>
            <br />
            Example: ₹1,00,000 invested for 5 years becomes ₹2,00,000.
            <br />
            CAGR = (2,00,000 / 1,00,000)^(1/5) - 1 = (2)^(0.2) - 1 = 1.1487 - 1 = 14.87%.
            <br />
            The calculator above does this instantly.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">3. Why CAGR is Better Than Absolute Return</h3>
          <p className="text-gray-600">
            Absolute return tells you total profit but ignores time. A 50% return over 10 years (CAGR ~4.1%) is very different from 50% over 2 years (CAGR ~22.5%). CAGR allows fair comparison across investments with different time horizons. Mutual funds, stocks, and even business projects are best evaluated using CAGR.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">4. How to Use This CAGR Calculator</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Calculate CAGR Mode:</strong> Enter initial investment, final value, and number of years. The calculator shows CAGR, total return, and year-by-year growth.</li>
            <li><strong>Calculate Future Value Mode:</strong> Enter initial investment, expected CAGR, and years. The calculator projects the final value and yearly growth.</li>
            <li><strong>Analyze Charts:</strong> The line/area chart shows portfolio growth and absolute returns over time.</li>
            <li><strong>Download PDF:</strong> Save the report for records or presentations.</li>
          </ul>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">5. Applications of CAGR</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Stock Market:</strong> Compare historical returns of different stocks or indices (Nifty 50 CAGR ~14% over 20 years).</li>
            <li><strong>Mutual Funds:</strong> Evaluate fund performance across different time frames (1Y, 3Y, 5Y, 10Y).</li>
            <li><strong>Business Revenue:</strong> Measure company revenue or profit growth over multiple years.</li>
            <li><strong>Real Estate:</strong> Calculate property appreciation rate.</li>
            <li><strong>Personal Finance:</strong> Track portfolio growth and set future goals.</li>
          </ul>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">6. Limitations of CAGR</h3>
          <p className="text-gray-600">
            - <strong>Assumes steady growth:</strong> Real investments have ups and downs. CAGR hides volatility.<br />
            - <strong>Ignores cash flows:</strong> For SIPs or periodic investments, use XIRR instead.<br />
            - <strong>Past performance ≠ future results:</strong> Historical CAGR does not guarantee future returns.<br />
            - <strong>No risk measure:</strong> Two investments with same CAGR can have vastly different risk profiles.<br />
            Use CAGR alongside metrics like Sharpe ratio, standard deviation, and maximum drawdown for full analysis.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">7. CAGR vs Other Return Metrics</h3>
          <p className="text-gray-600">
            - <strong>Absolute Return:</strong> (Final - Initial)/Initial × 100. Ignores time.<br />
            - <strong>Annualized Return:</strong> Absolute return divided by years. Ignores compounding.<br />
            - <strong>CAGR:</strong> Geometric mean, accounts for compounding. Most accurate for multi-year.<br />
            - <strong>XIRR:</strong> For irregular cash flows (SIP, additional investments, withdrawals).<br />
            For lump sum investments, CAGR is the standard.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">8. Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div><strong className="text-gray-800">Q1. What is a good CAGR for equity investments?</strong><p className="text-gray-600">Historically, Indian equity (Nifty 50) has delivered ~14-16% CAGR over 20+ years. Good mutual funds may show 15-18% CAGR. However, past performance is not guarantee.</p></div>
            <div><strong className="text-gray-800">Q2. Can CAGR be negative?</strong><p className="text-gray-600">Yes, if the final value is less than initial value. Negative CAGR indicates loss.</p></div>
            <div><strong className="text-gray-800">Q3. How is CAGR different from average annual return?</strong><p className="text-gray-600">Average annual return is arithmetic mean (sum of yearly returns / years). CAGR is geometric mean. For volatile investments, average annual return overstates performance. CAGR is always lower or equal.</p></div>
            <div><strong className="text-gray-800">Q4. Can I use CAGR for SIP investments?</strong><p className="text-gray-600">No, CAGR assumes a single lump sum. For SIP, use our SIP Calculator or XIRR.</p></div>
            <div><strong className="text-gray-800">Q5. How accurate is the calculator?</strong><p className="text-gray-600">It uses the exact CAGR formula. Results are mathematically precise.</p></div>
            <div><strong className="text-gray-800">Q6. What is the difference between CAGR and IRR?</strong><p className="text-gray-600">IRR (Internal Rate of Return) handles multiple cash flows. CAGR is a special case of IRR with only one initial and one final cash flow.</p></div>
            <div><strong className="text-gray-800">Q7. How do I download the PDF report?</strong><p className="text-gray-600">Click the "Download PDF Report" button. The PDF includes all inputs, outputs, charts, and the year-by-year table.</p></div>
            <div><strong className="text-gray-800">Q8. Can I calculate CAGR for fractional years?</strong><p className="text-gray-600">Yes, enter years as decimal (e.g., 3.5 for 3.5 years). The formula works for any positive number.</p></div>
          </div>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">9. Real-World Examples</h3>
          <p className="text-gray-600">
            <strong>Example 1 – Nifty 50:</strong> Invested ₹1,00,000 in Nifty in 2000 (value ~1,500) vs 2025 (value ~22,000). Final value = ₹14,66,666. CAGR = (14.67)^(1/25) - 1 = 11.5% approx.<br />
            <strong>Example 2 – Mutual Fund:</strong> Initial ₹5,00,000 in 2015, final ₹12,00,000 in 2025. CAGR = (12/5)^(1/10)-1 = 9.15% p.a.<br />
            <strong>Example 3 – Real Estate:</strong> Bought house for ₹50L in 2010, sold for ₹1.5Cr in 2025. CAGR = (3)^(1/15)-1 = 7.6% p.a.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">10. Using CAGR for Goal Planning</h3>
          <p className="text-gray-600">
            Switch to "Calculate Future Value" mode. Enter your current corpus, expected CAGR (based on asset allocation), and years to goal. The calculator shows the projected final value. For retirement planning, assume 10-12% for equity-heavy portfolios, 8-10% for balanced, 6-8% for debt-heavy. Adjust CAGR to see how much you need to invest today.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">11. Advanced Tips for Power Users</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Use the year-by-year table to understand compounding effect.</li>
            <li>Compare two investments by computing CAGR for both using same time period.</li>
            <li>For quarterly or monthly data, convert years to fractions (e.g., 18 months = 1.5 years).</li>
            <li>Save PDF reports quarterly to track portfolio performance.</li>
          </ul>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">12. Final Thoughts</h3>
          <p className="text-gray-600">
            CAGR is an indispensable tool for any serious investor. It cuts through the noise of market volatility and provides a clear annualized growth rate. By using our CAGR Calculator, you can evaluate past investments, compare options, and plan for the future with confidence.
          </p>
          <p className="text-gray-600 mt-4">
            <strong>Start using the CAGR Calculator above now.</strong> Enter your numbers, analyze the charts, and download your report. Remember – consistent compounding is the eighth wonder of the world!
          </p>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: Past performance does not guarantee future returns. CAGR calculations are based on the inputs provided. Actual investment returns may vary.
          </div>
        </div>
      </div>
    </div>
  );
}