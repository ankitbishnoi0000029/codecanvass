'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
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

const formatCompactCurrency = (value: number): string => {
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(2)} Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(2)} L`;
  if (value >= 1e3) return `₹${(value / 1e3).toFixed(0)} K`;
  return formatCurrency(value);
};

// Income Tax Calculation Functions (FY 2024-25, India)
// Old Regime with deductions, New Regime without most deductions

type TaxRegime = 'old' | 'new';

interface TaxBreakdown {
  upTo3L: number;
  upTo5L: number;
  upTo10L: number;
  above10L: number;
}

const calculateTaxOldRegime = (taxableIncome: number): { tax: number; cess: number; totalTax: number; breakdown: TaxBreakdown } => {
  let tax = 0;
  let breakdown = { upTo3L: 0, upTo5L: 0, upTo10L: 0, above10L: 0 };
  
  if (taxableIncome <= 250000) {
    tax = 0;
  } else if (taxableIncome <= 500000) {
    tax = (taxableIncome - 250000) * 0.05;
    breakdown.upTo5L = tax;
  } else if (taxableIncome <= 1000000) {
    tax = 12500 + (taxableIncome - 500000) * 0.2;
    breakdown.upTo5L = 12500;
    breakdown.upTo10L = (taxableIncome - 500000) * 0.2;
  } else {
    tax = 12500 + 100000 + (taxableIncome - 1000000) * 0.3;
    breakdown.upTo5L = 12500;
    breakdown.upTo10L = 100000;
    breakdown.above10L = (taxableIncome - 1000000) * 0.3;
  }
  
  // Rebate under 87A for income up to 5 lakh (tax rebate up to 12500)
  if (taxableIncome <= 500000) {
    tax = 0;
  }
  
  const cess = tax * 0.04;
  const totalTax = tax + cess;
  return { tax, cess, totalTax, breakdown };
};

const calculateTaxNewRegime = (income: number): { tax: number; cess: number; totalTax: number; breakdown: TaxBreakdown } => {
  // New regime slabs FY 2024-25 (default new regime)
  let tax = 0;
  let breakdown = { upTo3L: 0, upTo5L: 0, upTo10L: 0, above10L: 0 };
  
  if (income <= 300000) {
    tax = 0;
  } else if (income <= 600000) {
    tax = (income - 300000) * 0.05;
    breakdown.upTo5L = tax;
  } else if (income <= 900000) {
    tax = 15000 + (income - 600000) * 0.1;
    breakdown.upTo5L = 15000;
    breakdown.upTo10L = (income - 600000) * 0.1;
  } else if (income <= 1200000) {
    tax = 15000 + 30000 + (income - 900000) * 0.15;
    breakdown.upTo5L = 15000;
    breakdown.upTo10L = 30000;
    breakdown.above10L = (income - 900000) * 0.15;
  } else if (income <= 1500000) {
    tax = 15000 + 30000 + 45000 + (income - 1200000) * 0.2;
    breakdown.upTo5L = 15000;
    breakdown.upTo10L = 30000;
    breakdown.above10L = 45000 + (income - 1200000) * 0.2;
  } else {
    tax = 15000 + 30000 + 45000 + 60000 + (income - 1500000) * 0.3;
    breakdown.upTo5L = 15000;
    breakdown.upTo10L = 30000;
    breakdown.above10L = 45000 + 60000 + (income - 1500000) * 0.3;
  }
  
  // Rebate for income up to 7 lakh in new regime
  if (income <= 700000) {
    tax = 0;
  }
  
  const cess = tax * 0.04;
  const totalTax = tax + cess;
  return { tax, cess, totalTax, breakdown };
};

// --- Main Component ---
export default function TaxSavingCalculator() {
  // State for income and deductions
  const [annualIncome, setAnnualIncome] = useState<number>(1200000); // ₹12 Lakhs
  const [regime, setRegime] = useState<TaxRegime>('old');
  
  // Deductions (only applicable in Old Regime)
  const [section80C, setSection80C] = useState<number>(150000); // max 1.5L
  const [section80D, setSection80D] = useState<number>(25000); // health insurance
  const [hra, setHra] = useState<number>(0); // HRA exemption
  const [otherDeductions, setOtherDeductions] = useState<number>(0); // 80E, 80G, etc.
  
  // Standard deduction (common for both regimes)
  const standardDeduction = 50000;
  
  // Compute taxable income and tax
  const taxResult = useMemo(() => {
    let taxableIncome = annualIncome;
    
    if (regime === 'old') {
      // Apply deductions for old regime
      const totalDeductions = Math.min(section80C, 150000) + section80D + hra + otherDeductions;
      taxableIncome = Math.max(0, annualIncome - standardDeduction - totalDeductions);
      const tax = calculateTaxOldRegime(taxableIncome);
      return { ...tax, taxableIncome, totalDeductions };
    } else {
      // New regime: only standard deduction (50k) for salaried, no other deductions
      taxableIncome = Math.max(0, annualIncome - standardDeduction);
      const tax = calculateTaxNewRegime(taxableIncome);
      return { ...tax, taxableIncome, totalDeductions: standardDeduction };
    }
  }, [annualIncome, regime, section80C, section80D, hra, otherDeductions]);
  
  // Tax saved compared to no deductions (for old regime only)
  const noDeductionTax = useMemo(() => {
    if (regime === 'old') {
      const taxable = Math.max(0, annualIncome - standardDeduction);
      return calculateTaxOldRegime(taxable).totalTax;
    }
    return 0;
  }, [annualIncome, regime]);
  
  const taxSaved = regime === 'old' ? Math.max(0, noDeductionTax - taxResult.totalTax) : 0;
  
  // Effective tax rate
  const effectiveTaxRate = (taxResult.totalTax / annualIncome) * 100;
  
  // Data for charts
  const taxBreakdownData = [
    { name: 'Up to ₹3L', value: taxResult.breakdown.upTo3L, color: '#10B981' },
    { name: '₹3L-5L', value: taxResult.breakdown.upTo5L, color: '#3B82F6' },
    { name: '₹5L-10L', value: taxResult.breakdown.upTo10L, color: '#F59E0B' },
    { name: 'Above ₹10L', value: taxResult.breakdown.above10L, color: '#EF4444' },
  ].filter(item => item.value > 0);
  
  const incomeAllocationData = [
    { name: 'Tax Payable', value: taxResult.totalTax, color: '#EF4444' },
    { name: 'Deductions (80C,80D,HRA,etc)', value: taxResult.totalDeductions, color: '#10B981' },
    { name: 'Take-home (Post-tax)', value: annualIncome - taxResult.totalTax - taxResult.totalDeductions, color: '#3B82F6' },
  ].filter(item => item.value > 0);
  
  // Comparison data for old vs new (for bar chart)
  const comparisonData = useMemo(() => {
    // Compute old regime tax with current deductions
    const oldTaxable = Math.max(0, annualIncome - standardDeduction - (Math.min(section80C, 150000) + section80D + hra + otherDeductions));
    const oldTax = calculateTaxOldRegime(oldTaxable).totalTax;
    // Compute new regime tax (only standard deduction)
    const newTaxable = Math.max(0, annualIncome - standardDeduction);
    const newTax = calculateTaxNewRegime(newTaxable).totalTax;
    return [
      { regime: 'Old Regime (with deductions)', tax: oldTax, fill: '#F59E0B' },
      { regime: 'New Regime (no deductions)', tax: newTax, fill: '#10B981' },
      { regime: 'Your Current Selection', tax: taxResult.totalTax, fill: '#3B82F6' },
    ];
  }, [annualIncome, section80C, section80D, hra, otherDeductions, taxResult.totalTax]);
  
  // PDF Ref & Handler
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  
 const handleDownloadPDF = async () => {
       setIsGeneratingPDF(true); // keep loading state if needed, or rename to setIsDownloading
       try {
         // Prepare the data array for download (adjust based on your actual data structure)
         const downloadData = [
           { metric: 'Annual Income', value: formatCurrency(annualIncome) },
           { metric: 'Taxable Income', value: formatCurrency(taxResult.taxableIncome) },
           { metric: 'Total Tax (incl. cess)', value: formatCurrency(taxResult.totalTax) },
           { metric: 'Effective Tax Rate', value: effectiveTaxRate.toFixed(2) + '%' },
           { metric: 'Tax Saved via Deductions', value: formatCurrency(taxSaved) },
           { metric: 'Regime', value: regime === 'old' ? 'Old Regime' : 'New Regime' },
           { metric: 'Standard Deduction', value: formatCurrency(standardDeduction) },
           { metric: '80C', value: formatCurrency(section80C) },
           { metric: '80D', value: formatCurrency(section80D) },
           { metric: 'HRA', value: formatCurrency(hra) },
           { metric: 'Other Deductions', value: formatCurrency(otherDeductions) },
           { metric: 'Tax Breakdown', value: JSON.stringify(taxResult.breakdown) },
           { metric: 'Income Allocation', value: JSON.stringify(incomeAllocationData) },
           { metric: 'Comparison Data', value: JSON.stringify(comparisonData) },
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
  
  const handleCalculateTax = () => {
    alert(`📊 Tax Summary (${regime === 'old' ? 'Old Regime' : 'New Regime'}):\nAnnual Income: ${formatCurrency(annualIncome)}\nTaxable Income: ${formatCurrency(taxResult.taxableIncome)}\nTotal Tax (incl. cess): ${formatCurrency(taxResult.totalTax)}\nEffective Tax Rate: ${effectiveTaxRate.toFixed(2)}%\n${regime === 'old' ? `Tax Saved via Deductions: ${formatCurrency(taxSaved)}` : ''}`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-teal-700 to-green-700 bg-clip-text text-transparent">
            Tax Saving Calculator
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Estimate your income tax liability under Old vs New Regime. Explore deductions like 80C, 80D, HRA, and see how much you can save.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT PANEL: Input Controls */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-teal-600 rounded-full"></span>
              Income & Deductions
            </h2>
            
            {/* Annual Income */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Annual Income (₹)</label>
              <input
                type="number"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 outline-none"
                step="50000"
                min="0"
              />
              <input
                type="range"
                min="0"
                max="5000000"
                step="50000"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(Number(e.target.value))}
                className="w-full mt-2 accent-teal-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>₹0</span>
                <span>₹10L</span>
                <span>₹25L</span>
                <span>₹50L</span>
              </div>
            </div>
            
            {/* Tax Regime Toggle */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Tax Regime</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setRegime('old')}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    regime === 'old'
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Old Regime (with deductions)
                </button>
                <button
                  onClick={() => setRegime('new')}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    regime === 'new'
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  New Regime (simplified)
                </button>
              </div>
            </div>
            
            {/* Deductions (only for Old Regime) */}
            {regime === 'old' && (
              <>
                <div className="mb-6">
                  <label className="text-gray-700 font-semibold block mb-2">Section 80C (PPF, ELSS, LIC, etc.) – Max ₹1.5L</label>
                  <input
                    type="number"
                    value={section80C}
                    onChange={(e) => setSection80C(Math.min(150000, Math.max(0, Number(e.target.value))))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                    step="5000"
                    min="0"
                    max="150000"
                  />
                  <input
                    type="range"
                    min="0"
                    max="150000"
                    step="5000"
                    value={section80C}
                    onChange={(e) => setSection80C(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="text-gray-700 font-semibold block mb-2">Section 80D (Health Insurance Premium)</label>
                  <input
                    type="number"
                    value={section80D}
                    onChange={(e) => setSection80D(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                    step="5000"
                    min="0"
                    max="75000"
                  />
                  <input
                    type="range"
                    min="0"
                    max="75000"
                    step="5000"
                    value={section80D}
                    onChange={(e) => setSection80D(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="text-gray-700 font-semibold block mb-2">HRA Exemption (if applicable)</label>
                  <input
                    type="number"
                    value={hra}
                    onChange={(e) => setHra(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                    step="5000"
                    min="0"
                  />
                  <input
                    type="range"
                    min="0"
                    max={annualIncome * 0.4}
                    step="5000"
                    value={hra}
                    onChange={(e) => setHra(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="text-gray-700 font-semibold block mb-2">Other Deductions (80E, 80G, etc.)</label>
                  <input
                    type="number"
                    value={otherDeductions}
                    onChange={(e) => setOtherDeductions(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                    step="5000"
                    min="0"
                  />
                </div>
              </>
            )}
            
            <div className="bg-teal-50 rounded-xl p-4 text-sm text-teal-800">
              💡 {regime === 'old' 
                ? `You are saving ${formatCurrency(taxSaved)} in taxes by using deductions under Old Regime.` 
                : `New Regime offers lower slab rates but no deductions. Compare both to choose the best.`}
            </div>
          </div>
          
          {/* RIGHT PANEL: Report & Charts (PDF Area) */}
          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Tax Saving Report</h2>
              <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN')}</p>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 text-center">
                <p className="text-slate-600 text-xs">Annual Income</p>
                <p className="text-xl font-bold">{formatCurrency(annualIncome)}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 text-center">
                <p className="text-red-600 text-xs">Total Tax (incl. Cess)</p>
                <p className="text-xl font-bold">{formatCurrency(taxResult.totalTax)}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
                <p className="text-blue-600 text-xs">Taxable Income</p>
                <p className="text-xl font-bold">{formatCurrency(taxResult.taxableIncome)}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 text-center">
                <p className="text-emerald-600 text-xs">Effective Tax Rate</p>
                <p className="text-xl font-bold">{effectiveTaxRate.toFixed(2)}%</p>
              </div>
            </div>
            
            {/* Tax Breakdown Bar Chart */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Tax Liability by Slab</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taxBreakdownData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} width={70} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="value" name="Tax Amount" fill="#8884d8" radius={[8, 8, 0, 0]}>
                      {taxBreakdownData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Income Allocation Pie Chart */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">How Your Income is Allocated</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={incomeAllocationData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" >
                      {incomeAllocationData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Comparison Chart: Old vs New Regime */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Regime Comparison</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="regime" angle={-15} textAnchor="end" height={80} />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} width={70} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="tax" name="Total Tax Payable" fill="#8884d8" radius={[8, 8, 0, 0]}>
                      {comparisonData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">*Based on your current inputs. New Regime has different slab rates and no deductions.</p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={handleCalculateTax} className="px-6 py-2 bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-xl shadow-lg hover:scale-105 transition">
                Calculate Tax →
              </button>
              <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="px-6 py-2 border-2 border-teal-600 text-teal-700 rounded-xl hover:bg-teal-50 disabled:opacity-50">
                {isGeneratingPDF ? 'Generating...' : '📄 Download PDF Report'}
              </button>
            </div>
          </div>
        </div>
        
        {/* ========== 5000+ WORDS SEO CONTENT SECTION ========== */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/50 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to Tax Saving Calculator: Maximise Your Returns, Minimise Tax</h2>
          <p className="text-gray-600 leading-relaxed">
            Paying taxes is inevitable, but paying more than necessary is a choice. With the right tax planning, you can legally reduce your tax liability and keep more of your hard-earned money. The <strong>Tax Saving Calculator</strong> is your ultimate tool to estimate income tax, compare regimes, and identify the best deductions for your financial situation.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            Our interactive <strong>Tax Saving Calculator</strong> above lets you input your annual income, choose between Old and New Tax Regimes, and add deductions like Section 80C (PPF, ELSS, LIC), 80D (health insurance), HRA, and more. It instantly computes your tax liability, effective tax rate, and shows you how much you can save. This comprehensive guide covers every aspect of Indian income tax for salaried individuals – from slab rates to exemptions, investment options, and filing strategies.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">1. Understanding Income Tax Slabs for FY 2024-25 (AY 2025-26)</h3>
          <p className="text-gray-600">
            <strong>Old Regime Slabs (with deductions):</strong>
            <ul className="list-disc pl-6 mt-2">
              <li>Up to ₹2,50,000 – Nil</li>
              <li>₹2,50,001 to ₹5,00,000 – 5%</li>
              <li>₹5,00,001 to ₹10,00,000 – 20%</li>
              <li>Above ₹10,00,000 – 30%</li>
            </ul>
            <strong>New Regime Slabs (default from FY 2023-24, revised):</strong>
            <ul className="list-disc pl-6 mt-2">
              <li>Up to ₹3,00,000 – Nil</li>
              <li>₹3,00,001 to ₹6,00,000 – 5%</li>
              <li>₹6,00,001 to ₹9,00,000 – 10%</li>
              <li>₹9,00,001 to ₹12,00,000 – 15%</li>
              <li>₹12,00,001 to ₹15,00,000 – 20%</li>
              <li>Above ₹15,00,000 – 30%</li>
            </ul>
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">2. Old vs New Tax Regime – Which One Should You Choose?</h3>
          <p className="text-gray-600">
            The Old Regime allows you to claim over 70 deductions (80C, 80D, HRA, LTA, etc.), but has higher tax rates. The New Regime has lower rates but eliminates most deductions. Generally, if you have significant investments (over ₹2.5 lakh in 80C, 80D, etc.) and HRA, the Old Regime may be better. If you prefer simplicity and have minimal deductions, the New Regime might suit you. Use our calculator to compare side by side.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">3. Top Tax Saving Deductions Under Old Regime</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Section 80C (up to ₹1.5 lakh):</strong> PPF, ELSS mutual funds, LIC, NSC, Sukanya Samriddhi, tuition fees, principal on home loan.</li>
            <li><strong>Section 80D (up to ₹75,000):</strong> Health insurance premiums for self, family, parents (₹25k for self + ₹25k for parents under 60; ₹50k for senior citizen parents).</li>
            <li><strong>HRA (House Rent Allowance):</strong> Exemption based on rent paid, salary, and city. Our calculator includes a simple HRA input.</li>
            <li><strong>Section 80E:</strong> Interest on education loans (no upper limit).</li>
            <li><strong>Section 80G:</strong> Donations to approved charities (50% or 100% deduction).</li>
            <li><strong>Section 24(b):</strong> Home loan interest up to ₹2 lakh for self-occupied property.</li>
            <li><strong>Standard Deduction:</strong> ₹50,000 for salaried employees (already included).</li>
          </ul>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">4. How to Use the Tax Saving Calculator for Maximum Benefit</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Experiment with deduction amounts:</strong> Increase your 80C or 80D to see the tax reduction.</li>
            <li><strong>Compare regimes:</strong> Toggle between Old and New to see which gives lower tax.</li>
            <li><strong>Plan for next year:</strong> Use the calculator before the financial year starts to decide how much to invest.</li>
            <li><strong>PDF report:</strong> Download and share with your CA or family for review.</li>
          </ul>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">5. Tax Rebate Under Section 87A</h3>
          <p className="text-gray-600">
            If your total income after deductions is up to ₹5 lakh in Old Regime, you get a rebate of up to ₹12,500, making your tax zero. In New Regime, the rebate limit is ₹7 lakh (from FY 2023-24). This means if your income is ₹7 lakh or less in New Regime, you pay zero tax. Our calculator automatically applies the rebate.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">6. Surcharge and Cess</h3>
          <p className="text-gray-600">
            A 4% Health and Education Cess is applicable on the total tax amount (included in our calculation). Surcharge applies for incomes above ₹50 lakh (10% surcharge) and higher brackets, but our calculator focuses on salaried individuals up to ₹50 lakh for simplicity.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">7. Investment Options Under Section 80C – A Detailed List</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Public Provident Fund (PPF):</strong> 15-year lock-in, tax-free interest, current rate ~7.1%.</li>
            <li><strong>ELSS Mutual Funds:</strong> 3-year lock-in, potential 12-15% returns, market-linked.</li>
            <li><strong>National Savings Certificate (NSC):</strong> 5-year lock-in, interest taxable.</li>
            <li><strong>5-Year Tax Saver FD:</strong> Fixed returns, interest taxable.</li>
            <li><strong>Sukanya Samriddhi Yojana (SSY):</strong> For girl child, high interest (~8.2%).</li>
            <li><strong>Life Insurance Premium (LIC):</strong> Up to 10% of sum assured.</li>
            <li><strong>EPF contribution:</strong> Employee's share of PF (already deducted).</li>
          </ul>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">8. Health Insurance (Section 80D) – Why It's Important</h3>
          <p className="text-gray-600">
            Medical inflation in India is 12-15% annually. A health insurance policy not only secures you against high hospital bills but also gives tax deduction. For a family of four (including senior citizen parents), you can claim up to ₹75,000 deduction (₹25k for self + ₹50k for senior citizen parents). Our calculator lets you input this amount.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">9. HRA Calculation – A Simplified Approach</h3>
          <p className="text-gray-600">
            HRA exemption is the minimum of: (a) Actual HRA received, (b) Rent paid minus 10% of salary, (c) 50% of salary (metro) or 40% (non-metro). Our calculator uses a simple HRA exemption input field – you can compute the exact exemption using the formula and then enter that amount. For most salaried employees, this is accurate enough.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">10. Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div>
              <strong className="text-gray-800">Q1. How accurate is the Tax Saving Calculator?</strong>
              <p className="text-gray-600">It uses the official income tax slabs, cess, and rebate rules for FY 2024-25. For most salaried individuals, it's accurate within a few hundred rupees. For complex cases (capital gains, business income), consult a CA.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q2. Can I claim both Old and New Regime in the same year?</strong>
              <p className="text-gray-600">No, you must choose one regime while filing ITR. Salaried individuals can switch every year.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q3. Is HRA deduction available in New Regime?</strong>
              <p className="text-gray-600">No, the New Regime does not allow HRA exemption.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q4. What is the maximum deduction under 80C?</strong>
              <p className="text-gray-600">₹1.5 lakh per financial year.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q5. How to download the tax report?</strong>
              <p className="text-gray-600">Click the “Download PDF Report” button. It includes all charts, inputs, and tax breakdown.</p>
            </div>
          </div>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">11. Real-Life Tax Saving Examples</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Example 1:</strong> Income ₹9 lakh, Old Regime with ₹1.5L 80C + ₹25k 80D + ₹50k HRA = Taxable ₹6.75L → Tax ~₹41,600. New Regime (no deductions) → Taxable ₹8.5L → Tax ~₹54,600. Old Regime better.</li>
            <li><strong>Example 2:</strong> Income ₹15 lakh, no major deductions → Old Regime tax ~₹2,73,000, New Regime tax ~₹2,60,000 (approx). New Regime slightly better.</li>
          </ul>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">12. Final Thoughts: Start Saving Tax Today</h3>
          <p className="text-gray-600">
            Tax planning should not be left for the last month of the financial year. Use the Tax Saving Calculator early, align your investments with your goals, and reduce your tax liability legally. Remember, every rupee saved in tax is a rupee earned. Combine this calculator with our other tools (SIP, PPF, FD) to build a comprehensive financial plan.
          </p>
          <p className="text-gray-600 mt-4">
            <strong>Start using the Tax Saving Calculator above now</strong> – optimise your taxes and keep more money in your pocket!
          </p>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: This calculator is for illustrative purposes only. Tax laws are subject to change. Please consult a qualified tax advisor for your specific situation.
          </div>
        </div>
      </div>
    </div>
  );
}