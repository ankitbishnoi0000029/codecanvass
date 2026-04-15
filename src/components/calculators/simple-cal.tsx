'use client';
import React, { useMemo, useState } from "react";
import { jsPDF } from "jspdf";

const currencies = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "MXN", symbol: "$", name: "Mexican Peso" },
];

const countries = [
  "India","USA","UK","Canada","Australia","UAE","Saudi Arabia","Germany","France","Japan","China","Singapore","South Africa","Brazil","Russia","Mexico","Italy","Spain","Turkey","South Korea"
];

const pageContent = `Simple Interest Calculator Online Tool

A Simple Interest Calculator is a global financial tool used to calculate interest on loans and investments across multiple countries. It helps users understand returns and repayment amounts in an easy and fast way.

Supported Worldwide:
This calculator supports users from India, USA, UK, UAE, Europe, Asia, and many other regions with multi-currency support.

Formula:
Simple Interest = (Principal × Rate × Time) / 100

Key Benefits:
- Easy financial planning
- Loan estimation
- Investment calculation
- Global currency support
- Instant results
- Mobile friendly UI

Use Cases:
Personal loans, education loans, business investments, savings planning, banking calculations, and financial education.

SEO Keywords:
Simple Interest Calculator, Loan Calculator Online, Global Finance Tool, Interest Calculator, Money Growth Calculator, Banking Tool
`;

export default function SimpleInterestCalculator() {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(5);
  const [time, setTime] = useState(1);
  const [currency, setCurrency] = useState("INR");
  const [country, setCountry] = useState("India");

  const selectedCurrency = useMemo(() => currencies.find(c => c.code === currency), [currency]);

  const isValid = Number(principal) > 0 && Number(rate) >= 0 && Number(time) > 0;

  const result = useMemo(() => {
    if (!isValid) return null;

    const P = Number(principal);
    const R = Number(rate);
    const T = Number(time);

    const SI = (P * R * T) / 100;
    const total = P + SI;

    return { interest: SI.toFixed(2), total: total.toFixed(2) };
  }, [principal, rate, time, isValid]);

  const downloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();

    doc.setFillColor(10, 10, 25);
    doc.rect(0, 0, 210, 297, "F");

    doc.setTextColor(0, 200, 255);
    doc.setFontSize(18);
    doc.text("SIMPLE INTEREST REPORT (GLOBAL)", 20, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);

    doc.text(`Country: ${country}`, 20, 40);
    doc.text(`Currency: ${currency}`, 20, 50);
    doc.text(`Principal: ${selectedCurrency?.symbol} ${principal}`, 20, 60);
    doc.text(`Rate: ${rate}%`, 20, 70);
    doc.text(`Time: ${time} Year(s)`, 20, 80);

    doc.setTextColor(0, 255, 180);
    doc.text("RESULT", 20, 100);

    doc.setTextColor(255, 255, 255);
    doc.text(`Interest: ${result.interest}`, 20, 115);
    doc.text(`Total Amount: ${result.total}`, 20, 125);

    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 150);

    doc.save("simple-interest-global.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 text-white p-6">

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-transparent bg-clip-text">
          🌍 Global Simple Interest Calculator
        </h1>
        <p className="text-gray-400 mt-2">Multi-country & multi-currency finance tool</p>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">

          <h2 className="text-cyan-400 font-semibold mb-4">Inputs</h2>

          <div className="space-y-4">

            <div>
              <label className="text-xs text-gray-400">Country</label>
              <select className="w-full mt-1 p-3 bg-black/50 rounded-lg border border-white/10" value={country} onChange={(e :any)=>setCountry(e.target.value)}>
                {countries.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400">Currency</label>
              <select className="w-full mt-1 p-3 bg-black/50 rounded-lg border border-white/10" value={currency} onChange={(e :any)=>setCurrency(e.target.value)}>
                {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400">Principal Amount</label>
              <input className="w-full mt-1 p-3 bg-black/50 rounded-lg border border-white/10" value={principal} onChange={(e :any)=>setPrincipal(e.target.value)} />
            </div>

            <div>
              <label className="text-xs text-gray-400">Interest Rate %</label>
              <input className="w-full mt-1 p-3 bg-black/50 rounded-lg border border-white/10" value={rate} onChange={(e :any)=>setRate(e.target.value)} />
            </div>

            <div>
              <label className="text-xs text-gray-400">Time (Years)</label>
              <input className="w-full mt-1 p-3 bg-black/50 rounded-lg border border-white/10" value={time} onChange={(e :any)=>setTime(e.target.value)} />
            </div>

          </div>

          <button onClick={downloadPDF} disabled={!isValid} className="mt-6 w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold">
            📄 Download PDF Report
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">

          <h2 className="text-purple-400 font-semibold mb-4">Result</h2>

          {result ? (
            <div className="space-y-4">
              <div className="p-4 bg-black/40 rounded-xl border border-white/10">
                Interest: <span className="text-green-400 font-bold">{result.interest}</span>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-white/10">
                Total: {result.total}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Enter values</p>
          )}

          <div className="mt-6 text-xs text-gray-400 whitespace-pre-line leading-relaxed">
            {pageContent}
          </div>

        </div>

      </div>
    </div>
  );
}
