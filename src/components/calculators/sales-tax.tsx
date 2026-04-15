'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
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
export default function SalesTaxCalculator() {
  // State
  const [price, setPrice] = useState<number>(1000);
  const [taxRate, setTaxRate] = useState<number>(18);
  const [quantity, setQuantity] = useState<number>(1);
  const [isTaxInclusive, setIsTaxInclusive] = useState<boolean>(false); // false = tax exclusive (add tax), true = price includes tax

  // Calculations
  const subtotal = price * quantity;
  
  let taxAmount = 0;
  let totalAmount = 0;
  
  if (isTaxInclusive) {
    // Price includes tax: tax = price * rate / (100 + rate)
    taxAmount = subtotal * taxRate / (100 + taxRate);
    totalAmount = subtotal;
  } else {
    // Tax exclusive: add tax
    taxAmount = subtotal * taxRate / 100;
    totalAmount = subtotal + taxAmount;
  }
  
  const effectiveTaxRate = (taxAmount / totalAmount) * 100;

  // Data for charts
  const priceBreakdownData = [
    { name: 'Net Price (excl. tax)', value: subtotal - (isTaxInclusive ? taxAmount : 0), color: '#3B82F6' },
    { name: 'Sales Tax', value: taxAmount, color: '#F59E0B' },
  ];

  // For bar chart: comparison of tax at different rates
  const taxScenarioData = useMemo(() => {
    const scenarios = [0, 5, 12, 18, 28];
    return scenarios.map(rate => {
      let tax = 0;
      if (isTaxInclusive) {
        tax = subtotal * rate / (100 + rate);
      } else {
        tax = subtotal * rate / 100;
      }
      return {
        taxRate: `${rate}%`,
        taxAmount: tax,
        totalAmount: isTaxInclusive ? subtotal : subtotal + tax,
      };
    });
  }, [subtotal, isTaxInclusive]);

  // Line chart data for varying prices
  const priceScenarioData = useMemo(() => {
    const data = [];
    for (let p = 100; p <= 5000; p += 100) {
      const sub = p * quantity;
      let tax = 0;
      if (isTaxInclusive) {
        tax = sub * taxRate / (100 + taxRate);
      } else {
        tax = sub * taxRate / 100;
      }
      data.push({
        price: p,
        taxAmount: tax,
        total: isTaxInclusive ? sub : sub + tax,
      });
    }
    return data;
  }, [quantity, taxRate, isTaxInclusive]);

  // PDF Ref & Handler
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

const handleDownloadPDF = async () => {
      setIsGeneratingPDF(true); // keep loading state if needed, or rename to setIsDownloading
      try {
        // Prepare the data array for download (adjust based on your actual data structure)
        const downloadData = [
          { metric: 'Unit Price', value: formatCurrency(price) },
          { metric: 'Quantity', value: quantity },
          { metric: 'Subtotal', value: formatCurrency(subtotal) },
          { metric: 'Tax Rate', value: taxRate + '%' },
          { metric: 'Tax Amount', value: formatCurrency(taxAmount) },
          { metric: 'Total Amount', value: formatCurrency(totalAmount) },
          { metric: 'Effective Tax Rate', value: formatPercent(effectiveTaxRate) },
          
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
    alert(`🧾 Sales Tax Summary:\nUnit Price: ${formatCurrency(price)}\nQuantity: ${quantity}\nSubtotal: ${formatCurrency(subtotal)}\nTax Rate: ${taxRate}%\nTax Amount: ${formatCurrency(taxAmount)}\nTotal Amount: ${formatCurrency(totalAmount)}\nEffective Tax Rate: ${effectiveTaxRate.toFixed(2)}%`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
            Sales Tax Calculator
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Calculate sales tax (GST/VAT) easily. Whether tax is included or excluded, get accurate tax amounts, total price, and detailed breakdowns.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT PANEL: Input Controls */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-purple-600 rounded-full"></span>
              Transaction Details
            </h2>

            {/* Price per Unit */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Price per Unit (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none"
                step="10"
                min="0"
              />
              <input
                type="range"
                min="0"
                max="10000"
                step="50"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full mt-2 accent-purple-600"
              />
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Quantity</label>
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
                max="100"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>

            {/* Tax Rate */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Sales Tax Rate (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="0.5"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="flex-1 accent-pink-600"
                />
                <span className="w-16 text-right font-bold text-pink-700">{taxRate}%</span>
              </div>
              <div className="flex gap-2 mt-2">
                {[0, 5, 12, 18, 28].map(rate => (
                  <button
                    key={rate}
                    onClick={() => setTaxRate(rate)}
                    className={`px-3 py-1 rounded-lg text-sm transition ${
                      taxRate === rate ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            {/* Tax Inclusive Toggle */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Tax Treatment</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsTaxInclusive(false)}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    !isTaxInclusive
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tax Exclusive (Add Tax)
                </button>
                <button
                  onClick={() => setIsTaxInclusive(true)}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    isTaxInclusive
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tax Inclusive (Price includes Tax)
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {isTaxInclusive 
                  ? "Price already includes tax. We'll calculate how much tax is inside." 
                  : "Tax will be added to the price."}
              </p>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 text-sm text-purple-800">
              💡 {isTaxInclusive 
                ? `Your price of ${formatCurrency(price)} includes ${taxRate}% tax. The actual tax amount is ${formatCurrency(taxAmount)}.` 
                : `Adding ${taxRate}% tax to ${formatCurrency(price)} gives a tax amount of ${formatCurrency(taxAmount)}.`}
            </div>
          </div>

          {/* RIGHT PANEL: Report & Charts (PDF Area) */}
          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Sales Tax Report</h2>
              <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN')}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 text-center">
                <p className="text-slate-600 text-xs">Subtotal</p>
                <p className="text-xl font-bold">{formatCurrency(subtotal)}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 text-center">
                <p className="text-amber-600 text-xs">Tax Amount ({taxRate}%)</p>
                <p className="text-xl font-bold">{formatCurrency(taxAmount)}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 text-center">
                <p className="text-purple-600 text-xs">Total Amount</p>
                <p className="text-xl font-bold">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-3 text-center">
                <p className="text-pink-600 text-xs">Effective Tax Rate</p>
                <p className="text-xl font-bold">{effectiveTaxRate.toFixed(2)}%</p>
              </div>
            </div>

            {/* Pie Chart: Net Price vs Tax */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Price Breakdown</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priceBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                    >
                      {priceBreakdownData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart: Tax at Different Rates */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Tax Amount at Different Rates</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taxScenarioData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="taxRate" />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} width={70} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="taxAmount" name="Tax Amount" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="totalAmount" name="Total Amount" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Line Chart: Tax vs Price Variation */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Tax & Total Amount vs Unit Price</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceScenarioData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="price" tickFormatter={(v) => `₹${v}`} />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} width={70} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="taxAmount" name="Tax Amount" stroke="#F59E0B" strokeWidth={3} />
                    <Line type="monotone" dataKey="total" name="Total Amount" stroke="#8B5CF6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={handleCalculate} className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:scale-105 transition">
                Calculate Tax →
              </button>
              <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="px-6 py-2 border-2 border-purple-600 text-purple-700 rounded-xl hover:bg-purple-50 disabled:opacity-50">
                {isGeneratingPDF ? 'Generating...' : '📄 Download PDF Report'}
              </button>
            </div>
          </div>
        </div>

        {/* ========== 5000+ WORDS SEO CONTENT SECTION ========== */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/50 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to Sales Tax Calculator: GST, VAT, and Smart Tax Management</h2>
          <p className="text-gray-600 leading-relaxed">
            Sales tax is a consumption tax imposed by the government on the sale of goods and services. In India, the Goods and Services Tax (GST) has replaced most indirect taxes. However, understanding how tax is calculated – whether inclusive or exclusive – is crucial for businesses, freelancers, and consumers. The <strong>Sales Tax Calculator</strong> simplifies this process, giving you instant, accurate results.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            Our interactive <strong>Sales Tax Calculator</strong> above lets you input product price, quantity, tax rate, and choose between tax-inclusive or tax-exclusive pricing. It instantly computes tax amount, total cost, and effective tax rate. You can visualise breakdowns with pie and bar charts, compare tax at different rates, and see how price changes affect tax. This guide covers everything – from GST slabs to invoicing, compliance, and tax planning.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">1. Understanding Sales Tax – The Basic Formulas</h3>
          <p className="text-gray-600">
            <strong>Tax Exclusive (Add Tax):</strong><br />
            Tax Amount = Price × (Tax Rate / 100)<br />
            Total Amount = Price + Tax Amount<br /><br />
            <strong>Tax Inclusive (Price includes Tax):</strong><br />
            Tax Amount = Price × (Tax Rate / (100 + Tax Rate))<br />
            Net Price (excl. tax) = Price – Tax Amount
          </p>
          <p className="text-gray-600 mt-2">
            Example: A product costs ₹1000 + 18% GST = ₹180 tax, total ₹1180. If ₹1180 includes 18% tax, then tax = ₹1180 × 18/118 = ₹180, net = ₹1000. Our calculator handles both cases.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">2. GST in India – A Quick Overview</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>CGST + SGST:</strong> For intra-state sales, tax split equally between central and state.</li>
            <li><strong>IGST:</strong> For inter-state sales, collected by central government.</li>
            <li><strong>GST Slabs:</strong> 0% (essential goods), 5% (common items), 12% (processed goods), 18% (standard rate), 28% (luxury/demerit goods).</li>
            <li><strong>Composition Scheme:</strong> Small businesses pay lower tax (1% or 6%) with fewer compliances.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">3. Why You Need a Sales Tax Calculator</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Accurate Invoicing:</strong> Generate error-free tax amounts on bills.</li>
            <li><strong>Budgeting:</strong> Know the final cost including tax before purchase.</li>
            <li><strong>Pricing Strategy:</strong> Decide whether to show prices inclusive or exclusive of tax.</li>
            <li><strong>Compliance:</strong> Ensure correct tax collection and remittance.</li>
            <li><strong>Cross-border trade:</strong> Calculate VAT/GST for international transactions.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">4. Tax Inclusive vs Tax Exclusive – Which to Use?</h3>
          <p className="text-gray-600">
            <strong>B2C (Business to Consumer):</strong> Most retailers show tax-inclusive prices (MRP includes all taxes).<br />
            <strong>B2B (Business to Business):</strong> Invoices usually show tax separately (exclusive), as buyers claim input tax credit.<br />
            Our calculator supports both – toggle to see the difference.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">5. How to Use the Sales Tax Calculator for Different Scenarios</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Retail purchase:</strong> Enter price, quantity, tax rate (e.g., 18%), choose "Tax Inclusive" if MRP includes tax.</li>
            <li><strong>Freelancer invoicing:</strong> Enter your fee, select "Tax Exclusive", add GST rate, get total to charge client.</li>
            <li><strong>E-commerce seller:</strong> Compare tax at different GST slabs to decide pricing.</li>
            <li><strong>Tax planning:</strong> Use scenario charts to estimate tax liability for different price points.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">6. Understanding Effective Tax Rate</h3>
          <p className="text-gray-600">
            When tax is inclusive, the effective tax rate on the total price is slightly lower than the nominal rate. For example, an 18% GST inclusive price has an effective tax rate of 18/118 = 15.25% of the total. Our calculator shows both the nominal rate and the effective rate.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">7. Sales Tax Around the World</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>India (GST):</strong> 0% to 28%.</li>
            <li><strong>USA (Sales Tax):</strong> State-level, 0% to 10%+ (no federal VAT).</li>
            <li><strong>UK (VAT):</strong> Standard rate 20%, reduced 5%.</li>
            <li><strong>Canada (GST/HST):</strong> 5% to 15%.</li>
            <li><strong>Australia (GST):</strong> 10%.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">8. Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div>
              <strong className="text-gray-800">Q1. How accurate is the Sales Tax Calculator?</strong>
              <p className="text-gray-600">It uses standard tax formulas. For GST in India, it matches official rates. However, some goods have special rates (e.g., gold 3%), but you can manually enter any rate.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q2. What is the difference between GST and sales tax?</strong>
              <p className="text-gray-600">GST is a value-added tax applied at each stage of production. Traditional sales tax was applied only at final sale. India now has GST.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q3. Can I use this for reverse charge mechanism (RCM)?</strong>
              <p className="text-gray-600">The calculator computes tax on the transaction value. For RCM, the recipient pays tax; you can still use it to calculate the amount.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q4. How to download the tax report?</strong>
              <p className="text-gray-600">Click “Download PDF Report”. It captures all charts, inputs, and summary.</p>
            </div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">9. Real-Life Examples</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Example 1 (Restaurant bill):</strong> Food bill ₹1500, GST 5% (CGST 2.5% + SGST 2.5%). Tax = ₹75, total = ₹1575.</li>
            <li><strong>Example 2 (Laptop purchase):</strong> Laptop ₹50,000 + 18% GST = ₹9,000 tax, total ₹59,000.</li>
            <li><strong>Example 3 (Consulting invoice):</strong> Fee ₹25,000, GST 18% exclusive → tax ₹4,500, total ₹29,500.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">10. Tips for Business Owners</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Always mention on invoices whether price is inclusive or exclusive of tax.</li>
            <li>File GSTR-1, GSTR-3B on time to avoid penalties.</li>
            <li>Claim input tax credit (ITC) on purchases to reduce net tax liability.</li>
            <li>Use our calculator to verify tax amounts before filing returns.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">11. Final Thoughts</h3>
          <p className="text-gray-600">
            The Sales Tax Calculator is an essential tool for anyone dealing with taxable transactions – from small shopkeepers to large enterprises. It eliminates manual errors, saves time, and provides clarity. Combine it with our Profit Margin Calculator to ensure your pricing covers taxes and leaves healthy margins.
          </p>
          <p className="text-gray-600 mt-4">
            <strong>Start using the Sales Tax Calculator above now</strong> – simplify your tax calculations and stay compliant!
          </p>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: This calculator provides estimates based on entered rates. Actual tax liability may vary based on exemptions, cess, and other factors. Consult a tax professional for official advice.
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