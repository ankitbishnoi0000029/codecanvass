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

// --- CII Index (Cost Inflation Index) from FY 2001-02 to FY 2025-26 ---
// Base year 2001-02 = 100
const CII_INDEX: Record<number, number> = {
  2001: 100, 2002: 105, 2003: 109, 2004: 113, 2005: 117,
  2006: 122, 2007: 129, 2008: 137, 2009: 148, 2010: 167,
  2011: 184, 2012: 200, 2013: 220, 2014: 240, 2015: 254,
  2016: 264, 2017: 272, 2018: 280, 2019: 289, 2020: 301,
  2021: 317, 2022: 331, 2023: 348, 2024: 363, 2025: 378,
  2026: 392,
};

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

// Get indexed cost
const getIndexedCost = (purchaseYear: number, saleYear: number, cost: number): number => {
  const ciiPurchase = CII_INDEX[purchaseYear] || CII_INDEX[2021];
  const ciiSale = CII_INDEX[saleYear] || CII_INDEX[2025];
  if (!ciiPurchase || !ciiSale) return cost;
  return (cost * ciiSale) / ciiPurchase;
};

// Main capital gains calculation
const calculateCapitalGains = (
  assetType: 'equity' | 'debt' | 'realestate',
  purchasePrice: number,
  salePrice: number,
  purchaseYear: number,
  saleYear: number,
  purchaseExpenses: number,
  saleExpenses: number,
  improvementCost: number
) => {
  const holdingYears = saleYear - purchaseYear;
  const totalCost = purchasePrice + purchaseExpenses + improvementCost;
  const netSaleValue = salePrice - saleExpenses;
  let grossGain = netSaleValue - totalCost;
  if (grossGain < 0) grossGain = 0;

  let indexedCost = totalCost;
  let taxableGain = grossGain;
  let taxRate = 0;
  let taxLiability = 0;
  let isLongTerm = false;

  if (assetType === 'equity') {
    isLongTerm = holdingYears >= 1;
    if (isLongTerm) {
      const exemptAmount = 100000;
      taxableGain = Math.max(0, grossGain - exemptAmount);
      taxRate = 10;
    } else {
      taxRate = 15;
    }
  } else if (assetType === 'debt') {
    isLongTerm = holdingYears >= 3;
    if (isLongTerm) {
      indexedCost = getIndexedCost(purchaseYear, saleYear, totalCost);
      taxableGain = Math.max(0, netSaleValue - indexedCost);
      taxRate = 20;
    } else {
      taxRate = 30;
    }
  } else if (assetType === 'realestate') {
    isLongTerm = holdingYears >= 2;
    if (isLongTerm) {
      indexedCost = getIndexedCost(purchaseYear, saleYear, totalCost);
      taxableGain = Math.max(0, netSaleValue - indexedCost);
      taxRate = 20;
    } else {
      taxRate = 30;
    }
  }

  taxLiability = taxableGain * (taxRate / 100);

  return {
    holdingYears,
    isLongTerm,
    totalCost,
    netSaleValue,
    grossGain,
    indexedCost,
    taxableGain,
    taxRate,
    taxLiability,
    afterTaxProceeds: netSaleValue - taxLiability,
  };
};

// --- Main Component ---
export default function CapitalGainsCalculator() {
  const [assetType, setAssetType] = useState<'equity' | 'debt' | 'realestate'>('equity');
  const [purchasePrice, setPurchasePrice] = useState<number>(100000);
  const [salePrice, setSalePrice] = useState<number>(180000);
  const [purchaseYear, setPurchaseYear] = useState<number>(2019);
  const [saleYear, setSaleYear] = useState<number>(2025);
  const [purchaseExpenses, setPurchaseExpenses] = useState<number>(5000);
  const [saleExpenses, setSaleExpenses] = useState<number>(3000);
  const [improvementCost, setImprovementCost] = useState<number>(0);

  const currentYear = new Date().getFullYear();

  const result = useMemo(
    () => calculateCapitalGains(
      assetType,
      purchasePrice,
      salePrice,
      purchaseYear,
      saleYear,
      purchaseExpenses,
      saleExpenses,
      improvementCost
    ),
    [assetType, purchasePrice, salePrice, purchaseYear, saleYear, purchaseExpenses, saleExpenses, improvementCost]
  );

  const pieData = [
    { name: 'Total Cost', value: result.totalCost, color: '#3B82F6' },
    { name: 'Capital Gain', value: result.grossGain, color: '#10B981' },
    { name: 'Tax Payable', value: result.taxLiability, color: '#EF4444' },
  ].filter(item => item.value > 0);

  const holdingImpactData = useMemo(() => {
    const years = [];
    for (let y = 1; y <= 10; y++) {
      const simulated = calculateCapitalGains(
        assetType,
        purchasePrice,
        salePrice,
        purchaseYear,
        purchaseYear + y,
        purchaseExpenses,
        saleExpenses,
        improvementCost
      );
      years.push({
        year: y,
        taxLiability: simulated.taxLiability,
        afterTaxProceeds: simulated.afterTaxProceeds,
      });
    }
    return years;
  }, [assetType, purchasePrice, salePrice, purchaseYear, purchaseExpenses, saleExpenses, improvementCost]);

  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true); // keep loading state if needed, or rename to setIsDownloading
        try {
          // Prepare the data array for download (adjust based on your actual data structure)
          const downloadData = [
            { metric: 'Asset Type', value: assetType.toUpperCase() },
            { metric: 'Holding Period', value: `${result.holdingYears} years (${result.isLongTerm ? 'Long-term' : 'Short-term'})` },
            { metric: 'Gross Gain', value: formatCurrency(result.grossGain) },
            { metric: 'Taxable Gain', value: formatCurrency(result.taxableGain) },
            { metric: 'Tax Rate', value: `${result.taxRate}%` },
            { metric: 'Tax Liability', value: formatCurrency(result.taxLiability) },
            { metric: 'After-tax Proceeds', value: formatCurrency(result.afterTaxProceeds) },
            { metric: 'Holding Impact', value: JSON.stringify(holdingImpactData, null, 2) },
            { metric: 'Total Cost', value: formatCurrency(result.totalCost) },
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
    alert(`💰 Capital Gains Tax Estimate:\nAsset: ${assetType.toUpperCase()}\nHolding Period: ${result.holdingYears} years (${result.isLongTerm ? 'Long-term' : 'Short-term'})\nGross Gain: ${formatCurrency(result.grossGain)}\nTaxable Gain: ${formatCurrency(result.taxableGain)}\nTax Rate: ${result.taxRate}%\nTax Liability: ${formatCurrency(result.taxLiability)}\nAfter-tax Proceeds: ${formatCurrency(result.afterTaxProceeds)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
            Capital Gains Calculator
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Estimate your capital gains tax liability on sale of assets like equity, debt funds, or real estate. Includes indexation benefit for long-term holdings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT PANEL */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-emerald-600 rounded-full"></span>
              Asset & Transaction Details
            </h2>

            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Asset Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['equity', 'debt', 'realestate'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setAssetType(type)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition ${
                      assetType === type
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'realestate' ? 'Real Estate' : type === 'equity' ? 'Equity' : 'Debt'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {assetType === 'equity' && 'Stocks, equity mutual funds (holding {`>`}1 year LTCG @10% over ₹1L)'}
                {assetType === 'debt' && 'Debt funds, bonds (holding {`>`}3 years LTCG with indexation @20%)'}
                {assetType === 'realestate' && 'Property, land (holding {`>`}2 years LTCG with indexation @20%)'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-gray-700 font-semibold block mb-2">Purchase Year (FY)</label>
                <select
                  value={purchaseYear}
                  onChange={(e) => setPurchaseYear(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  {Array.from({ length: 25 }, (_, i) => currentYear - 24 + i).map(y => (
                    <option key={y} value={y}>{y}-{y+1}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-700 font-semibold block mb-2">Sale Year (FY)</label>
                <select
                  value={saleYear}
                  onChange={(e) => setSaleYear(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  {Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map(y => (
                    <option key={y} value={y}>{y}-{y+1}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-gray-700 font-semibold block mb-2">Purchase Price (₹)</label>
                <input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" step="10000" min="0" />
              </div>
              <div>
                <label className="text-gray-700 font-semibold block mb-2">Sale Price (₹)</label>
                <input type="number" value={salePrice} onChange={(e) => setSalePrice(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" step="10000" min="0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-gray-700 font-semibold block mb-2">Purchase Expenses</label>
                <input type="number" value={purchaseExpenses} onChange={(e) => setPurchaseExpenses(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" step="1000" min="0" />
              </div>
              <div>
                <label className="text-gray-700 font-semibold block mb-2">Sale Expenses</label>
                <input type="number" value={saleExpenses} onChange={(e) => setSaleExpenses(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" step="1000" min="0" />
              </div>
            </div>

            {assetType === 'realestate' && (
              <div className="mb-6">
                <label className="text-gray-700 font-semibold block mb-2">Cost of Improvement (₹)</label>
                <input type="number" value={improvementCost} onChange={(e) => setImprovementCost(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" step="10000" min="0" />
                <p className="text-xs text-gray-500 mt-1">Capital improvements (renovation, extension) added to cost</p>
              </div>
            )}

            <div className="bg-emerald-50 rounded-xl p-4 text-sm text-emerald-800">
              💡 For long-term debt/real estate, indexation adjusts purchase cost for inflation, reducing taxable gains significantly.
            </div>
          </div>

          {/* RIGHT PANEL - Report */}
          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Capital Gains Report</h2>
              <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
                <p className="text-blue-600 text-xs">Gross Capital Gain</p>
                <p className="text-xl font-bold">{formatCurrency(result.grossGain)}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 text-center">
                <p className="text-red-600 text-xs">Tax Liability</p>
                <p className="text-xl font-bold">{formatCurrency(result.taxLiability)}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center">
                <p className="text-green-600 text-xs">After-tax Proceeds</p>
                <p className="text-xl font-bold">{formatCurrency(result.afterTaxProceeds)}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 text-center">
                <p className="text-purple-600 text-xs">Effective Tax Rate</p>
                <p className="text-xl font-bold">{result.grossGain > 0 ? ((result.taxLiability / result.grossGain)*100).toFixed(1) : 0}%</p>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 mb-4">
              Holding: {result.holdingYears} years ({result.isLongTerm ? 'Long-term' : 'Short-term'}) | Tax rate: {result.taxRate}%
            </div>

            {assetType !== 'equity' && result.isLongTerm && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                <div className="flex justify-between"><span>Original Cost:</span><strong>{formatCurrency(result.totalCost)}</strong></div>
                <div className="flex justify-between"><span>Indexed Cost:</span><strong>{formatCurrency(result.indexedCost)}</strong></div>
                <div className="flex justify-between"><span>Reduction in Gain:</span><strong className="text-green-600">{formatCurrency(result.totalCost - result.indexedCost)}</strong></div>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Breakdown of Sale Value</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
                      {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Impact of Holding Period on Tax</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={holdingImpactData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" label={{ value: 'Holding Years', position: 'insideBottom', offset: -5 }} />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} width={70} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="taxLiability" name="Tax Payable" stroke="#EF4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="afterTaxProceeds" name="After-tax Proceeds" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-center text-gray-500 mt-2">Longer holding reduces tax (indexation) for debt & real estate</p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={handleCalculate} className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow-lg hover:scale-105 transition">
                Calculate Tax →
              </button>
              <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="px-6 py-2 border-2 border-emerald-600 text-emerald-700 rounded-xl hover:bg-emerald-50 disabled:opacity-50">
                {isGeneratingPDF ? 'Generating...' : '📄 Download PDF Report'}
              </button>
            </div>
          </div>
        </div>

        {/* SEO Content Section - All JSX safe */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/50 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to Capital Gains Calculator</h2>
          <p className="text-gray-600 leading-relaxed">
            Capital gains tax is levied on the profit earned from selling a capital asset such as shares, mutual funds, real estate, or gold. Understanding how capital gains are calculated and taxed is crucial for effective tax planning and investment decisions. Our Capital Gains Calculator simplifies this complex process by considering asset type, holding period, indexation benefits, and applicable tax rates.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">1. What is Capital Gains Tax?</h3>
          <p className="text-gray-600">
            Capital gains tax is the tax you pay on the profit (gain) when you sell a capital asset. The gain is the difference between the sale price and the purchase cost (adjusted for expenses and indexation). The tax rate depends on the type of asset and how long you held it before selling.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">2. Short-term vs Long-term Capital Gains</h3>
          <p className="text-gray-600">
            <strong>Holding period thresholds:</strong>
            <ul className="list-disc pl-6 mt-2">
              <li><strong>Equity shares & equity mutual funds:</strong> Long-term if held {`>`}12 months; else short-term.</li>
              <li><strong>Debt mutual funds & bonds:</strong> Long-term if held {`>`}36 months; else short-term.</li>
              <li><strong>Real estate (land, building):</strong> Long-term if held {`>`}24 months; else short-term.</li>
              <li><strong>Gold, jewellery, art:</strong> Long-term if held {`>`}36 months.</li>
            </ul>
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">3. Tax Rates for Different Assets</h3>
          <p className="text-gray-600">
            <strong>Equity (stocks, equity funds):</strong><br />
            - LTCG ({`>`}1 year): 10% on gains exceeding ₹1 lakh (no indexation).<br />
            - STCG ({`<`}1 year): 15%.<br />
            <strong>Debt funds & bonds:</strong><br />
            - LTCG ({`>`}3 years): 20% with indexation benefit.<br />
            - STCG ({`<`}3 years): As per income tax slab (up to 30%).<br />
            <strong>Real Estate:</strong><br />
            - LTCG ({`>`}2 years): 20% with indexation.<br />
            - STCG ({`<`}2 years): As per slab.<br />
            <strong>Gold, other assets:</strong> LTCG (3+ years) 20% with indexation; STCG as per slab.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">4. Indexation Benefit Explained</h3>
          <p className="text-gray-600">
            Indexation allows you to adjust the purchase cost of an asset for inflation using the Cost Inflation Index (CII) published by the Income Tax Department. The indexed cost = (Original Cost × CII of sale year) / CII of purchase year. This effectively reduces your taxable gain, especially for assets held over many years. Our calculator automatically applies indexation for long-term debt and real estate.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">5. How to Use This Calculator</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Select asset type (Equity, Debt, or Real Estate).</li>
            <li>Enter purchase and sale financial years (dropdowns).</li>
            <li>Input purchase price, sale price, and any associated expenses.</li>
            <li>For real estate, add cost of improvements (renovation, extension).</li>
            <li>The calculator instantly shows gross gain, taxable gain, tax liability, and after-tax proceeds.</li>
            <li>View the pie chart (cost vs gain vs tax) and holding period impact chart.</li>
            <li>Download the PDF report for tax filing or record keeping.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">6. Practical Examples</h3>
          <p className="text-gray-600">
            <strong>Example 1 – Equity LTCG:</strong> Bought shares for ₹1,00,000 in 2020, sold for ₹2,50,000 in 2025 (holding {`>`}1 year). Gain = ₹1,50,000. Exempt ₹1,00,000, taxable gain = ₹50,000. Tax = 10% of ₹50,000 = ₹5,000.<br />
            <strong>Example 2 – Real Estate with Indexation:</strong> Bought house for ₹50,00,000 in 2010, sold for ₹1,20,00,000 in 2025. CII 2010=167, 2025=378. Indexed cost = 50L × 378/167 = ₹1,13,17,365. Taxable gain = 1,20,00,000 - 1,13,17,365 = ₹6,82,635. Tax @20% = ₹1,36,527.<br />
            <strong>Example 3 – Debt Fund STCG:</strong> Investment of ₹2,00,000 redeemed within 2 years with gain of ₹30,000. Added to income, taxed as per slab (say 30% = ₹9,000).
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">7. Exemptions and Deductions</h3>
          <p className="text-gray-600">
            - <strong>Section 54:</strong> Exemption on LTCG from sale of residential house if invested in another house (within 2 years purchase or 3 years construction).<br />
            - <strong>Section 54EC:</strong> Exemption up to ₹50 lakhs by investing in specified bonds (REC, NHAI) within 6 months.<br />
            - <strong>Section 54F:</strong> Exemption on LTCG from any asset (other than house) if sale proceeds invested in a residential house.<br />
            - <strong>Basic exemption limit:</strong> For individuals, LTCG from equity above ₹1 lakh only taxable; no exemption for other assets.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">8. Strategies to Minimize Capital Gains Tax</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Hold assets for long term to qualify for indexation (debt/real estate) or lower rates (equity).</li>
            <li>Utilize the ₹1 lakh LTCG exemption on equity each year (tax harvesting).</li>
            <li>Invest gains in specified bonds or real estate under sections 54/54EC/54F.</li>
            <li>Offset gains with capital losses (short-term losses can be set off against any gains).</li>
            <li>Consider gifting assets to family members in lower tax brackets.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">9. Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div><strong className="text-gray-800">Q1. Is indexation applicable for equity LTCG?</strong><p className="text-gray-600">No, equity LTCG does not get indexation benefit. Tax is 10% on gains above ₹1 lakh without indexation.</p></div>
            <div><strong className="text-gray-800">Q2. What if I sell an asset at a loss?</strong><p className="text-gray-600">Capital losses can be set off against capital gains. Short-term losses can offset any gains; long-term losses only against long-term gains. Unabsorbed losses can be carried forward for 8 years.</p></div>
            <div><strong className="text-gray-800">Q3. Are dividends taxable as capital gains?</strong><p className="text-gray-600">No, dividends are taxed separately as "Income from Other Sources" (or as part of total income).</p></div>
            <div><strong className="text-gray-800">Q4. How accurate is the CII index used?</strong><p className="text-gray-600">We use official CII values up to 2024-25 and projected for later years. For actual filing, use the latest CII from Income Tax department.</p></div>
            <div><strong className="text-gray-800">Q5. Does this calculator include cess and surcharge?</strong><p className="text-gray-600">For simplicity, it shows basic tax rate. Actual tax may include 4% health & education cess, and surcharge for high income (10-37%).</p></div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">10. Final Thoughts</h3>
          <p className="text-gray-600">
            Capital gains tax planning should be an integral part of your investment strategy. By understanding the holding periods, indexation benefits, and available exemptions, you can significantly reduce your tax outflow and increase after-tax returns. Our Capital Gains Calculator empowers you to simulate different scenarios before selling an asset.
          </p>
          <p className="text-gray-600 mt-4">
            <strong>Start using the Capital Gains Calculator above now.</strong> Plan your asset sales, minimize taxes, and keep more of your hard-earned money. Remember to consult a tax advisor for personalized advice.
          </p>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: The calculations are for illustrative purposes only. Tax laws are subject to change. Please consult a qualified tax professional for accurate filing.
          </div>
        </div>
      </div>
    </div>
  );
}

function formatCompactCurrency(value: number): string {
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(1)}Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(1)}L`;
  if (value >= 1e3) return `₹${(value / 1e3).toFixed(0)}K`;
  return `₹${value}`;
}