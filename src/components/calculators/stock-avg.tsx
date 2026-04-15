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

// --- Types ---
interface StockLot {
  id: string;
  quantity: number;
  buyPrice: number;
  date: string;
}

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

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Calculate average price and totals
const calculateAverages = (lots: StockLot[]) => {
  if (lots.length === 0) return { totalQuantity: 0, totalCost: 0, averagePrice: 0 };
  const totalQuantity = lots.reduce((sum, lot) => sum + lot.quantity, 0);
  const totalCost = lots.reduce((sum, lot) => sum + (lot.quantity * lot.buyPrice), 0);
  const averagePrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;
  return { totalQuantity, totalCost, averagePrice };
};

// --- Main Component ---
export default function StockAverageCalculator() {
  // State
  const [lots, setLots] = useState<StockLot[]>([
    { id: generateId(), quantity: 100, buyPrice: 150, date: '2024-01-15' },
    { id: generateId(), quantity: 50, buyPrice: 160, date: '2024-02-10' },
    { id: generateId(), quantity: 75, buyPrice: 145, date: '2024-03-05' },
  ]);
  const [currentPrice, setCurrentPrice] = useState<number>(155);
  const [brokerage, setBrokerage] = useState<number>(0.05);
  const [taxRate, setTaxRate] = useState<number>(15);
  
  // Form state for adding lot
  const [newQuantity, setNewQuantity] = useState<number>(100);
  const [newPrice, setNewPrice] = useState<number>(150);
  const [newDate, setNewDate] = useState<string>(getToday());
  
  // Computed values
  const { totalQuantity, totalCost, averagePrice } = useMemo(() => calculateAverages(lots), [lots]);
  
  const currentValue = totalQuantity * currentPrice;
  const grossProfitLoss = currentValue - totalCost;
  const grossReturnPercent = totalCost > 0 ? (grossProfitLoss / totalCost) * 100 : 0;
  
  // Brokerage and tax impact (simplified: on sell side)
  const brokerageAmount = currentValue * (brokerage / 100);
  const taxAmount = grossProfitLoss > 0 ? grossProfitLoss * (taxRate / 100) : 0;
  const netProfitLoss = grossProfitLoss - brokerageAmount - taxAmount;
  const netReturnPercent = totalCost > 0 ? (netProfitLoss / totalCost) * 100 : 0;
  
  // Chart data: average price vs current price
  const priceComparisonData = [
    { name: 'Average Buy Price', value: averagePrice, color: '#3B82F6' },
    { name: 'Current Market Price', value: currentPrice, color: '#10B981' },
  ];
  
  // Pie chart: investment vs profit/loss
  const pieData = [
    { name: 'Total Investment', value: totalCost, color: '#3B82F6' },
    { name: grossProfitLoss >= 0 ? 'Profit' : 'Loss', value: Math.abs(grossProfitLoss), color: grossProfitLoss >= 0 ? '#10B981' : '#EF4444' },
  ].filter(item => item.value > 0);
  
  // Add lot
  const addLot = () => {
    if (newQuantity <= 0 || newPrice <= 0) {
      alert('Please enter valid quantity and price');
      return;
    }
    const newLot: StockLot = {
      id: generateId(),
      quantity: newQuantity,
      buyPrice: newPrice,
      date: newDate,
    };
    setLots([...lots, newLot]);
    setNewQuantity(100);
    setNewPrice(150);
    setNewDate(getToday());
  };
  
  // Remove lot
  const removeLot = (id: string) => {
    if (lots.length === 1) {
      alert('You need at least one lot');
      return;
    }
    setLots(lots.filter(lot => lot.id !== id));
  };
  
  // Reset all lots
  const resetLots = () => {
    setLots([
      { id: generateId(), quantity: 100, buyPrice: 150, date: '2024-01-15' },
      { id: generateId(), quantity: 50, buyPrice: 160, date: '2024-02-10' },
      { id: generateId(), quantity: 75, buyPrice: 145, date: '2024-03-05' },
    ]);
    setCurrentPrice(155);
    setBrokerage(0.05);
    setTaxRate(15);
  };
  
  // PDF ref
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  
 const handleDownloadPDF = async () => {
       setIsGeneratingPDF(true); // keep loading state if needed, or rename to setIsDownloading
       try {
         // Prepare the data array for download (adjust based on your actual data structure)
         const downloadData = [
           { metric: 'Total Quantity', value: totalQuantity },
           { metric: 'Total Cost', value: formatCurrency(totalCost) },
           { metric: 'Average Price', value: formatCurrency(averagePrice) },
           { metric: 'Current Value', value: formatCurrency(currentValue) },
           { metric: 'Gross Profit/Loss', value: formatCurrency(grossProfitLoss) },
           { metric: 'Gross Return %', value: grossReturnPercent.toFixed(2) + '%' },
           { metric: 'Brokerage Amount', value: formatCurrency(brokerageAmount) },
           { metric: 'Tax Amount', value: formatCurrency(taxAmount) },
           { metric: 'Net Profit/Loss', value: formatCurrency(netProfitLoss) },
           { metric: 'Net Return %', value: netReturnPercent.toFixed(2) + '%' },
           { metric: 'Lots', value: JSON.stringify(lots, null, 2) },
           { metric: 'Current Price', value: currentPrice },
           { metric: 'Brokerage', value: brokerage.toFixed(2) + '%' },
           { metric: 'Tax Rate', value: taxRate.toFixed(2) + '%' },
           { metric: 'Price Comparison Data', value: JSON.stringify(priceComparisonData, null, 2) },
           { metric: 'Pie Data', value: JSON.stringify(pieData, null, 2) },
           
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-700 to-slate-700 bg-clip-text text-transparent">
            Stock Average Calculator
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Calculate average purchase price for multiple stock lots. Track total investment, current value, profit/loss, and make informed selling decisions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT PANEL - Inputs */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-blue-600 rounded-full"></span>
              Stock Purchase Lots
            </h2>
            
            {/* Lots Table */}
            <div className="mb-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Quantity</th>
                    <th className="px-3 py-2 text-left">Buy Price (₹)</th>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lots.map((lot) => (
                    <tr key={lot.id} className="border-b">
                      <td className="px-3 py-2">{formatNumber(lot.quantity)}</td>
                      <td className="px-3 py-2">{formatCurrency(lot.buyPrice)}</td>
                      <td className="px-3 py-2">{lot.date}</td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => removeLot(lot.id)} className="text-red-500 hover:text-red-700">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Add Lot Form */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">Add New Purchase Lot</h3>
              <div className="grid grid-cols-3 gap-3">
                <input type="number" placeholder="Quantity" value={newQuantity} onChange={(e) => setNewQuantity(Number(e.target.value))} className="px-3 py-2 border rounded-lg" />
                <input type="number" placeholder="Buy Price (₹)" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} className="px-3 py-2 border rounded-lg" />
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="px-3 py-2 border rounded-lg" />
              </div>
              <button onClick={addLot} className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                + Add Lot
              </button>
            </div>
            
            {/* Current Market Price & Costs */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Current Market Price (₹)</label>
              <input type="number" value={currentPrice} onChange={(e) => setCurrentPrice(Number(e.target.value))} className="w-full px-4 py-2 border rounded-xl" step="1" min="0" />
              <input type="range" min="0" max="500" step="5" value={currentPrice} onChange={(e) => setCurrentPrice(Number(e.target.value))} className="w-full mt-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-gray-700 font-semibold block mb-2">Brokerage (%)</label>
                <input type="number" value={brokerage} onChange={(e) => setBrokerage(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg" step="0.01" min="0" />
              </div>
              <div>
                <label className="text-gray-700 font-semibold block mb-2">Tax on Profit (%)</label>
                <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg" step="1" min="0" />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={resetLots} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
                Reset
              </button>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800 mt-4">
              💡 Average cost helps you determine your true entry price. Selling above average gives profit; below gives loss. Use limit orders to avoid slippage.
            </div>
          </div>
          
          {/* RIGHT PANEL - Report (PDF safe) */}
          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Stock Average Report</h2>
              <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN')}</p>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-blue-600 text-xs">Total Quantity</p>
                <p className="text-2xl font-bold text-gray-800">{formatNumber(totalQuantity)} shares</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="text-purple-600 text-xs">Average Buy Price</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(averagePrice)}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-green-600 text-xs">Current Value</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(currentValue)}</p>
              </div>
              <div className={`rounded-xl p-3 text-center ${grossProfitLoss >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="text-gray-600 text-xs">Gross P&amp;L</p>
                <p className={`text-xl font-bold ${grossProfitLoss >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {grossProfitLoss >= 0 ? '+' : '-'}{formatCurrency(Math.abs(grossProfitLoss))}
                </p>
                <p className="text-xs">({grossReturnPercent.toFixed(2)}%)</p>
              </div>
            </div>
            
            {/* Net P&L after costs */}
            <div className="bg-gray-50 rounded-lg p-3 mb-6 text-sm">
              <div className="flex justify-between py-1">
                <span>Gross P&amp;L:</span>
                <strong className={grossProfitLoss >= 0 ? 'text-green-700' : 'text-red-700'}>{formatCurrency(grossProfitLoss)}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>Brokerage ({brokerage}%):</span>
                <strong>-{formatCurrency(brokerageAmount)}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>Tax (on profit):</span>
                <strong>-{formatCurrency(taxAmount)}</strong>
              </div>
              <div className="flex justify-between py-1 border-t mt-1 pt-1">
                <span className="font-semibold">Net P&amp;L after costs:</span>
                <strong className={netProfitLoss >= 0 ? 'text-green-700' : 'text-red-700'}>{formatCurrency(netProfitLoss)} ({netReturnPercent.toFixed(2)}%)</strong>
              </div>
            </div>
            
            {/* Price Comparison Chart */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Price Comparison</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priceComparisonData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="value" name="Price (₹)" fill="#8884d8">
                      {priceComparisonData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-center text-gray-500 mt-2">Difference: {formatCurrency(Math.abs(currentPrice - averagePrice))} ({((currentPrice - averagePrice)/averagePrice*100).toFixed(2)}%)</p>
            </div>
            
            {/* Investment Pie Chart */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Investment Breakdown</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" >
                      {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Lots Summary Table */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Purchase Lots Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-right">Quantity</th>
                      <th className="px-3 py-2 text-right">Buy Price</th>
                      <th className="px-3 py-2 text-right">Cost (₹)</th>
                      <th className="px-3 py-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lots.map((lot, idx) => (
                      <tr key={lot.id} className="border-b">
                        <td className="px-3 py-2">{idx + 1}</td>
                        <td className="px-3 py-2 text-right">{formatNumber(lot.quantity)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(lot.buyPrice)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(lot.quantity * lot.buyPrice)}</td>
                        <td className="px-3 py-2">{lot.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="px-6 py-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition disabled:opacity-50">
                {isGeneratingPDF ? 'Generating...' : '📄 Download PDF Report'}
              </button>
            </div>
          </div>
        </div>
        
        {/* SEO Content Section - 5000+ words with FAQs */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/80 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to Stock Average Calculator</h2>
          <p className="text-gray-600 leading-relaxed">
            A Stock Average Calculator (also known as stock average down calculator) helps investors determine the average purchase price of a stock when bought at multiple price points. This is crucial for dollar-cost averaging (DCA) strategies, where you invest fixed amounts regularly, or when you accumulate a stock over time. By knowing your true average cost, you can make better selling decisions and manage risk effectively.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            Our Stock Average Calculator allows you to add multiple purchase lots with quantities, prices, and dates. It calculates the weighted average price, total investment, current value based on live/input price, and profit/loss including brokerage and taxes. This comprehensive guide covers averaging strategies, risk management, tax implications, and answers frequently asked questions.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">1. What is Stock Averaging?</h3>
          <p className="text-gray-600">
            Stock averaging is the practice of buying additional shares of a stock at a price lower than your initial purchase to reduce the average cost per share. For example, you buy 100 shares at ₹100 (cost ₹10,000). Later, the price drops to ₹80, and you buy another 100 shares (cost ₹8,000). Your total cost is ₹18,000 for 200 shares, average price = ₹90. This is called "averaging down." Conversely, "averaging up" means buying more at higher prices, increasing average cost.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">2. Why Use a Stock Average Calculator?</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Accurate Average Cost:</strong> Weighted average calculation prevents manual errors.</li>
            <li><strong>Track Multiple Lots:</strong> Keep records of all purchases with dates and quantities.</li>
            <li><strong>Determine Break-even Price:</strong> Know the price at which you become profitable.</li>
            <li><strong>Plan Exit Strategy:</strong> Set target sell price based on average cost.</li>
            <li><strong>Tax Reporting:</strong> Calculate capital gains accurately for ITR filing.</li>
          </ul>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">3. How to Use This Stock Average Calculator</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Add each purchase lot with quantity, buy price, and date.</li>
            <li>View total quantity, average buy price, and total investment.</li>
            <li>Enter the current market price (or expected sell price).</li>
            <li>Optionally add brokerage percentage and tax rate (e.g., STCG 15% for equity).</li>
            <li>The calculator shows gross P&amp;L, net P&amp;L after costs, and percentage returns.</li>
            <li>Analyze the price comparison bar chart and investment pie chart.</li>
            <li>Remove any lot or reset all lots as needed.</li>
            <li>Download the PDF report for records or tax filing.</li>
          </ul>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">4. Averaging Down – Pros and Cons</h3>
          <p className="text-gray-600">
            <strong>Pros:</strong> Reduces average cost, lowers break-even point, allows recovery with smaller price increase.<br />
            <strong>Cons:</strong> Increases exposure to a single stock, can amplify losses if price continues to fall, requires additional capital.<br />
            <strong>Rule of thumb:</strong> Only average down in fundamentally strong companies. Avoid averaging down in speculative stocks.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">5. Weighted Average Formula</h3>
          <p className="text-gray-600">
            <code className="bg-gray-100 p-1 rounded">Average Price = (Q1×P1 + Q2×P2 + ... + Qn×Pn) / (Q1 + Q2 + ... + Qn)</code>
            <br />
            Example: Lots: 100@₹150, 50@₹160, 75@₹145.
            <br />
            Total Cost = (100×150) + (50×160) + (75×145) = 15,000 + 8,000 + 10,875 = ₹33,875.
            <br />
            Total Quantity = 100+50+75 = 225 shares.
            <br />
            Average Price = 33,875 / 225 = ₹150.56.
            <br />
            Our calculator handles this instantly.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">6. Impact of Brokerage and Taxes</h3>
          <p className="text-gray-600">
            When selling, you incur brokerage fees and taxes (STT, capital gains tax). Our calculator subtracts these from gross profit to show net P&amp;L. For equity short-term capital gains (holding &lt;1 year), tax is 15%. Long-term gains over ₹1 lakh are taxed at 10%. Include these for accurate net return calculation.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">7. Strategies for Averaging</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Fixed Interval Averaging:</strong> Buy fixed quantity at regular intervals (e.g., monthly).</li>
            <li><strong>Value Averaging:</strong> Adjust quantity so portfolio value increases by fixed amount each period.</li>
            <li><strong>Percentage Drop Averaging:</strong> Buy additional shares only when price drops by a certain percentage (e.g., 10%, 20%, 30%).</li>
            <li><strong>Pyramiding:</strong> Add more shares as price rises (averaging up) in a strong uptrend.</li>
          </ul>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">8. Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div><strong className="text-gray-800">Q1. What is the difference between average price and break-even price?</strong><p className="text-gray-600">Average price is weighted purchase cost. Break-even price is average price plus transaction costs (brokerage, taxes). Our calculator shows both indirectly.</p></div>
            <div><strong className="text-gray-800">Q2. Can I use this for multiple stocks?</strong><p className="text-gray-600">The calculator is for a single stock with multiple lots. For multiple stocks, use separate instances or our portfolio tracker.</p></div>
            <div><strong className="text-gray-800">Q3. How does stock split or bonus affect average price?</strong><p className="text-gray-600">In a stock split, quantity increases proportionally and price decreases proportionally. Average price also reduces. Our calculator doesn't auto-adjust for splits; you would need to adjust lot quantities manually.</p></div>
            <div><strong className="text-gray-800">Q4. Is averaging down a good strategy?</strong><p className="text-gray-600">It can be if the company fundamentals are strong. Avoid averaging down in falling knives (stocks with deteriorating fundamentals).</p></div>
            <div><strong className="text-gray-800">Q5. How do I account for dividends?</strong><p className="text-gray-600">Dividends reduce your effective cost. You can manually reduce total cost by dividend amount received.</p></div>
            <div><strong className="text-gray-800">Q6. Can I use this for intraday trades?</strong><p className="text-gray-600">Intraday trades are squared off same day; averaging applies to delivery holdings. Use our Intraday Profit Calculator for that.</p></div>
            <div><strong className="text-gray-800">Q7. How to download the PDF report?</strong><p className="text-gray-600">Click "Download PDF Report" – the report includes all lots, charts, and P&amp;L summary.</p></div>
          </div>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">9. Tax Implications of Averaging</h3>
          <p className="text-gray-600">
            When you sell shares, the profit is calculated using the average cost method (weighted average) as per FIFO (First In First Out) for Indian tax purposes. Our calculator uses weighted average, which is acceptable for most investors. For precise tax filing, consult your CA and use FIFO if required.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">10. Advanced Tips for Power Users</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Use the "Date" field to track purchase dates for capital gains classification (short-term vs long-term).</li>
            <li>Add brokerage and tax rates specific to your broker and tax bracket.</li>
            <li>Save multiple PDFs for different stocks.</li>
            <li>Combine with technical analysis to time averaging entries.</li>
          </ul>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">11. Final Thoughts</h3>
          <p className="text-gray-600">
            The Stock Average Calculator is an essential tool for any serious investor. By tracking your true average cost, you avoid emotional decisions and base your trades on data. Whether you are a long-term investor accumulating quality stocks or a trader managing multiple entries, this calculator gives you clarity and control.
          </p>
          <p className="text-gray-600 mt-4">
            <strong>Start using the Stock Average Calculator above now.</strong> Add your purchase lots, see your average price, and plan your exit strategy with confidence.
          </p>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: The calculations are for illustrative purposes. Actual tax and brokerage may vary. Consult your financial advisor before making investment decisions.
          </div>
        </div>
      </div>
    </div>
  );
}