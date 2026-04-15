'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
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

// SIP Maturity Value Formula: M = P * ((1 + r)^n - 1) / r * (1 + r)
// where P = monthly investment, r = monthly rate, n = total months
const calculateSIPMaturity = (
  monthlyInvestment: number,
  annualReturnPercent: number,
  years: number
): number => {
  if (monthlyInvestment <= 0 || annualReturnPercent <= 0 || years <= 0) return 0;
  const monthlyRate = annualReturnPercent / 100 / 12;
  const months = years * 12;
  const maturity =
    monthlyInvestment *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate);
  return Math.round(maturity);
};

// Generate year-wise data for line chart
const getYearlyGrowthData = (
  monthlyInvestment: number,
  annualReturnPercent: number,
  years: number
) => {
  const data = [];
  for (let year = 0; year <= years; year++) {
    const value = calculateSIPMaturity(monthlyInvestment, annualReturnPercent, year);
    data.push({
      year,
      value,
      displayYear: `${year}${year === 0 ? ' (Start)' : 'Y'}`,
    });
  }
  return data;
};

// --- Main Component ---
export default function SIPCalculator() {
  // State for inputs
  const [monthlySIP, setMonthlySIP] = useState<number>(5000);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [timePeriod, setTimePeriod] = useState<number>(10);

  // Ref for PDF capture (target only the report section)
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  // Derived calculations
  const maturityValue = useMemo(
    () => calculateSIPMaturity(monthlySIP, expectedReturn, timePeriod),
    [monthlySIP, expectedReturn, timePeriod]
  );
  const totalInvestment = monthlySIP * timePeriod * 12;
  const totalReturns = maturityValue - totalInvestment;

  // Data for Pie Chart (Investment vs Returns)
  const pieData = useMemo(
    () => [
      { name: 'Total Investment', value: totalInvestment, color: '#3B82F6' },
      { name: 'Total Returns', value: totalReturns, color: '#10B981' },
    ],
    [totalInvestment, totalReturns]
  );

  // Data for Line Chart (Yearly Growth)
  const lineData = useMemo(
    () => getYearlyGrowthData(monthlySIP, expectedReturn, timePeriod),
    [monthlySIP, expectedReturn, timePeriod]
  );

  // Format large numbers for display
  const formattedMaturity = formatCurrency(maturityValue);
  const formattedInvestment = formatCurrency(totalInvestment);
  const formattedReturns = formatCurrency(totalReturns);

  // PDF Download Handler
  const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true); // keep loading state if needed, or rename to setIsDownloading
        try {
          // Prepare the data array for download (adjust based on your actual data structure)
          const downloadData = [
            { metric: 'Monthly SIP', value: formatCurrency(monthlySIP) },
            { metric: 'Expected Return', value: expectedReturn + '%' },
            { metric: 'Time Period', value: timePeriod + ' years' },
            { metric: 'Maturity Value', value: formatCurrency(maturityValue) },
            { metric: 'Total Investment', value: formatCurrency(totalInvestment) },
            { metric: 'Total Returns', value: formatCurrency(totalReturns) },

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

  // Handle Invest Now click
  const handleInvestNow = () => {
    alert(
      `🚀 Invest ₹${monthlySIP.toLocaleString()} monthly for ${timePeriod} years at ${expectedReturn}% p.a.\nEstimated maturity: ${formattedMaturity}\nStart your SIP journey today!`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
            SIP Calculator
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Plan your wealth creation journey with systematic investments. Estimate
            how your monthly SIP can grow over time with projected returns.
          </p>
        </div>

        {/* Two Column Layout: Controls (Left) | Report & Charts (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT PANEL: Input Controls */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 transition-all hover:shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-indigo-600 rounded-full"></span>
              Investment Details
            </h2>

            {/* Monthly SIP Amount */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="text-gray-700 font-semibold">Monthly SIP Amount</label>
                <span className="text-indigo-700 font-bold text-lg">
                  {formatCurrency(monthlySIP)}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="200000"
                step="500"
                value={monthlySIP}
                onChange={(e) => setMonthlySIP(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>₹500</span>
                <span>₹50K</span>
                <span>₹1L</span>
                <span>₹2L</span>
              </div>
              <div className="mt-3">
                <input
                  type="number"
                  value={monthlySIP}
                  onChange={(e) => setMonthlySIP(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
                  step="500"
                  min="500"
                />
              </div>
            </div>

            {/* Expected Return Rate */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="text-gray-700 font-semibold">Expected Return Rate (p.a.)</label>
                <span className="text-green-600 font-bold text-lg">{expectedReturn}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="0.5"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1%</span>
                <span>8%</span>
                <span>15%</span>
                <span>30%</span>
              </div>
              <div className="mt-3">
                <input
                  type="number"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
                  step="0.5"
                  min="1"
                  max="30"
                />
              </div>
            </div>

            {/* Time Period */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="text-gray-700 font-semibold">Time Period</label>
                <span className="text-purple-600 font-bold text-lg">{timePeriod} years</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={timePeriod}
                onChange={(e) => setTimePeriod(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 yr</span>
                <span>10 yrs</span>
                <span>20 yrs</span>
                <span>30 yrs</span>
              </div>
              <div className="mt-3">
                <input
                  type="number"
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
                  step="1"
                  min="1"
                  max="30"
                />
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-indigo-50 rounded-xl p-4 mt-4">
              <p className="text-sm text-indigo-800">
                💡 Systematic Investment Plans (SIP) help you invest regularly and
                benefit from rupee cost averaging and power of compounding.
              </p>
            </div>
          </div>

          {/* RIGHT PANEL: Report & Charts (PDF capture area) */}
          <div
            ref={reportRef}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 transition-all"
          >
            {/* Report Header */}
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-800">SIP Investment Report</h2>
              <p className="text-gray-500 text-sm mt-1">
                As on {new Date().toLocaleDateString('en-IN')}
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center shadow-sm">
                <p className="text-blue-600 text-sm font-medium">Total Investment</p>
                <p className="text-2xl font-bold text-gray-800">{formattedInvestment}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 text-center shadow-sm">
                <p className="text-emerald-600 text-sm font-medium">Total Returns</p>
                <p className="text-2xl font-bold text-gray-800">{formattedReturns}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center shadow-sm">
                <p className="text-purple-600 text-sm font-medium">Maturity Value</p>
                <p className="text-2xl font-bold text-gray-800">{formattedMaturity}</p>
              </div>
            </div>

            {/* Investment Summary Text */}
            <div className="mb-6 text-center text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
              <span className="font-medium">📍 Monthly SIP:</span> {formatCurrency(monthlySIP)} &nbsp;|&nbsp;
              <span className="font-medium">📈 Return Rate:</span> {expectedReturn}% p.a. &nbsp;|&nbsp;
              <span className="font-medium">⏱️ Tenure:</span> {timePeriod} years ({timePeriod * 12} months)
            </div>

            {/* PIE CHART: Investment vs Returns */}
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                Investment Breakdown
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                     
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* LINE CHART: Yearly Growth (The "1 graff or add" requirement) */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Wealth Growth Over Years
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="year"
                      tickFormatter={(year) => `${year}Y`}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      tickFormatter={(value) => formatCompactCurrency(value)}
                      tick={{ fontSize: 11 }}
                      width={70}
                    />
                    <Tooltip
                      formatter={(value: any) => formatCurrency(value)}
                      labelFormatter={(label) => `Year ${label}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Corpus Value"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ r: 3, fill: '#8b5cf6' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={handleInvestNow}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              >
                Invest Now <span aria-hidden="true">→</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="px-8 py-3 bg-white border-2 border-indigo-600 text-indigo-700 font-semibold rounded-xl shadow-md hover:bg-indigo-50 transition-all duration-200 flex items-center gap-2 disabled:opacity-60"
              >
                {isGeneratingPDF ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    📄 Download Report (PDF)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-gray-400 text-xs mt-12">
          *Mutual fund investments are subject to market risks. This is an estimated
          calculation, actual returns may vary.
        </div>
      </div>
    </div>
  );
}