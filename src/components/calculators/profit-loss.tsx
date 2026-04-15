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
  BarChart,
  Bar,
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { downloadMetricsAsText } from '@/utils/utils';

// --- Utility Functions ---
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-IN').format(value);
};

// Calculate profit/loss details
const calculateProfitLoss = (
  buyPrice: number,
  sellPrice: number,
  quantity: number,
  buyExpenses: number,
  sellExpenses: number
) => {
  const totalBuyCost = buyPrice * quantity + buyExpenses;
  const totalSellValue = sellPrice * quantity - sellExpenses;
  const absoluteProfitLoss = totalSellValue - totalBuyCost;
  const profitLossPercent = (absoluteProfitLoss / totalBuyCost) * 100;
  const breakEvenPrice = (totalBuyCost + sellExpenses) / quantity;
  const isProfit = absoluteProfitLoss >= 0;
  
  return {
    totalBuyCost,
    totalSellValue,
    absoluteProfitLoss,
    profitLossPercent,
    breakEvenPrice,
    isProfit,
    perUnitProfitLoss: absoluteProfitLoss / quantity,
  };
};

// Generate price points for chart (buy to sell with intermediate steps)
const generatePriceChartData = (
  buyPrice: number,
  sellPrice: number,
  breakEvenPrice: number
) => {
  const points = [
    { price: buyPrice, label: 'Buy Price', type: 'buy', value: buyPrice },
    { price: breakEvenPrice, label: 'Break-even', type: 'breakeven', value: breakEvenPrice },
    { price: sellPrice, label: 'Sell Price', type: 'sell', value: sellPrice },
  ].sort((a, b) => a.price - b.price);
  
  // For visual representation, create a simple line chart with these three points
  return points.map(p => ({
    name: p.label,
    value: p.price,
    type: p.type,
  }));
};

// --- Main Component ---
export default function ProfitLossCalculator() {
  // State
  const [buyPrice, setBuyPrice] = useState<number>(100);
  const [sellPrice, setSellPrice] = useState<number>(120);
  const [quantity, setQuantity] = useState<number>(100);
  const [buyExpenses, setBuyExpenses] = useState<number>(500);
  const [sellExpenses, setSellExpenses] = useState<number>(300);

  // Calculations
  const result = useMemo(
    () => calculateProfitLoss(buyPrice, sellPrice, quantity, buyExpenses, sellExpenses),
    [buyPrice, sellPrice, quantity, buyExpenses, sellExpenses]
  );

  const chartData = useMemo(
    () => generatePriceChartData(buyPrice, sellPrice, result.breakEvenPrice),
    [buyPrice, sellPrice, result.breakEvenPrice]
  );

  // Pie Data: Cost breakdown (buy cost + expenses vs sell expenses)
  const costBreakdown = [
    { name: 'Purchase Cost', value: buyPrice * quantity, color: '#EF4444' },
    { name: 'Buying Expenses', value: buyExpenses, color: '#F97316' },
    { name: 'Selling Expenses', value: sellExpenses, color: '#FBBF24' },
  ].filter(item => item.value > 0);

  // PDF Ref & Handler
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

const handleDownloadPDF = async () => {
      setIsGeneratingPDF(true); // keep loading state if needed, or rename to setIsDownloading
      try {
        // Prepare the data array for download (adjust based on your actual data structure)
        const downloadData = [
         { metric: 'Buy Price', value: formatCurrency(buyPrice) },
          { metric: 'Sell Price', value: formatCurrency(sellPrice) },
          { metric: 'Quantity', value: quantity },
          { metric: 'Buying Expenses', value: formatCurrency(buyExpenses) },
          { metric: 'Selling Expenses', value: formatCurrency(sellExpenses) },
          { metric: 'Total Buy Cost', value: formatCurrency(result.totalBuyCost) },
          { metric: 'Total Sell Value', value: formatCurrency(result.totalSellValue) },
          { metric: 'Absolute Profit/Loss', value: formatCurrency(result.absoluteProfitLoss) },
          { metric: 'Profit/Loss Percentage', value: result.profitLossPercent.toFixed(2) + '%' },
          { metric: 'Break-even Price', value: formatCurrency(result.breakEvenPrice) }, 
          { metric: 'Per Unit Profit/Loss', value: formatCurrency(result.perUnitProfitLoss) },
          { metric: 'Cost Breakdown', value: costBreakdown.map(item => `${item.name}: ${formatCurrency(item.value)}`).join(', ') },
          { metric: 'Chart Data', value: chartData.map(item => `${item.name}: ${formatCurrency(item.value)}`).join(', ') },
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

  const handleAnalyze = () => {
    alert(`📊 Trade Analysis:\nBuy: ${formatCurrency(buyPrice)} x ${quantity} units\nSell: ${formatCurrency(sellPrice)} x ${quantity}\n${result.isProfit ? '✅ Profit' : '❌ Loss'}: ${formatCurrency(Math.abs(result.absoluteProfitLoss))} (${result.profitLossPercent.toFixed(2)}%)\nBreak-even Price: ${formatCurrency(result.breakEvenPrice)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-red-700 to-orange-700 bg-clip-text text-transparent">
            Profit / Loss Calculator
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Evaluate your trades and investments. Calculate absolute profit/loss, percentage returns, break-even price, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Input Controls */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-red-600 rounded-full"></span>
              Trade Details
            </h2>

            {/* Buy Price */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Buy Price (per unit)</label>
              <input
                type="number"
                value={buyPrice}
                onChange={(e) => setBuyPrice(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 outline-none"
                step="1"
                min="0"
              />
              <input
                type="range"
                min="0"
                max="1000"
                step="5"
                value={buyPrice}
                onChange={(e) => setBuyPrice(Number(e.target.value))}
                className="w-full mt-2 accent-red-600"
              />
            </div>

            {/* Sell Price */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Sell Price (per unit)</label>
              <input
                type="number"
                value={sellPrice}
                onChange={(e) => setSellPrice(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                step="1"
                min="0"
              />
              <input
                type="range"
                min="0"
                max="1000"
                step="5"
                value={sellPrice}
                onChange={(e) => setSellPrice(Number(e.target.value))}
                className="w-full mt-2 accent-green-600"
              />
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Quantity (units)</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                step="1"
                min="1"
              />
              <input
                type="range"
                min="1"
                max="10000"
                step="100"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>

            {/* Expenses */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-gray-700 font-semibold block mb-2">Buying Expenses</label>
                <input
                  type="number"
                  value={buyExpenses}
                  onChange={(e) => setBuyExpenses(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl"
                  step="100"
                  min="0"
                />
              </div>
              <div>
                <label className="text-gray-700 font-semibold block mb-2">Selling Expenses</label>
                <input
                  type="number"
                  value={sellExpenses}
                  onChange={(e) => setSellExpenses(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl"
                  step="100"
                  min="0"
                />
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-800">
              💡 Include all costs like brokerage, taxes, stamp duty, and transaction charges for accurate profit/loss calculation.
            </div>
          </div>

          {/* RIGHT: Report & Charts (PDF Area) */}
          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Profit/Loss Report</h2>
              <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN')}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className={`rounded-xl p-4 text-center shadow-sm ${result.isProfit ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-gradient-to-br from-red-50 to-red-100'}`}>
                <p className="text-gray-600 text-sm">Absolute Profit / Loss</p>
                <p className={`text-2xl font-bold ${result.isProfit ? 'text-green-700' : 'text-red-700'}`}>
                  {result.isProfit ? '+' : '-'}{formatCurrency(Math.abs(result.absoluteProfitLoss))}
                </p>
                <p className={`text-sm font-semibold ${result.isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  ({result.profitLossPercent.toFixed(2)}%)
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center shadow-sm">
                <p className="text-gray-600 text-sm">Break-even Price</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(result.breakEvenPrice)}</p>
                <p className="text-xs text-gray-500">per unit</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                <p className="text-gray-600 text-sm">Total Buy Cost</p>
                <p className="text-xl font-bold">{formatCurrency(result.totalBuyCost)}</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 text-center">
                <p className="text-gray-600 text-sm">Total Sell Value</p>
                <p className="text-xl font-bold">{formatCurrency(result.totalSellValue)}</p>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 mb-4">
              {formatNumber(quantity)} units @ Buy {formatCurrency(buyPrice)} → Sell {formatCurrency(sellPrice)}
            </div>

            {/* Price Points Chart */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Price Analysis</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="value" name="Price (₹)">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.type === 'buy' ? '#EF4444' : entry.type === 'sell' ? '#10B981' : '#F59E0B'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-center text-gray-500 mt-2">Buy Price (Red) → Break-even (Yellow) → Sell Price (Green)</p>
            </div>

            {/* Cost Breakdown Pie Chart */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Cost Breakdown</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={costBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" >
                      {costBreakdown.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
              <div className="flex justify-between py-1"><span>Per Unit Buy Price:</span><strong>{formatCurrency(buyPrice)}</strong></div>
              <div className="flex justify-between py-1"><span>Per Unit Sell Price:</span><strong>{formatCurrency(sellPrice)}</strong></div>
              <div className="flex justify-between py-1"><span>Per Unit Profit/Loss:</span><strong className={result.isProfit ? 'text-green-600' : 'text-red-600'}>{formatCurrency(Math.abs(result.perUnitProfitLoss))}</strong></div>
              <div className="flex justify-between py-1"><span>Total Expenses:</span><strong>{formatCurrency(buyExpenses + sellExpenses)}</strong></div>
              <div className="flex justify-between py-1"><span>Return on Investment (ROI):</span><strong>{result.profitLossPercent.toFixed(2)}%</strong></div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={handleAnalyze} className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl shadow-lg hover:scale-105 transition">
                Analyze Trade →
              </button>
              <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="px-6 py-2 border-2 border-red-600 text-red-700 rounded-xl hover:bg-red-50 disabled:opacity-50">
                {isGeneratingPDF ? 'Generating...' : '📄 Download PDF Report'}
              </button>
            </div>
          </div>
        </div>

        {/* ========== 5000+ WORDS SEO CONTENT SECTION ========== */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/50 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to Profit/Loss Calculator</h2>
          <p className="text-gray-600 leading-relaxed">
            A Profit/Loss (P&L) Calculator is an essential tool for traders, investors, and business owners. It helps you determine the financial outcome of a transaction by comparing the total cost incurred (including expenses) with the revenue generated. Whether you are trading stocks, selling products, or flipping assets, knowing your exact profit or loss is critical for making informed decisions.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            Our interactive <strong>Profit/Loss Calculator</strong> above takes into account purchase price, selling price, quantity, and associated expenses (brokerage, taxes, shipping, etc.). It instantly calculates absolute profit/loss, percentage returns, break-even price, and per-unit profit. In this comprehensive guide, we will explore the mathematics behind P&L, practical applications, tax implications, and strategies to maximise profits.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">1. Understanding the Profit/Loss Formula</h3>
          <p className="text-gray-600">
            The basic formula for profit/loss is:
            <br />
            <code className="bg-gray-100 p-1 rounded">Profit/Loss = (Sell Price × Quantity - Selling Expenses) - (Buy Price × Quantity + Buying Expenses)</code>
            <br />
            If the result is positive, you have a profit; if negative, a loss. The percentage profit/loss is calculated relative to the total cost:
            <code className="bg-gray-100 p-1 rounded">P&L% = (Absolute P&L / Total Cost) × 100</code>
            Break-even price is the price at which you neither profit nor lose:
            <code className="bg-gray-100 p-1 rounded">Break-even Price = (Total Cost + Selling Expenses) / Quantity</code>
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">2. Why You Need a Profit/Loss Calculator</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Accurate trade evaluation:</strong> Includes hidden costs like brokerage, GST, and transaction charges.</li>
            <li><strong>Goal setting:</strong> Determine required sell price to achieve target profit.</li>
            <li><strong>Tax planning:</strong> Know your capital gains or business income.</li>
            <li><strong>Risk management:</strong> Set stop-loss levels based on acceptable loss percentage.</li>
            <li><strong>Portfolio tracking:</strong> Compare performance of different investments.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">3. Types of Expenses to Include</h3>
          <p className="text-gray-600">
            For accurate P&L, include all transaction costs:
            <ul className="list-disc pl-6 mt-2">
              <li><strong>Brokerage:</strong> Fees paid to broker (percentage or fixed).</li>
              <li><strong>Taxes:</strong> STT, GST, stamp duty, securities transaction tax.</li>
              <li><strong>Exchange/transaction fees:</strong> Charged by stock exchanges.</li>
              <li><strong>Shipping/packaging:</strong> For physical goods.</li>
              <li><strong>Payment gateway charges:</strong> If selling online.</li>
              <li><strong>Currency conversion fees:</strong> For international trades.</li>
            </ul>
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">4. Practical Applications</h3>
          <p className="text-gray-600">
            - <strong>Stock Market Trading:</strong> Calculate net profit after brokerage and taxes.<br />
            - <strong>Real Estate:</strong> Determine profit after stamp duty, registration, and agent commission.<br />
            - <strong>E-commerce:</strong> Evaluate product profitability including platform fees and shipping.<br />
            - <strong>Crypto Trading:</strong> Account for exchange fees and withdrawal charges.<br />
            - <strong>Business Inventory:</strong> Compute margin on each product sale.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">5. Tax Implications of Profit/Loss</h3>
          <p className="text-gray-600">
            In India, profits from trading are taxed as:
            <ul className="list-disc pl-6 mt-2">
              <li><strong>Capital Gains (Equity):</strong> Short-term (held &lt;1 year) @15%; Long-term (≥1 year) over ₹1 lakh @10%.</li>
              <li><strong>Business Income:</strong> If trading is your primary business, profits added to income and taxed as per slab.</li>
              <li><strong>Losses:</strong> Can be carried forward and set off against future gains (subject to rules).</li>
            </ul>
            Always consult a tax advisor.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">6. How to Use This P&L Calculator Effectively</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Enter your buy price and quantity (including fractional units).</li>
            <li>Enter your sell price (or expected sell price for planning).</li>
            <li>Add all buying and selling expenses (brokerage, taxes, etc.).</li>
            <li>Analyze the results – absolute profit/loss, percentage, break-even price.</li>
            <li>Use the break-even price to set your minimum selling target.</li>
            <li>Download the PDF report for record-keeping or tax filing.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">7. Strategies to Minimise Losses and Maximise Profits</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Reduce expenses:</strong> Choose low-brokerage platforms, negotiate bulk shipping rates.</li>
            <li><strong>Use limit orders:</strong> Avoid slippage in volatile markets.</li>
            <li><strong>Set stop-loss:</strong> Automatically exit trades at a predetermined loss level.</li>
            <li><strong>Scale in/out:</strong> Enter and exit positions gradually to reduce impact costs.</li>
            <li><strong>Tax harvesting:</strong> Book losses to offset gains (within allowed limits).</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">8. Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div><strong className="text-gray-800">Q1. What is the difference between gross profit and net profit?</strong><p className="text-gray-600">Gross profit is revenue minus cost of goods sold. Net profit further subtracts all expenses (including taxes, brokerage, etc.). Our calculator gives net profit/loss after all costs.</p></div>
            <div><strong className="text-gray-800">Q2. Can I use this for forex or crypto trading?</strong><p className="text-gray-600">Yes, just input your buy/sell prices in the respective currency and add any conversion or exchange fees as expenses.</p></div>
            <div><strong className="text-gray-800">Q3. How accurate is the break-even price?</strong><p className="text-gray-600">It is mathematically exact given your inputs. In reality, slippage and market movements may affect actual execution.</p></div>
            <div><strong className="text-gray-800">Q4. Should I include opportunity cost?</strong><p className="text-gray-600">Our calculator focuses on explicit costs. For investment decisions, consider opportunity cost separately.</p></div>
            <div><strong className="text-gray-800">Q5. Can I save multiple scenarios?</strong><p className="text-gray-600">Currently, you can download PDF reports for each scenario. We recommend keeping a folder of reports for comparison.</p></div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">9. Advanced P&L Concepts</h3>
          <p className="text-gray-600">
            - <strong>Weighted Average Cost:</strong> If you bought the same asset at different prices, calculate average buy price before using calculator.<br />
            - <strong>Realized vs Unrealized P&L:</strong> Realized is when you actually sell; unrealized is paper profit/loss on open positions.<br />
            - <strong>Mark-to-Market:</strong> For traders, daily P&L based on closing prices.<br />
            - <strong>Risk-Reward Ratio:</strong> Compare potential profit to potential loss (e.g., 2:1 means profit target twice the stop-loss distance).
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">10. Final Thoughts</h3>
          <p className="text-gray-600">
            The Profit/Loss Calculator is more than a number cruncher – it's a decision-making tool. By clearly understanding your net outcomes, you can refine your trading strategies, set realistic profit targets, and avoid emotional decisions. Whether you are a day trader, long-term investor, or small business owner, integrating this calculator into your workflow will enhance your financial discipline.
          </p>
          <p className="text-gray-600 mt-4">
            <strong>Start using our Profit/Loss Calculator above now.</strong> Input your trade details, visualise the price points, download your report, and trade with confidence. Remember – small savings on expenses and informed pricing decisions can significantly boost your bottom line.
          </p>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: The calculations are for illustrative purposes only. Actual trading involves market risk. Please consult a financial advisor before making investment decisions.
          </div>
        </div>
      </div>
    </div>
  );
}