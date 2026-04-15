'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
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

const formatPercent = (value: number): string => {
  return value.toFixed(2) + '%';
};

// --- Main Component ---
export default function ProfitMarginCalculator() {
  // State
  const [costPrice, setCostPrice] = useState<number>(500);
  const [sellingPrice, setSellingPrice] = useState<number>(750);
  const [quantity, setQuantity] = useState<number>(100);
  const [includeTax, setIncludeTax] = useState<boolean>(false);
  const [taxRate, setTaxRate] = useState<number>(18);

  // Calculations
  const totalCost = costPrice * quantity;
  const totalRevenue = sellingPrice * quantity;
  const grossProfit = totalRevenue - totalCost;
  const profitMargin = (grossProfit / totalRevenue) * 100;
  const markupPercentage = ((sellingPrice - costPrice) / costPrice) * 100;
  const costPlusPrice = costPrice * (1 + markupPercentage / 100);

  // Tax adjustments
  const taxAmount = includeTax ? (totalRevenue * taxRate) / 100 : 0;
  const netProfit = grossProfit - taxAmount;
  const netProfitMargin = (netProfit / totalRevenue) * 100;

  // Data for charts
  const costBreakdownData = [
    { name: 'Total Cost', value: totalCost, color: '#EF4444' },
    { name: 'Gross Profit', value: grossProfit, color: '#10B981' },
  ];

  const revenueAllocationData = [
    { name: 'Cost of Goods Sold', value: totalCost, color: '#F59E0B' },
    { name: 'Gross Profit', value: grossProfit, color: '#10B981' },
  ];

  if (includeTax) {
    revenueAllocationData.push({ name: 'Tax (GST)', value: taxAmount, color: '#3B82F6' });
  }

  // Scenario analysis data (for line chart: profit margin at different selling prices)
  const scenarioData = useMemo(() => {
    const data = [];
    const basePrice = costPrice;
    for (let multiplier = 1; multiplier <= 2; multiplier += 0.1) {
      const sp = basePrice * multiplier;
      const profit = (sp - costPrice) * quantity;
      const margin = ((sp - costPrice) / sp) * 100;
      data.push({
        sellingPrice: sp,
        profit,
        margin,
      });
    }
    return data;
  }, [costPrice, quantity]);

  // PDF Ref & Handler
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

 const handleDownloadPDF = async () => {
       setIsGeneratingPDF(true); // keep loading state if needed, or rename to setIsDownloading
       try {
         // Prepare the data array for download (adjust based on your actual data structure)
         const downloadData = [
          { metric: 'Cost Price', value: formatCurrency(costPrice) },
          { metric: 'Selling Price', value: formatCurrency(sellingPrice) },
          { metric: 'Quantity', value: quantity },
          { metric: 'Include Tax', value: includeTax ? 'Yes' : 'No' },
          { metric: 'Tax Rate', value: taxRate + '%' },
          { metric: 'Total Cost', value: formatCurrency(totalCost) },
          { metric: 'Total Revenue', value: formatCurrency(totalRevenue) },
          { metric: 'Gross Profit', value: formatCurrency(grossProfit) },
          { metric: 'Profit Margin', value: formatPercent(profitMargin) },
          { metric: 'Markup Percentage', value: formatPercent(markupPercentage) },
          { metric: 'Cost + Markup', value: formatCurrency(costPlusPrice) },
          { metric: 'Net Profit', value: formatCurrency(netProfit) },
          { metric: 'Net Profit Margin', value: formatPercent(netProfitMargin) },
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
    alert(`📊 Profit Margin Summary:\nTotal Revenue: ${formatCurrency(totalRevenue)}\nTotal Cost: ${formatCurrency(totalCost)}\nGross Profit: ${formatCurrency(grossProfit)}\nProfit Margin: ${profitMargin.toFixed(2)}%\nMarkup: ${markupPercentage.toFixed(2)}%\n${includeTax ? `Tax (${taxRate}%): ${formatCurrency(taxAmount)}\nNet Profit: ${formatCurrency(netProfit)}\nNet Margin: ${netProfitMargin.toFixed(2)}%` : ''}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
            Profit Margin Calculator
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Calculate gross profit, margin percentage, markup, and net profit after tax. Essential for businesses, retailers, and entrepreneurs to price products optimally.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT PANEL: Input Controls */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-blue-600 rounded-full"></span>
              Cost & Revenue Details
            </h2>

            {/* Cost Price */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Cost Price per Unit (₹)</label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                step="10"
                min="0"
              />
              <input
                type="range"
                min="0"
                max="5000"
                step="10"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full mt-2 accent-blue-600"
              />
            </div>

            {/* Selling Price */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Selling Price per Unit (₹)</label>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                step="10"
                min="0"
              />
              <input
                type="range"
                min="0"
                max="10000"
                step="10"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full mt-2 accent-green-600"
              />
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Quantity Sold</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                step="1"
                min="1"
              />
              <input
                type="range"
                min="1"
                max="10000"
                step="50"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>

            {/* Tax Toggle */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="checkbox"
                  id="includeTax"
                  checked={includeTax}
                  onChange={(e) => setIncludeTax(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="includeTax" className="text-gray-700 font-semibold">Include Tax (GST)</label>
              </div>
              {includeTax && (
                <div className="mt-2">
                  <label className="text-gray-600 text-sm block mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                    step="1"
                    min="0"
                    max="28"
                  />
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
              💡 Your current markup is <strong>{markupPercentage.toFixed(2)}%</strong>. A healthy profit margin varies by industry – retail 5-20%, software 70-90%, manufacturing 10-30%.
            </div>
          </div>

          {/* RIGHT PANEL: Report & Charts (PDF Area) */}
          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Profit Margin Report</h2>
              <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN')}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 text-center">
                <p className="text-slate-600 text-xs">Total Revenue</p>
                <p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 text-center">
                <p className="text-red-600 text-xs">Total Cost</p>
                <p className="text-xl font-bold">{formatCurrency(totalCost)}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center">
                <p className="text-green-600 text-xs">Gross Profit</p>
                <p className="text-xl font-bold">{formatCurrency(grossProfit)}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
                <p className="text-blue-600 text-xs">Profit Margin</p>
                <p className="text-xl font-bold">{profitMargin.toFixed(2)}%</p>
                <p className="text-xs">Markup: {markupPercentage.toFixed(2)}%</p>
              </div>
            </div>

            {includeTax && (
              <div className="bg-amber-50 rounded-lg p-3 mb-4 text-center">
                <p className="text-amber-700 text-sm">Tax Amount: {formatCurrency(taxAmount)} | Net Profit: {formatCurrency(netProfit)} | Net Margin: {netProfitMargin.toFixed(2)}%</p>
              </div>
            )}

            {/* Pie Chart: Cost vs Gross Profit */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Revenue Breakdown</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueAllocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                    >
                      {revenueAllocationData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart: Total Cost vs Gross Profit */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Cost vs Profit (Total)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costBreakdownData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} width={70} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="value" name="Amount" fill="#8884d8" radius={[8, 8, 0, 0]}>
                      {costBreakdownData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scenario Line Chart: Profit Margin vs Selling Price */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Scenario Analysis: Margin vs Selling Price</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scenarioData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sellingPrice" tickFormatter={(v) => `₹${v}`} />
                    <YAxis yAxisId="left" tickFormatter={(v) => formatPercent(v)} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => formatCompactCurrency(v)} />
                    <Tooltip formatter={(value: any, name: any) => name === 'margin' ? formatPercent(value) : formatCurrency(value)} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="margin" name="Profit Margin %" stroke="#10B981" strokeWidth={3} />
                    <Line yAxisId="right" type="monotone" dataKey="profit" name="Total Profit" stroke="#3B82F6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">*As selling price increases, profit margin rises (green line) and total profit increases (blue line).</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={handleCalculate} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:scale-105 transition">
                Calculate Profit →
              </button>
              <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="px-6 py-2 border-2 border-blue-600 text-blue-700 rounded-xl hover:bg-blue-50 disabled:opacity-50">
                {isGeneratingPDF ? 'Generating...' : '📄 Download PDF Report'}
              </button>
            </div>
          </div>
        </div>

        {/* ========== 5000+ WORDS SEO CONTENT SECTION ========== */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/50 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to Profit Margin Calculator: Master Your Business Pricing</h2>
          <p className="text-gray-600 leading-relaxed">
            Profit margin is the lifeblood of any business. Whether you run a small retail shop, an e-commerce store, a manufacturing unit, or a software company, understanding your profit margins is essential for survival and growth. The <strong>Profit Margin Calculator</strong> helps you determine how much profit you make per unit, overall profitability, and how pricing changes affect your bottom line.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            Our interactive <strong>Profit Margin Calculator</strong> above lets you input cost price, selling price, quantity, and optional tax. It instantly computes gross profit, profit margin percentage, markup, and net profit after tax. You can visualise revenue breakdown, cost vs profit, and run scenario analysis to see how different selling prices impact your margins. This comprehensive guide covers everything from basic formulas to advanced pricing strategies, industry benchmarks, and tax implications.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">1. Understanding Profit Margin – The Key Formulas</h3>
          <p className="text-gray-600">
            <strong>Gross Profit</strong> = Revenue – Cost of Goods Sold (COGS)<br />
            <strong>Profit Margin (%)</strong> = (Gross Profit / Revenue) × 100<br />
            <strong>Markup (%)</strong> = ((Selling Price – Cost Price) / Cost Price) × 100<br />
            <strong>Net Profit Margin</strong> = (Net Profit / Revenue) × 100 (after taxes and expenses)
          </p>
          <p className="text-gray-600 mt-2">
            Example: If a product costs ₹500 to make and sells for ₹750, gross profit = ₹250, profit margin = 33.33%, markup = 50%. A common mistake is confusing markup with margin – they are different! Markup is based on cost, margin on selling price.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">2. Why Profit Margin Matters for Every Business</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Pricing decisions:</strong> Know the minimum price to avoid losses.</li>
            <li><strong>Competitive analysis:</strong> Compare your margins with industry averages.</li>
            <li><strong>Investor confidence:</strong> Investors look for healthy, sustainable margins.</li>
            <li><strong>Cost control:</strong> Low margins signal need to reduce costs.</li>
            <li><strong>Scalability:</strong> High-margin businesses scale more efficiently.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">3. Types of Profit Margins Explained</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Gross Profit Margin:</strong> Revenue minus direct costs (materials, labour). Our calculator focuses on this.</li>
            <li><strong>Operating Profit Margin:</strong> Gross profit minus operating expenses (rent, salaries, marketing).</li>
            <li><strong>Net Profit Margin:</strong> After all expenses, interest, and taxes – the true bottom line.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">4. Industry Benchmarks – What is a Good Profit Margin?</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Retail (grocery):</strong> 1-3% (very low margin, high volume).</li>
            <li><strong>Apparel retail:</strong> 4-13%.</li>
            <li><strong>Restaurants:</strong> 3-9% (after operating costs).</li>
            <li><strong>Manufacturing:</strong> 5-20% depending on industry.</li>
            <li><strong>Software/SaaS:</strong> 70-90% gross margin, 20-30% net margin.</li>
            <li><strong>Professional services (consulting):</strong> 10-30%.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">5. Markup vs Margin – Don't Confuse Them!</h3>
          <p className="text-gray-600">
            Many business owners set prices based on markup (e.g., add 50% to cost). But if your cost is ₹100 and you add 50% markup, selling price = ₹150, giving a profit margin of 33.3%. If you want a 50% margin, you need 100% markup (sell at ₹200). Our calculator shows both, so you can decide which strategy suits your business.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">6. How to Use the Profit Margin Calculator for Strategic Pricing</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Break-even analysis:</strong> Find selling price where profit = 0.</li>
            <li><strong>Volume discounts:</strong> Increase quantity to see if higher volume at lower margin is profitable.</li>
            <li><strong>Product mix:</strong> Calculate margin for each product to focus on high-margin items.</li>
            <li><strong>Tax planning:</strong> Include GST to see net profit after tax.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">7. Impact of Tax on Profit Margin</h3>
          <p className="text-gray-600">
            In India, GST is collected on selling price but paid to the government. For B2C sales, GST reduces your net profit because you collect tax but don't keep it. Our calculator allows you to toggle GST inclusion, showing net profit after tax. For example, a 33.3% gross margin becomes 28.2% net margin after 18% GST (depending on input tax credit). Businesses with input tax credit may have different calculations.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">8. Scenario Analysis – How Price Changes Affect Profit</h3>
          <p className="text-gray-600">
            Our scenario chart shows profit margin and total profit at different selling prices. Notice that margin increases with price, but total profit increases even faster. However, higher prices may reduce quantity sold. The ideal price balances margin with volume – known as price elasticity. Use this calculator to simulate various price points before committing.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">9. Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div>
              <strong className="text-gray-800">Q1. What is a healthy profit margin for a small business?</strong>
              <p className="text-gray-600">A net profit margin of 10-20% is considered healthy for most small businesses. However, it varies by industry – e-commerce may aim for 5-10%, while consulting firms target 20-30%.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q2. Is a higher profit margin always better?</strong>
              <p className="text-gray-600">Not necessarily. Very high margins can attract competition, and you might lose market share if prices are too high. A sustainable margin that allows growth and customer satisfaction is ideal.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q3. How can I improve my profit margin?</strong>
              <p className="text-gray-600">Increase selling price (if market allows), reduce cost of goods sold (negotiate with suppliers), increase operational efficiency, or add higher-margin products/services.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q4. Does the calculator include operating expenses like rent, salaries?</strong>
              <p className="text-gray-600">No, this calculator focuses on gross profit (revenue minus direct costs). For net profit, you would need to subtract operating expenses separately. We provide net profit after tax only.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q5. How to download the profit margin report?</strong>
              <p className="text-gray-600">Click the “Download PDF Report” button. It captures all charts, inputs, and summary numbers.</p>
            </div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">10. Real-World Examples</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Example 1 (Retail):</strong> A phone case costs ₹200 to manufacture, sold at ₹500. Profit = ₹300, margin = 60%, markup = 150%. Very healthy.</li>
            <li><strong>Example 2 (Manufacturing):</strong> A chair costs ₹1500 in materials + labour, sold at ₹2500. Profit = ₹1000, margin = 40%, markup = 66.7%.</li>
            <li><strong>Example 3 (Restaurant):</strong> A dish costs ₹120 to prepare, sold at ₹300. Gross profit = ₹180, margin = 60%. But after rent, salaries, utilities, net margin may be only 10%.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">11. Advanced Pricing Strategies</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Cost-plus pricing:</strong> Add a fixed markup to cost – simple but ignores demand.</li>
            <li><strong>Value-based pricing:</strong> Price based on perceived value to customer, often yielding higher margins.</li>
            <li><strong>Dynamic pricing:</strong> Adjust prices based on demand, competition (e.g., airlines, hotels).</li>
            <li><strong>Psychological pricing:</strong> ₹999 instead of ₹1000 can increase sales without hurting margin much.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">12. Final Thoughts: Master Your Margins, Grow Your Business</h3>
          <p className="text-gray-600">
            The Profit Margin Calculator is more than a number-crunching tool – it's a strategic compass. Regularly calculate your margins for each product, service, or customer segment. Combine it with break-even analysis and customer lifetime value to make informed decisions. Remember, profit is not just about revenue; it's about what you keep after costs.
          </p>
          <p className="text-gray-600 mt-4">
            <strong>Start using the Profit Margin Calculator above now</strong> – optimise your pricing, increase profitability, and take your business to the next level!
          </p>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: This calculator provides estimates for gross profit and margin. Actual business profitability depends on many factors including operating expenses, taxes, and market conditions. Consult a financial advisor for detailed analysis.
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function for compact currency on YAxis
function formatCompactCurrency(value: number): string {
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(1)}Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(0)}L`;
  if (value >= 1e3) return `₹${(value / 1e3).toFixed(0)}K`;
  return `₹${value}`;
}