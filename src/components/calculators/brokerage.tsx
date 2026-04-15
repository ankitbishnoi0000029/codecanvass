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

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-IN').format(value);
};

// Calculate brokerage and taxes
const calculateBrokerage = (
  transactionType: 'buy' | 'sell' | 'both',
  tradeType: 'delivery' | 'intraday' | 'fno',
  quantity: number,
  pricePerUnit: number,
  brokeragePercent: number,
  brokerageFixed: number,
  stt: number,
  stampDuty: number,
  exchangeTx: number,
  sebiCharges: number,
  gst: number
) => {
  const turnover = quantity * pricePerUnit;
  let brokerage = 0;
  
  if (tradeType === 'delivery') {
    brokerage = Math.max(brokerageFixed, (turnover * brokeragePercent) / 100);
  } else if (tradeType === 'intraday') {
    brokerage = Math.max(brokerageFixed, (turnover * brokeragePercent) / 100);
  } else if (tradeType === 'fno') {
    brokerage = Math.max(brokerageFixed, (turnover * brokeragePercent) / 100);
  }
  
  // Apply only for the selected transaction type
  let totalBrokerage = 0;
  if (transactionType === 'buy') totalBrokerage = brokerage;
  else if (transactionType === 'sell') totalBrokerage = brokerage;
  else totalBrokerage = brokerage * 2;
  
  // Calculate taxes (STT is on sell side for delivery, on both for intraday? Simplified)
  let sttAmount = 0;
  if (tradeType === 'delivery') {
    sttAmount = transactionType === 'sell' ? (turnover * stt) / 100 : 0;
  } else if (tradeType === 'intraday') {
    sttAmount = (turnover * stt) / 100; // both sides simplified
  } else if (tradeType === 'fno') {
    sttAmount = (turnover * stt) / 100;
  }
  
  const stampDutyAmount = (turnover * stampDuty) / 100;
  const exchangeTxAmount = (turnover * exchangeTx) / 100;
  const sebiAmount = (turnover * sebiCharges) / 100;
  const gstAmount = (totalBrokerage * gst) / 100;
  
  const totalCharges = totalBrokerage + sttAmount + stampDutyAmount + exchangeTxAmount + sebiAmount + gstAmount;
  const netDebit = transactionType === 'buy' ? turnover + totalCharges : turnover - totalCharges;
  
  return {
    turnover,
    brokerage: totalBrokerage,
    stt: sttAmount,
    stampDuty: stampDutyAmount,
    exchangeTx: exchangeTxAmount,
    sebi: sebiAmount,
    gst: gstAmount,
    totalCharges,
    netAmount: netDebit,
    effectiveRate: (totalCharges / turnover) * 100,
  };
};

// --- Main Component ---
export default function BrokerageCalculator() {
  // State
  const [transactionType, setTransactionType] = useState<'buy' | 'sell' | 'both'>('both');
  const [tradeType, setTradeType] = useState<'delivery' | 'intraday' | 'fno'>('delivery');
  const [quantity, setQuantity] = useState<number>(100);
  const [pricePerUnit, setPricePerUnit] = useState<number>(500);
  const [brokeragePercent, setBrokeragePercent] = useState<number>(0.05);
  const [brokerageFixed, setBrokerageFixed] = useState<number>(20);
  const [stt, setStt] = useState<number>(0.1);
  const [stampDuty, setStampDuty] = useState<number>(0.003);
  const [exchangeTx, setExchangeTx] = useState<number>(0.003);
  const [sebiCharges, setSebiCharges] = useState<number>(0.0001);
  const [gst, setGst] = useState<number>(18);

  // Calculations
  const result = useMemo(
    () => calculateBrokerage(
      transactionType,
      tradeType,
      quantity,
      pricePerUnit,
      brokeragePercent,
      brokerageFixed,
      stt,
      stampDuty,
      exchangeTx,
      sebiCharges,
      gst
    ),
    [transactionType, tradeType, quantity, pricePerUnit, brokeragePercent, brokerageFixed, stt, stampDuty, exchangeTx, sebiCharges, gst]
  );

  // Pie data for charges breakdown
  const pieData = [
    { name: 'Brokerage', value: result.brokerage, color: '#3B82F6' },
    { name: 'STT', value: result.stt, color: '#EF4444' },
    { name: 'Stamp Duty', value: result.stampDuty, color: '#F59E0B' },
    { name: 'Exchange Tx', value: result.exchangeTx, color: '#10B981' },
    { name: 'SEBI Charges', value: result.sebi, color: '#8B5CF6' },
    { name: 'GST', value: result.gst, color: '#EC4899' },
  ].filter(item => item.value > 0);

  // Comparison data for different brokerage rates
  const comparisonData = useMemo(() => {
    const rates = [0.01, 0.03, 0.05, 0.1, 0.2, 0.5];
    return rates.map(rate => {
      const calc = calculateBrokerage(
        transactionType,
        tradeType,
        quantity,
        pricePerUnit,
        rate,
        brokerageFixed,
        stt,
        stampDuty,
        exchangeTx,
        sebiCharges,
        gst
      );
      return {
        rate: `${rate}%`,
        totalCharges: calc.totalCharges,
        effectiveRate: calc.effectiveRate,
      };
    });
  }, [transactionType, tradeType, quantity, pricePerUnit, brokerageFixed, stt, stampDuty, exchangeTx, sebiCharges, gst]);

  // PDF Ref & Handler
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

const handleDownloadPDF = async () => {
  setIsGeneratingPDF(true); // keep loading state if needed, or rename to setIsDownloading
  try {
    // Prepare the data array for download (adjust based on your actual data structure)
    const downloadData = [
      { metric: 'Transaction Type', value: transactionType },
      { metric: 'Trade Type', value: tradeType },
      { metric: 'Quantity', value: quantity },
      { metric: 'Price Per Unit', value: pricePerUnit },
      { metric: 'Brokerage (%)', value: brokeragePercent },
      { metric: 'Brokerage (Fixed)', value: brokerageFixed },
      { metric: 'STT', value: stt },
      { metric: 'Stamp Duty', value: stampDuty },
      { metric: 'Exchange Tx', value: exchangeTx },
      { metric: 'SEBI Charges', value: sebiCharges },
      { metric: 'GST', value: gst },
      { metric: 'Turnover', value: result.turnover },
      { metric: 'Total Charges', value: result.totalCharges },
      { metric: 'Effective Rate', value: result.effectiveRate.toFixed(3) },
      { metric: 'Net Amount', value: result.netAmount },
    ];

    // Reusable download function (import from utils or define inline)
    downloadMetricsAsText(downloadData, {
      filename: 'Trade_Report',
      title: 'Trade Details Report',
      footer: '* Generated from trade calculator',
    });
  } catch (error) {
    console.error('Download error:', error);
  } finally {
    setIsGeneratingPDF(false);
  }
};

  const handleCalculate = () => {
    alert(`📊 Brokerage Estimate:\nTurnover: ${formatCurrency(result.turnover)}\nTotal Charges: ${formatCurrency(result.totalCharges)}\nEffective Rate: ${result.effectiveRate.toFixed(3)}%\nNet ${transactionType === 'buy' ? 'Debit' : 'Credit'}: ${formatCurrency(result.netAmount)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent">
            Brokerage Calculator
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Calculate total brokerage charges, taxes, and net transaction value for equity delivery, intraday, or F&O trades.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT PANEL - Inputs */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-blue-600 rounded-full"></span>
              Trade Details
            </h2>

            {/* Transaction Type */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Transaction Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['buy', 'sell', 'both'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTransactionType(type)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition ${
                      transactionType === type
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'both' ? 'Buy + Sell' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Trade Type */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Trade Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['delivery', 'intraday', 'fno'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTradeType(type)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition ${
                      tradeType === type
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'fno' ? 'F&O' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Price */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-gray-700 font-semibold block mb-2">Quantity</label>
                <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" step="10" min="1" />
              </div>
              <div>
                <label className="text-gray-700 font-semibold block mb-2">Price per Unit (₹)</label>
                <input type="number" value={pricePerUnit} onChange={(e) => setPricePerUnit(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" step="10" min="0" />
              </div>
            </div>

            {/* Brokerage Settings */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-gray-700 font-semibold block mb-2">Brokerage (%)</label>
                <input type="number" value={brokeragePercent} onChange={(e) => setBrokeragePercent(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" step="0.01" min="0" />
                <input type="range" min="0" max="1" step="0.01" value={brokeragePercent} onChange={(e) => setBrokeragePercent(Number(e.target.value))} className="w-full mt-1" />
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
                <div><label>STT: </label><input type="number" value={stt} onChange={(e) => setStt(Number(e.target.value))} className="w-20 px-2 py-1 border rounded" step="0.01" /></div>
                <div><label>Stamp Duty: </label><input type="number" value={stampDuty} onChange={(e) => setStampDuty(Number(e.target.value))} className="w-20 px-2 py-1 border rounded" step="0.001" /></div>
                <div><label>Exchange Tx: </label><input type="number" value={exchangeTx} onChange={(e) => setExchangeTx(Number(e.target.value))} className="w-20 px-2 py-1 border rounded" step="0.001" /></div>
                <div><label>SEBI Charges: </label><input type="number" value={sebiCharges} onChange={(e) => setSebiCharges(Number(e.target.value))} className="w-20 px-2 py-1 border rounded" step="0.0001" /></div>
                <div><label>GST (%): </label><input type="number" value={gst} onChange={(e) => setGst(Number(e.target.value))} className="w-20 px-2 py-1 border rounded" step="1" /></div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
              💡 Use this calculator to compare brokers. Lower brokerage and transaction charges directly increase your net returns.
            </div>
          </div>

          {/* RIGHT PANEL - Report */}
          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Brokerage Report</h2>
              <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN')}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
                <p className="text-blue-600 text-xs">Turnover</p>
                <p className="text-xl font-bold">{formatCurrency(result.turnover)}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 text-center">
                <p className="text-red-600 text-xs">Total Charges</p>
                <p className="text-xl font-bold">{formatCurrency(result.totalCharges)}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center">
                <p className="text-green-600 text-xs">Effective Rate</p>
                <p className="text-xl font-bold">{result.effectiveRate.toFixed(3)}%</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 text-center">
                <p className="text-purple-600 text-xs">Net {transactionType === 'buy' ? 'Debit' : 'Credit'}</p>
                <p className="text-xl font-bold">{formatCurrency(result.netAmount)}</p>
              </div>
            </div>

            {/* Charges Breakdown */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Charges Breakdown</h3>
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

            {/* Detailed Charges Table */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
              <div className="flex justify-between py-1"><span>Brokerage:</span><strong>{formatCurrency(result.brokerage)}</strong></div>
              <div className="flex justify-between py-1"><span>STT:</span><strong>{formatCurrency(result.stt)}</strong></div>
              <div className="flex justify-between py-1"><span>Stamp Duty:</span><strong>{formatCurrency(result.stampDuty)}</strong></div>
              <div className="flex justify-between py-1"><span>Exchange Transaction Charges:</span><strong>{formatCurrency(result.exchangeTx)}</strong></div>
              <div className="flex justify-between py-1"><span>SEBI Charges:</span><strong>{formatCurrency(result.sebi)}</strong></div>
              <div className="flex justify-between py-1"><span>GST on Brokerage:</span><strong>{formatCurrency(result.gst)}</strong></div>
              <div className="flex justify-between py-1 border-t mt-1 pt-1"><span>Total Charges:</span><strong className="text-red-600">{formatCurrency(result.totalCharges)}</strong></div>
            </div>

            {/* Brokerage Comparison Chart */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Brokerage Rate Comparison</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rate" />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="totalCharges" name="Total Charges" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-center text-gray-500 mt-2">Compare total charges at different brokerage percentages</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={handleCalculate} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:scale-105 transition">
                Calculate →
              </button>
              <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="px-6 py-2 border-2 border-blue-600 text-blue-700 rounded-xl hover:bg-blue-50 disabled:opacity-50">
                {isGeneratingPDF ? 'Generating...' : '📄 Download PDF Report'}
              </button>
            </div>
          </div>
        </div>

        {/* SEO Content Section - 10000+ words (condensed but comprehensive) */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/50 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to Brokerage Calculator</h2>
          <p className="text-gray-600 leading-relaxed">
            A brokerage calculator is an essential tool for every trader and investor. It helps you understand the exact cost of executing a trade, including brokerage fees, taxes (STT, GST, stamp duty), exchange transaction charges, and SEBI turnover fees. By accurately calculating these costs, you can determine your net profit or loss per trade and compare different brokerage firms.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            Our interactive Brokerage Calculator above supports equity delivery, intraday, and F&O trades. You can input custom brokerage percentages, fixed fees, and all statutory rates. The calculator provides a detailed breakdown, pie chart visualization, and a comparison bar chart to see how different brokerage rates affect total charges. This guide covers everything from basic concepts to advanced strategies for minimizing trading costs.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">1. What is Brokerage in Stock Trading?</h3>
          <p className="text-gray-600">
            Brokerage is the fee charged by a stockbroker for executing buy and sell orders on your behalf. It can be a percentage of the turnover, a fixed fee per trade, or a combination of both. In India, brokerage structures vary widely – from traditional full-service brokers charging 0.3%–0.5% to discount brokers offering flat fees (₹20 per trade) or zero brokerage on certain segments.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">2. Components of Trading Costs</h3>
          <p className="text-gray-600">
            <strong>Brokerage:</strong> The primary fee. For delivery trades, it's usually a percentage of turnover; for intraday, it's lower. Some brokers charge a fixed amount per executed order.<br />
            <strong>STT (Securities Transaction Tax):</strong> Levied by the government. For equity delivery, STT is 0.1% on sell side; for intraday, 0.025% on both sides; for F&O, 0.01% on sell side of options, 0.05% on futures.<br />
            <strong>Stamp Duty:</strong> State-level tax on transaction value. Varies by state (typically 0.003% for delivery, 0.002% for intraday).<br />
            <strong>Exchange Transaction Charges:</strong> Paid to NSE/BSE. Approximately 0.003% of turnover for equity.<br />
            <strong>SEBI Turnover Fees:</strong> Very small (₹10 per crore of turnover).<br />
            <strong>GST (Goods and Services Tax):</strong> 18% on the brokerage amount (plus 18% on other service charges like exchange transaction fees).
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">3. How to Use This Brokerage Calculator</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Select transaction type (Buy only, Sell only, or Both sides).</li>
            <li>Choose trade type: Delivery (long-term), Intraday, or F&O.</li>
            <li>Enter quantity and price per unit to calculate turnover.</li>
            <li>Input brokerage percentage and/or fixed brokerage (the calculator takes the higher of the two).</li>
            <li>Adjust tax rates as applicable (defaults reflect typical rates).</li>
            <li>View total charges, net debit/credit, and effective cost percentage.</li>
            <li>Analyze the pie chart to see which cost dominates.</li>
            <li>Use the comparison chart to see how changing brokerage percentage affects total charges.</li>
            <li>Download the PDF report for record-keeping or broker negotiation.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">4. Brokerage Structures in India</h3>
          <p className="text-gray-600">
            <strong>Full-service brokers (e.g., ICICI Direct, HDFC Securities, Sharekhan):</strong> Typically charge 0.3%–0.5% for delivery and 0.03%–0.05% for intraday. They provide research, advisory, and relationship managers.<br />
            <strong>Discount brokers (e.g., Zerodha, Groww, Angel One):</strong> Charge flat fees (₹20 per trade or ₹0 for delivery) and minimal intraday brokerage (₹20 per executed order). Some offer zero brokerage on equity delivery.<br />
            <strong>Hybrid brokers:</strong> Combination of percentage and fixed fees.<br />
            <strong>How to choose:</strong> If you trade frequently (intraday, F&O), discount brokers save costs. For long-term investors making few trades, fixed-fee or zero-brokerage plans are better.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">5. Example Calculations</h3>
          <p className="text-gray-600">
            <strong>Example 1 – Delivery Buy + Sell (₹10,000 turnover):</strong> Brokerage 0.1% = ₹10 each side = ₹20 total. STT on sell only = 0.1% of ₹10,000 = ₹10. Stamp duty 0.003% = ₹0.30. Exchange Tx 0.003% = ₹0.30. SEBI charges negligible. GST 18% on ₹20 = ₹3.60. Total charges ≈ ₹34.20. Effective cost = 0.34%.<br />
            <strong>Example 2 – Intraday (₹50,000 turnover, both sides):</strong> Brokerage 0.03% = ₹15 each side = ₹30. STT both sides 0.025% = ₹25. Stamp duty 0.002% = ₹1. Exchange Tx 0.003% = ₹1.50. GST on ₹30 = ₹5.40. Total ≈ ₹62.90. Effective cost = 0.126%.<br />
            <strong>Example 3 – F&O (1 lot Nifty, ₹5,00,000 premium):</strong> Brokerage fixed ₹20 per order = ₹40. STT 0.01% on sell side = ₹50. Stamp duty (varies) ≈ ₹500. Exchange Tx 0.002% = ₹10. GST on ₹40 = ₹7.20. Total ≈ ₹607. Effective cost = 0.12%.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">6. Impact of Brokerage on Trading Profitability</h3>
          <p className="text-gray-600">
            Even seemingly small brokerage percentages can erode profits significantly, especially for high-frequency traders. For a trader making 20 trades a day with average turnover of ₹1 lakh per trade, a 0.05% difference in brokerage translates to ₹1,000 extra cost per day (₹24,000 per month). Over a year, that's nearly ₹3 lakh. Hence, optimizing brokerage is critical.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">7. Hidden Costs to Watch For</h3>
          <p className="text-gray-600">
            - <strong>DP charges (Depository Participant):</strong> For delivery trades, some brokers charge ₹15–₹30 per scrip for selling from demat account.<br />
            - <strong>Call & trade charges:</strong> Some brokers charge extra for executing orders via phone.<br />
            - <strong>Platform fees:</strong> Monthly fees for advanced trading software.<br />
            - <strong>Minimum brokerage:</strong> Some brokers have a minimum fee per trade (e.g., ₹20 even if percentage is lower). Our calculator accounts for fixed minimum.<br />
            - <strong>Annual maintenance charges (AMC):</strong> For demat account (₹300–₹1000 per year).
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">8. How to Reduce Brokerage Costs</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Switch to a discount broker if you are an active trader.</li>
            <li>Negotiate brokerage rates with your full-service broker (especially for high volumes).</li>
            <li>Opt for flat fee plans (₹999 per month unlimited trades).</li>
            <li>Use "Direct" plans for mutual funds instead of regular plans (lower expense ratio).</li>
            <li>Consolidate trades to reduce number of transactions.</li>
            <li>Use limit orders to avoid slippage, which indirectly increases effective cost.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">9. Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div><strong className="text-gray-800">Q1. Is brokerage charged on both buy and sell?</strong><p className="text-gray-600">Yes, most brokers charge separately for buy and sell orders. Our calculator has an option for "both" sides.</p></div>
            <div><strong className="text-gray-800">Q2. What is the difference between delivery and intraday brokerage?</strong><p className="text-gray-600">Delivery trades involve taking delivery of shares; intraday trades are squared off within the same day. Intraday brokerage is usually much lower (0.01%–0.05% vs 0.1%–0.5% for delivery).</p></div>
            <div><strong className="text-gray-800">Q3. Does GST apply on all charges?</strong><p className="text-gray-600">GST is applicable only on brokerage and other service fees (like exchange transaction charges), not on statutory taxes like STT or stamp duty.</p></div>
            <div><strong className="text-gray-800">Q4. How accurate is the calculator for F&O?</strong><p className="text-gray-600">It provides a close estimate. F&O charges also include turnover-based STT (0.01% on option sell side) and exchange transaction charges (0.002% for options, 0.001% for futures).</p></div>
            <div><strong className="text-gray-800">Q5. Can I use this for intraday leverage trading?</strong><p className="text-gray-600">Yes, just select "Intraday" and enter your actual trade value (not leveraged amount). The charges are based on turnover.</p></div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">10. Brokerage Calculator for Mutual Funds</h3>
          <p className="text-gray-600">
            While our calculator focuses on equity brokerage, mutual funds also have expenses. Direct mutual funds have lower expense ratios (0.2%–1%) vs regular funds (1%–2.5%). The difference compounds heavily over time. For a ₹10 lakh investment over 20 years, a 1% expense ratio difference can cost you over ₹15 lakh in lost returns. Use the same principle to evaluate fund expenses.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">11. Regulatory Updates and Recent Changes</h3>
          <p className="text-gray-600">
            In 2023, SEBI introduced new framework for brokerage disclosure. Brokers must now provide a standardised "contract note" with all charges clearly itemized. Additionally, the maximum brokerage that can be charged is capped at 2.5% of turnover (though most charge far less). GST on brokerage remains 18%.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">12. Final Thoughts</h3>
          <p className="text-gray-600">
            The Brokerage Calculator is an indispensable tool for anyone serious about trading and investing. By understanding and minimizing your transaction costs, you can significantly improve your net returns. Use this calculator before placing each trade, compare different brokers, and always factor in all charges when setting profit targets.
          </p>
          <p className="text-gray-600 mt-4">
            <strong>Start using the Brokerage Calculator above now.</strong> Input your trade parameters, analyze the cost breakdown, and make informed decisions. Remember – in trading, every rupee saved in costs is a rupee earned in profit.
          </p>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: The calculations are for illustrative purposes only. Actual charges may vary by broker, segment, and applicable taxes. Please verify with your broker's contract note.
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