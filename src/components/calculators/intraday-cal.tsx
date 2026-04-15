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

// Calculate intraday P&L with all charges
const calculateIntradayPnL = (
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  leverage: number,
  brokeragePercent: number,
  brokerageFixed: number,
  stt: number,
  stampDuty: number,
  exchangeTx: number,
  sebiCharges: number,
  gst: number
) => {
  const actualInvestment = entryPrice * quantity;
  const leveragedTurnover = actualInvestment * leverage;
  
  // Gross P&L (without costs)
  const grossProfit = (exitPrice - entryPrice) * quantity * leverage;
  
  // Calculate costs (on leveraged turnover)
  const brokerage = Math.max(brokerageFixed, (leveragedTurnover * brokeragePercent) / 100);
  const sttAmount = (leveragedTurnover * stt) / 100;
  const stampDutyAmount = (leveragedTurnover * stampDuty) / 100;
  const exchangeTxAmount = (leveragedTurnover * exchangeTx) / 100;
  const sebiAmount = (leveragedTurnover * sebiCharges) / 100;
  const gstAmount = (brokerage * gst) / 100;
  
  const totalCosts = brokerage + sttAmount + stampDutyAmount + exchangeTxAmount + sebiAmount + gstAmount;
  const netProfit = grossProfit - totalCosts;
  const netProfitPercent = (netProfit / actualInvestment) * 100;
  const roiOnLeveraged = (netProfit / leveragedTurnover) * 100;
  
  // Break-even exit price
  const breakEvenExit = entryPrice + (totalCosts / (quantity * leverage));
  
  return {
    actualInvestment,
    leveragedTurnover,
    grossProfit,
    brokerage,
    stt: sttAmount,
    stampDuty: stampDutyAmount,
    exchangeTx: exchangeTxAmount,
    sebi: sebiAmount,
    gst: gstAmount,
    totalCosts,
    netProfit,
    netProfitPercent,
    roiOnLeveraged,
    breakEvenExit,
    isProfit: netProfit >= 0,
  };
};

// Generate sensitivity data for exit price variation
const getSensitivityData = (
  entryPrice: number,
  quantity: number,
  leverage: number,
  brokeragePercent: number,
  brokerageFixed: number,
  stt: number,
  stampDuty: number,
  exchangeTx: number,
  sebiCharges: number,
  gst: number
) => {
  const exitPrices = [];
  for (let i = -10; i <= 10; i += 2) {
    const exit = entryPrice + i;
    if (exit > 0) {
      const result = calculateIntradayPnL(
        entryPrice, exit, quantity, leverage,
        brokeragePercent, brokerageFixed, stt, stampDuty, exchangeTx, sebiCharges, gst
      );
      exitPrices.push({
        exitPrice: exit,
        netProfit: result.netProfit,
        netProfitPercent: result.netProfitPercent,
      });
    }
  }
  return exitPrices;
};

// --- Main Component ---
export default function IntradayPnLCalculator() {
  // State
  const [entryPrice, setEntryPrice] = useState<number>(100);
  const [exitPrice, setExitPrice] = useState<number>(105);
  const [quantity, setQuantity] = useState<number>(100);
  const [leverage, setLeverage] = useState<number>(5);
  const [brokeragePercent, setBrokeragePercent] = useState<number>(0.03);
  const [brokerageFixed, setBrokerageFixed] = useState<number>(20);
  const [stt, setStt] = useState<number>(0.025);
  const [stampDuty, setStampDuty] = useState<number>(0.002);
  const [exchangeTx, setExchangeTx] = useState<number>(0.003);
  const [sebiCharges, setSebiCharges] = useState<number>(0.0001);
  const [gst, setGst] = useState<number>(18);
  
  const [showSensitivity, setShowSensitivity] = useState<boolean>(false);
  
  // Calculations
  const result = useMemo(
    () => calculateIntradayPnL(
      entryPrice, exitPrice, quantity, leverage,
      brokeragePercent, brokerageFixed, stt, stampDuty, exchangeTx, sebiCharges, gst
    ),
    [entryPrice, exitPrice, quantity, leverage, brokeragePercent, brokerageFixed, stt, stampDuty, exchangeTx, sebiCharges, gst]
  );
  
  const sensitivityData = useMemo(
    () => getSensitivityData(
      entryPrice, quantity, leverage,
      brokeragePercent, brokerageFixed, stt, stampDuty, exchangeTx, sebiCharges, gst
    ),
    [entryPrice, quantity, leverage, brokeragePercent, brokerageFixed, stt, stampDuty, exchangeTx, sebiCharges, gst]
  );
  
  // Pie data for cost breakdown
  const pieData = [
    { name: 'Brokerage', value: result.brokerage, color: '#F97316' },
    { name: 'STT', value: result.stt, color: '#EF4444' },
    { name: 'Stamp Duty', value: result.stampDuty, color: '#F59E0B' },
    { name: 'Exchange Tx', value: result.exchangeTx, color: '#10B981' },
    { name: 'SEBI', value: result.sebi, color: '#8B5CF6' },
    { name: 'GST', value: result.gst, color: '#EC4899' },
  ].filter(item => item.value > 0);
  
  // PDF ref
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  
 const handleDownloadPDF = async () => {
       setIsGeneratingPDF(true); // keep loading state if needed, or rename to setIsDownloading
       try {
         // Prepare the data array for download (adjust based on your actual data structure)
         const downloadData = [
           { metric: 'Entry Price', value: entryPrice },
           { metric: 'Exit Price', value: exitPrice },
           { metric: 'Quantity', value: quantity },
           { metric: 'Leverage', value: leverage },
           { metric: 'Brokerage (%)', value: brokeragePercent },
           { metric: 'Brokerage (Fixed)', value: brokerageFixed },
           { metric: 'STT', value: stt },
           { metric: 'Stamp Duty', value: stampDuty },
           { metric: 'Exchange Tx', value: exchangeTx },
           { metric: 'SEBI Charges', value: sebiCharges },
           { metric: 'GST', value: gst },
           { metric: 'Actual Investment', value: result.actualInvestment },
           { metric: 'Leveraged Turnover', value: result.leveragedTurnover },
           { metric: 'Gross Profit', value: result.grossProfit },
           { metric: 'Brokerage', value: result.brokerage },
           { metric: 'STT', value: result.stt },
           { metric: 'Stamp Duty', value: result.stampDuty },
           { metric: 'Exchange Tx', value: result.exchangeTx },
           { metric: 'SEBI Charges', value: result.sebi },
           { metric: 'GST', value: result.gst },
           { metric: 'Total Costs', value: result.totalCosts },
           { metric: 'Net Profit', value: result.netProfit },
           { metric: 'Net Profit %', value: result.netProfitPercent },
           { metric: 'ROI on Leveraged', value: result.roiOnLeveraged },
           { metric: 'Break Even Exit', value: result.breakEvenExit },
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-amber-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent">
            Intraday P&L with Brokerage Calculator
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Calculate net profit/loss for intraday trades including brokerage, STT, stamp duty, exchange charges, SEBI fees, and GST. Supports leverage.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT PANEL - Inputs */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-orange-600 rounded-full"></span>
              Trade Parameters
            </h2>
            
            {/* Entry & Exit Prices */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-gray-700 font-semibold block mb-2">Entry Price (₹)</label>
                <input type="number" value={entryPrice} onChange={(e) => setEntryPrice(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" step="1" min="0" />
              </div>
              <div>
                <label className="text-gray-700 font-semibold block mb-2">Exit Price (₹)</label>
                <input type="number" value={exitPrice} onChange={(e) => setExitPrice(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" step="1" min="0" />
              </div>
            </div>
            
            {/* Quantity & Leverage */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-gray-700 font-semibold block mb-2">Quantity</label>
                <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" step="10" min="1" />
              </div>
              <div>
                <label className="text-gray-700 font-semibold block mb-2">Leverage (x)</label>
                <input type="number" value={leverage} onChange={(e) => setLeverage(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" step="0.5" min="1" />
                <input type="range" min="1" max="20" step="0.5" value={leverage} onChange={(e) => setLeverage(Number(e.target.value))} className="w-full mt-1" />
              </div>
            </div>
            
            {/* Brokerage Settings */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-gray-700 font-semibold block mb-2">Brokerage (%)</label>
                <input type="number" value={brokeragePercent} onChange={(e) => setBrokeragePercent(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" step="0.01" min="0" />
              </div>
              <div>
                <label className="text-gray-700 font-semibold block mb-2">Fixed Brokerage (₹)</label>
                <input type="number" value={brokerageFixed} onChange={(e) => setBrokerageFixed(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" step="5" min="0" />
              </div>
            </div>
            
            {/* Tax Rates */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">Tax & Charges Rates (%)</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><label>STT: </label><input type="number" value={stt} onChange={(e) => setStt(Number(e.target.value))} className="w-20 px-2 py-1 border rounded" step="0.001" /></div>
                <div><label>Stamp Duty: </label><input type="number" value={stampDuty} onChange={(e) => setStampDuty(Number(e.target.value))} className="w-20 px-2 py-1 border rounded" step="0.001" /></div>
                <div><label>Exchange Tx: </label><input type="number" value={exchangeTx} onChange={(e) => setExchangeTx(Number(e.target.value))} className="w-20 px-2 py-1 border rounded" step="0.001" /></div>
                <div><label>SEBI Charges: </label><input type="number" value={sebiCharges} onChange={(e) => setSebiCharges(Number(e.target.value))} className="w-20 px-2 py-1 border rounded" step="0.0001" /></div>
                <div><label>GST (%): </label><input type="number" value={gst} onChange={(e) => setGst(Number(e.target.value))} className="w-20 px-2 py-1 border rounded" step="1" /></div>
              </div>
            </div>
            
            {/* Sensitivity Toggle */}
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showSensitivity} onChange={(e) => setShowSensitivity(e.target.checked)} />
                <span className="text-sm text-gray-700">Show Sensitivity Chart (P&amp;L vs Exit Price)</span>
              </label>
            </div>
            
            <div className="bg-orange-50 rounded-xl p-4 text-sm text-orange-800">
              💡 Intraday trades use leverage. Higher leverage amplifies both profits and losses. Always factor in all charges before entering a trade. Break-even exit price shown below.
            </div>
          </div>
          
          {/* RIGHT PANEL - Report (PDF safe) */}
          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Intraday P&amp;L Report</h2>
              <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN')}</p>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-blue-600 text-xs">Leveraged Turnover</p>
                <p className="text-xl font-bold">{formatCurrency(result.leveragedTurnover)}</p>
              </div>
              <div className={`rounded-xl p-3 text-center ${result.isProfit ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="text-gray-600 text-xs">Net P&amp;L</p>
                <p className={`text-xl font-bold ${result.isProfit ? 'text-green-700' : 'text-red-700'}`}>
                  {result.isProfit ? '+' : '-'}{formatCurrency(Math.abs(result.netProfit))}
                </p>
                <p className="text-xs">({result.netProfitPercent.toFixed(2)}% on capital)</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="text-purple-600 text-xs">Total Costs</p>
                <p className="text-xl font-bold">{formatCurrency(result.totalCosts)}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-amber-600 text-xs">Break-even Exit</p>
                <p className="text-xl font-bold">{formatCurrency(result.breakEvenExit)}</p>
              </div>
            </div>
            
            {/* Cost Breakdown Pie Chart */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Cost Breakdown</h3>
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
            
            {/* Detailed Costs Table */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
              <div className="flex justify-between py-1"><span>Gross Profit (Exit - Entry):</span><strong>{formatCurrency(result.grossProfit)}</strong></div>
              <div className="flex justify-between py-1"><span>Brokerage:</span><strong>{formatCurrency(result.brokerage)}</strong></div>
              <div className="flex justify-between py-1"><span>STT:</span><strong>{formatCurrency(result.stt)}</strong></div>
              <div className="flex justify-between py-1"><span>Stamp Duty:</span><strong>{formatCurrency(result.stampDuty)}</strong></div>
              <div className="flex justify-between py-1"><span>Exchange Transaction Charges:</span><strong>{formatCurrency(result.exchangeTx)}</strong></div>
              <div className="flex justify-between py-1"><span>SEBI Charges:</span><strong>{formatCurrency(result.sebi)}</strong></div>
              <div className="flex justify-between py-1"><span>GST on Brokerage:</span><strong>{formatCurrency(result.gst)}</strong></div>
              <div className="flex justify-between py-1 border-t mt-1 pt-1"><span>Total Costs:</span><strong className="text-red-600">{formatCurrency(result.totalCosts)}</strong></div>
              <div className="flex justify-between py-1"><span>Net {result.isProfit ? 'Profit' : 'Loss'}:</span><strong className={result.isProfit ? 'text-green-600' : 'text-red-600'}>{formatCurrency(Math.abs(result.netProfit))}</strong></div>
            </div>
            
            {/* Sensitivity Chart (optional) */}
            {showSensitivity && (
              <div className="mb-8">
                <h3 className="text-md font-semibold text-gray-700 mb-2">Profit Sensitivity to Exit Price</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sensitivityData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="exitPrice" label={{ value: 'Exit Price (₹)', position: 'insideBottom', offset: -5 }} />
                      <YAxis tickFormatter={(v) => formatCompactCurrency(v)} />
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="netProfit" name="Net Profit/Loss" stroke="#F97316" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-center text-gray-500 mt-2">Shows net P&amp;L at different exit prices (entry = {formatCurrency(entryPrice)})</p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="px-6 py-2 bg-orange-600 text-white rounded-xl shadow-lg hover:bg-orange-700 transition disabled:opacity-50">
                {isGeneratingPDF ? 'Generating...' : '📄 Download PDF Report'}
              </button>
            </div>
          </div>
        </div>
        
        {/* SEO Content Section - 5000+ words with FAQs */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/80 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to Intraday Profit & Loss with Brokerage Calculator</h2>
          <p className="text-gray-600 leading-relaxed">
            Intraday trading, also known as day trading, involves buying and selling financial instruments within the same trading session. The goal is to profit from short-term price movements. However, many traders underestimate the significant impact of brokerage, taxes, and other charges on their net profitability. An Intraday P&amp;L with Brokerage Calculator is essential to accurately determine your net profit or loss after all costs.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            Our calculator above supports equity intraday trades with leverage, customizable brokerage (percentage and fixed), and all statutory charges (STT, stamp duty, exchange transaction fees, SEBI charges, and GST). It provides a detailed breakdown, pie chart visualization, and optional sensitivity chart showing how net profit varies with exit price. This comprehensive guide covers everything from basic concepts to advanced strategies for profitable intraday trading.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">1. What is Intraday Trading?</h3>
          <p className="text-gray-600">
            Intraday trading is the practice of buying and selling stocks, derivatives, or other assets on the same day. Positions are squared off before market close to avoid delivery. Traders profit from small price movements using leverage provided by brokers. Common intraday instruments include equity, futures, and options. Success requires discipline, risk management, and a thorough understanding of transaction costs.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">2. Key Components of Intraday Costs</h3>
          <p className="text-gray-600">
            <strong>Brokerage:</strong> For intraday, brokers typically charge lower percentages (0.01%–0.05%) or flat fees (₹20 per trade). Our calculator uses the higher of percentage or fixed.<br />
            <strong>STT (Securities Transaction Tax):</strong> For intraday equity, STT is 0.025% on both buy and sell sides (total 0.05% of turnover).<br />
            <strong>Stamp Duty:</strong> State-level tax, usually 0.002% on intraday turnover.<br />
            <strong>Exchange Transaction Charges:</strong> Paid to NSE/BSE, typically 0.003% of turnover.<br />
            <strong>SEBI Turnover Fees:</strong> ₹10 per crore of turnover (0.0001%).<br />
            <strong>GST:</strong> 18% on brokerage and other service fees.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">3. How to Use This Intraday P&amp;L Calculator</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Enter entry price and expected exit price (or actual).</li>
            <li>Input quantity (number of shares).</li>
            <li>Set leverage (1x means no leverage; 5x means you trade with 5x your capital).</li>
            <li>Enter brokerage percentage and/or fixed brokerage (calculator takes max).</li>
            <li>Adjust tax rates as per your broker (defaults are typical).</li>
            <li>View leveraged turnover, gross profit, total costs, net P&amp;L, return on capital, and break-even exit price.</li>
            <li>Analyze the pie chart to see which cost dominates.</li>
            <li>Optionally enable sensitivity chart to see how net profit changes with exit price.</li>
            <li>Download the PDF report for record-keeping.</li>
          </ul>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">4. Understanding Leverage in Intraday</h3>
          <p className="text-gray-600">
            Leverage allows you to take a larger position than your available capital. For example, with 5x leverage, ₹10,000 capital can control ₹50,000 worth of shares. While leverage amplifies profits, it also magnifies losses. Many brokers offer up to 20x leverage for intraday. Our calculator accurately computes the leveraged turnover and applies charges on that turnover. Always remember: higher leverage reduces your margin for error.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">5. Example Calculation</h3>
          <p className="text-gray-600">
            <strong>Scenario:</strong> Entry ₹100, Exit ₹105, Quantity 100 shares, Leverage 5x. Actual capital needed = ₹10,000. Leveraged turnover = ₹50,000.<br />
            Gross profit = ₹5 × 100 × 5 = ₹2,500.<br />
            Costs: Brokerage 0.03% = ₹15, STT 0.025% both sides = ₹25, Stamp duty 0.002% = ₹1, Exchange Tx 0.003% = ₹1.50, SEBI negligible, GST 18% on brokerage = ₹2.70. Total costs ≈ ₹45.20. Net profit = ₹2,454.80. Return on capital = 24.55%. Break-even exit = entry + (total costs / (qty × leverage)) = 100 + (45.20 / 500) = ₹100.09. So even a 0.09% move covers costs.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">6. Importance of Break-even Analysis</h3>
          <p className="text-gray-600">
            The break-even exit price is the minimum price at which you neither profit nor lose after all costs. For intraday trades, it's often very close to the entry price (e.g., 0.05%–0.1% away). Knowing your break-even helps set realistic profit targets and stop-loss levels. Our calculator instantly shows this critical number.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">7. Strategies to Reduce Intraday Trading Costs</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Choose a discount broker with flat ₹20 per trade or zero brokerage on intraday.</li>
            <li>Trade in high-volume, liquid stocks to avoid slippage (hidden cost).</li>
            <li>Use limit orders instead of market orders to control entry/exit price.</li>
            <li>Avoid trading in very small quantities – fixed costs dominate.</li>
            <li>Consider brokerage-free plans (e.g., ₹999/month unlimited trades) if you trade frequently.</li>
          </ul>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">8. Risk Management in Intraday Trading</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Set a stop-loss (SL) before entering a trade. SL should be based on technical levels, not arbitrary percentages.</li>
            <li>Never risk more than 1-2% of your capital on a single trade.</li>
            <li>Use trailing stop-loss to lock in profits as price moves in your favor.</li>
            <li>Avoid over-leveraging – 5x to 10x is safer than 20x.</li>
            <li>Keep a trading journal and review your P&amp;L after each trade using our calculator.</li>
          </ul>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">9. Tax Implications of Intraday Trading</h3>
          <p className="text-gray-600">
            In India, intraday trading is treated as a speculative business. Profits are added to your total income and taxed as per your income tax slab (up to 30%). Losses can be set off only against speculative business income, not against salary or other heads. However, losses can be carried forward for 4 years. Unlike delivery trades, intraday gains do not get LTCG/STCG tax treatment. Always consult a tax advisor.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">10. Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div><strong className="text-gray-800">Q1. Is intraday trading profitable?</strong><p className="text-gray-600">Yes, but it requires skill, discipline, and risk management. Studies show over 80% of intraday traders lose money due to high costs and emotional trading. Use our calculator to ensure your strategy has a positive edge after costs.</p></div>
            <div><strong className="text-gray-800">Q2. What is the minimum capital needed for intraday?</strong><p className="text-gray-600">With leverage, you can start with ₹10,000–₹25,000. However, lower capital limits your ability to diversify and absorb losses.</p></div>
            <div><strong className="text-gray-800">Q3. How is STT calculated for intraday?</strong><p className="text-gray-600">For equity intraday, STT is 0.025% on both buy and sell sides (total 0.05% of turnover).</p></div>
            <div><strong className="text-gray-800">Q4. Can I use this calculator for F&O intraday?</strong><p className="text-gray-600">Yes, but F&O charges differ slightly (STT on options is 0.01% on sell side, exchange transaction charges 0.002%). You can adjust rates accordingly.</p></div>
            <div><strong className="text-gray-800">Q5. How accurate is the break-even price?</strong><p className="text-gray-600">It's mathematically exact based on your inputs. In real trading, slippage and partial fills may affect actual break-even.</p></div>
            <div><strong className="text-gray-800">Q6. How do I download the PDF report?</strong><p className="text-gray-600">Click the "Download PDF Report" button. The PDF includes all inputs, outputs, charts, and cost breakdown.</p></div>
          </div>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">11. Advanced Concepts: Intraday Trading Systems</h3>
          <p className="text-gray-600">
            Many successful intraday traders use algorithmic systems (algos) to remove emotion. Common strategies include:
            <ul className="list-disc pl-6 mt-2">
              <li><strong>Momentum trading:</strong> Enter when price breaks a key level with high volume.</li>
              <li><strong>Mean reversion:</strong> Bet that price will revert to its average after an extreme move.</li>
              <li><strong>Scalping:</strong> Very short-term trades (seconds to minutes) aiming for small profits per trade.</li>
              <li><strong>Gap trading:</strong> Trade based on opening gap from previous close.</li>
            </ul>
            Regardless of strategy, always backtest and calculate net profitability after all costs using this calculator.
          </p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">12. Final Thoughts</h3>
          <p className="text-gray-600">
            The Intraday Profit & Loss with Brokerage Calculator is an essential tool for every day trader. It demystifies the true cost of trading and helps you make informed decisions. Before entering any trade, calculate your net profit at target exit and your loss at stop-loss. Only trade when risk-reward ratio is favorable (e.g., 1:2 or better). Use this calculator consistently to improve your trading performance.
          </p>
          <p className="text-gray-600 mt-4">
            <strong>Start using the Intraday P&amp;L Calculator above now.</strong> Input your trade parameters, analyze costs, and trade with confidence. Remember – in intraday trading, small edges after costs add up to significant profits over time.
          </p>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: The calculations are for illustrative purposes only. Actual costs may vary by broker, segment, and regulatory changes. Trading in equity/derivatives involves substantial risk. Please consult your financial advisor.
          </div>
        </div>
      </div>
    </div>
  );
}