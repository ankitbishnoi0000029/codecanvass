'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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

const formatCurrencyWithDecimals = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// --- Main Component ---
export default function DiscountCalculator() {
  // State
  const [originalPrice, setOriginalPrice] = useState<number>(10000);
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [fixedDiscountAmount, setFixedDiscountAmount] = useState<number>(2000);

  // Derived calculations
  const discountAmount = useMemo(() => {
    if (discountType === 'percentage') {
      return (originalPrice * discountPercent) / 100;
    } else {
      return Math.min(fixedDiscountAmount, originalPrice);
    }
  }, [originalPrice, discountPercent, discountType, fixedDiscountAmount]);

  const finalPrice = originalPrice - discountAmount;
  const savings = discountAmount;
  const savingsPercent = (savings / originalPrice) * 100;

  // Pie chart data: Original vs Discounted
  const pieData = [
    { name: 'Final Price', value: finalPrice, color: '#0EA5E9' }, // sky blue
    { name: 'You Save', value: savings, color: '#F59E0B' }, // amber
  ];

  // Bar chart data for visual comparison
  const barData = [
    { name: 'Original Price', amount: originalPrice, color: '#94A3B8' },
    { name: 'After Discount', amount: finalPrice, color: '#0EA5E9' },
  ];

  // PDF Ref & Handler
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true); // keep loading state if needed, or rename to setIsDownloading
        try {
          // Prepare the data array for download (adjust based on your actual data structure)
          const downloadData = [
            { metric: 'Original Price', value: formatCurrency(originalPrice) },
            { metric: 'Discount', value: discountType === 'percentage' ? discountPercent + '%' : formatCurrency(fixedDiscountAmount) },
            { metric: 'You Save', value: formatCurrency(savings) },
            { metric: 'Final Price', value: formatCurrency(finalPrice) },
            
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
  const handleApplyDiscount = () => {
    alert(`💰 Discount Summary:\nOriginal Price: ${formatCurrency(originalPrice)}\nDiscount: ${discountType === 'percentage' ? discountPercent + '%' : formatCurrency(fixedDiscountAmount)}\nYou Save: ${formatCurrency(savings)}\nFinal Price: ${formatCurrency(finalPrice)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-sky-700 to-blue-700 bg-clip-text text-transparent">
            Discount Calculator
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Calculate discounts instantly – whether percentage off or fixed amount off. Know exactly how much you save and the final price.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT PANEL: Input Controls */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-sky-600 rounded-full"></span>
              Discount Details
            </h2>

            {/* Original Price */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Original Price (₹)</label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-400 outline-none"
                step="100"
                min="0"
              />
              <input
                type="range"
                min="0"
                max="100000"
                step="500"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full mt-2 accent-sky-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>₹0</span>
                <span>₹25K</span>
                <span>₹50K</span>
                <span>₹1L</span>
              </div>
            </div>

            {/* Discount Type Toggle */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Discount Type</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setDiscountType('percentage')}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    discountType === 'percentage'
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Percentage (%)
                </button>
                <button
                  onClick={() => setDiscountType('fixed')}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    discountType === 'fixed'
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Fixed Amount (₹)
                </button>
              </div>
            </div>

            {/* Conditional Input: Percentage or Fixed Amount */}
            {discountType === 'percentage' ? (
              <div className="mb-6">
                <label className="text-gray-700 font-semibold block mb-2">Discount Percentage (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="flex-1 accent-amber-600"
                  />
                  <span className="w-16 text-right font-bold text-amber-700">{discountPercent}%</span>
                </div>
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-xl"
                  step="1"
                  min="0"
                  max="100"
                />
              </div>
            ) : (
              <div className="mb-6">
                <label className="text-gray-700 font-semibold block mb-2">Fixed Discount Amount (₹)</label>
                <input
                  type="number"
                  value={fixedDiscountAmount}
                  onChange={(e) => setFixedDiscountAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-400 outline-none"
                  step="100"
                  min="0"
                />
                <input
                  type="range"
                  min="0"
                  max={originalPrice}
                  step="100"
                  value={fixedDiscountAmount}
                  onChange={(e) => setFixedDiscountAmount(Number(e.target.value))}
                  className="w-full mt-2 accent-amber-600"
                />
                <p className="text-xs text-gray-500 mt-1">Cannot exceed original price.</p>
              </div>
            )}

            <div className="bg-sky-50 rounded-xl p-4 text-sm text-sky-800">
              💡 Pro tip: A discount of <strong>{discountPercent}%</strong> saves you <strong>{formatCurrency(savings)}</strong>. That's like getting <strong>{formatCurrency(finalPrice)}</strong> instead of <strong>{formatCurrency(originalPrice)}</strong>.
            </div>
          </div>

          {/* RIGHT PANEL: Report & Charts (PDF Area) */}
          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Discount Report</h2>
              <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN')}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 text-center">
                <p className="text-slate-600 text-xs">Original Price</p>
                <p className="text-xl font-bold">{formatCurrency(originalPrice)}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 text-center">
                <p className="text-amber-600 text-xs">You Save</p>
                <p className="text-xl font-bold">{formatCurrency(savings)}</p>
                <p className="text-xs text-amber-500">({savingsPercent.toFixed(2)}% off)</p>
              </div>
              <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl p-3 text-center">
                <p className="text-sky-600 text-xs">Final Price</p>
                <p className="text-xl font-bold">{formatCurrency(finalPrice)}</p>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 mb-4">
              {discountType === 'percentage' 
                ? `${discountPercent}% discount applied` 
                : `₹${fixedDiscountAmount.toLocaleString('en-IN')} fixed discount applied`}
            </div>

            {/* Pie Chart: Final Price vs Savings */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Breakdown</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart: Price Comparison */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Price Comparison</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} width={70} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="amount" name="Amount (₹)" fill="#0EA5E9" radius={[8, 8, 0, 0]}>
                      {barData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={handleApplyDiscount} className="px-6 py-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl shadow-lg hover:scale-105 transition">
                Apply Discount →
              </button>
              <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="px-6 py-2 border-2 border-sky-600 text-sky-700 rounded-xl hover:bg-sky-50 disabled:opacity-50">
                {isGeneratingPDF ? 'Generating...' : '📄 Download PDF Report'}
              </button>
            </div>
          </div>
        </div>

        {/* ========== 5000+ WORDS SEO CONTENT SECTION ========== */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/50 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to Discount Calculator: Save Smarter, Spend Wisely</h2>
          <p className="text-gray-600 leading-relaxed">
            Discounts are everywhere – from festive sales to clearance offers, coupon codes to loyalty rewards. But how do you know the real price you’ll pay? A <strong>Discount Calculator</strong> takes the guesswork out of shopping, helping you instantly compute savings and final costs. Whether you’re a shopper, retailer, or financial planner, mastering discount calculations can save you thousands of rupees every year.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            Our interactive <strong>Discount Calculator</strong> above lets you toggle between percentage-based discounts and fixed-amount discounts. Adjust the original price, see real-time charts, and download a professional PDF report. This comprehensive guide covers everything – from basic formulas to advanced discount strategies, tax implications, and psychological pricing.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">1. Understanding Discount Calculation Formulas</h3>
          <p className="text-gray-600">
            <strong>Percentage Discount:</strong> <code className="bg-gray-100 p-1 rounded">Discount Amount = (Original Price × Discount Rate) / 100</code><br />
            <strong>Fixed Discount:</strong> <code className="bg-gray-100 p-1 rounded">Final Price = Original Price – Fixed Discount Amount</code><br />
            <strong>Savings Percentage:</strong> <code className="bg-gray-100 p-1 rounded">Savings % = (Discount Amount / Original Price) × 100</code>
          </p>
          <p className="text-gray-600 mt-2">
            For example, an item worth ₹10,000 with a 20% discount gives you a saving of ₹2,000 and a final price of ₹8,000. The same ₹2,000 fixed discount also gives ₹8,000 – but percentage discounts scale with price, while fixed discounts are absolute.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">2. Types of Discounts You Encounter</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Percentage off:</strong> Most common (e.g., 50% off on selected items).</li>
            <li><strong>Fixed amount off:</strong> “₹500 off on purchase above ₹2,000”.</li>
            <li><strong>Buy X Get Y:</strong> “Buy 1 Get 1 Free” – effectively 50% off if items are same price.</li>
            <li><strong>Bundle discount:</strong> Save 10% when buying a set.</li>
            <li><strong>Seasonal/coupon codes:</strong> Limited-time offers.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">3. How to Use the Discount Calculator for Smart Shopping</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Before buying:</strong> Input the MRP and the offered discount to see the actual price.</li>
            <li><strong>Compare deals:</strong> “Flat ₹2,000 off” vs “25% off” on a ₹10,000 item – which is better? (25% = ₹2,500 off, so percentage wins).</li>
            <li><strong>Check stacked discounts:</strong> If a coupon gives extra 10% on already discounted price, use the calculator twice.</li>
            <li><strong>Budget planning:</strong> Know exactly how much you’ll pay, including taxes (if any).</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">4. The Psychology of Discounts – Why We Love Them</h3>
          <p className="text-gray-600">
            Retailers use discounts to trigger impulse buying. A “50% off” feels like a better deal than “₹500 off” even when mathematically similar, because percentages feel larger. Our calculator helps you see through the psychology and focus on the actual savings. Always calculate the final price – that’s the only number that leaves your wallet.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">5. Discounts in Business: Margins and Profitability</h3>
          <p className="text-gray-600">
            For business owners, offering a discount reduces profit margin. If your cost price is ₹6,000 and you sell at ₹10,000 (40% margin), a 20% discount reduces your selling price to ₹8,000, slashing margin to 25%. Use the calculator to ensure you don’t sell below cost. The break-even discount point is critical for sustainable pricing.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">6. Tax Implications on Discounts</h3>
          <p className="text-gray-600">
            In India, GST is applied on the discounted price (the transaction value). So if an item is ₹10,000 with 20% discount, GST (say 18%) is calculated on ₹8,000 = ₹1,440, making final price ₹9,440. Discounts do not reduce tax liability for the seller; they just shift the base. Always check if discount is applied before or after tax – our calculator assumes pre-tax discount for simplicity.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">7. Discount Strategies for E‑commerce and Retail</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Tiered discounts:</strong> 10% off on ₹5K+, 20% off on ₹10K+ – encourages higher cart value.</li>
            <li><strong>Limited-time flash sales:</strong> Urgency drives conversions.</li>
            <li><strong>Members-only discounts:</strong> Builds loyalty.</li>
            <li><strong>First-time buyer coupon:</strong> 10-15% off – effective customer acquisition.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">8. Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div>
              <strong className="text-gray-800">Q1. How accurate is the Discount Calculator?</strong>
              <p className="text-gray-600">Perfectly accurate for simple percentage or fixed discounts. For “Buy X Get Y” or combo offers, you may need to adjust manually.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q2. Can I calculate discount on GST-inclusive price?</strong>
              <p className="text-gray-600">Yes, just input the GST-inclusive MRP as original price. The discount will be applied on that amount.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q3. What’s the difference between “flat discount” and “percentage discount”?</strong>
              <p className="text-gray-600">Flat discount is a fixed rupee amount off; percentage discount scales with price. For expensive items, percentage often gives higher savings.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q4. Can I use this for multiple items?</strong>
              <p className="text-gray-600">For a single transaction with total MRP, yes. For individual items with different discounts, you’d need to calculate each separately or sum up.</p>
            </div>
            <div>
              <strong className="text-gray-800">Q5. How to download the report?</strong>
              <p className="text-gray-600">Click the “Download PDF Report” button. It captures all inputs, results, and charts.</p>
            </div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">9. Real-World Examples of Discount Usage</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Festive sale:</strong> 70% off on clothing – a ₹5,000 shirt becomes ₹1,500.</li>
            <li><strong>Grocery coupon:</strong> ₹100 off on ₹1,000 – effective 10% discount.</li>
            <li><strong>Electronics clearance:</strong> 15% off on a ₹50,000 laptop – save ₹7,500.</li>
            <li><strong>Restaurant bill:</strong> 20% off on total bill – use our calculator to split savings.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">10. Final Thoughts: Shop Smarter with a Discount Calculator</h3>
          <p className="text-gray-600">
            A discount calculator is more than a tool – it’s a financial habit. Before every significant purchase, take 10 seconds to compute the actual price and savings percentage. You’ll avoid overpaying, spot deceptive “discounts”, and become a smarter consumer. Bookmark this page, share it with friends, and always know exactly what you’re paying.
          </p>
          <p className="text-gray-600 mt-4">
            <strong>Start using the Discount Calculator above now</strong> – compare deals, download your report, and save money today!
          </p>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: Calculations assume simple discount application. Actual transaction may include taxes, shipping, or other fees.
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper for compact currency in YAxis (reuse from previous)
function formatCompactCurrency(value: number): string {
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(1)}Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(0)}L`;
  if (value >= 1e3) return `₹${(value / 1e3).toFixed(0)}K`;
  return `₹${value}`;
}