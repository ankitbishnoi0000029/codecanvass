'use client'
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

export default function EMICalculatorGlobal() {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(10);
  const [time, setTime] = useState(24);
  const [timeType, setTimeType] = useState("months");
  const [currency, setCurrency] = useState("INR");

  const selectedCurrency = useMemo(
    () => currencies.find((c) => c.code === currency),
    [currency]
  );

  const parsedAmount = parseFloat(amount as unknown as string);
  const parsedRate = parseFloat(rate as unknown as string); ;
  const parsedTime = parseFloat(time as unknown as string);

  const months = timeType === "years" ? parsedTime * 12 : parsedTime;

  const isValid =
    parsedAmount > 0 && parsedRate >= 0 && parsedTime > 0 &&
    !isNaN(parsedAmount) && !isNaN(parsedRate) && !isNaN(parsedTime);

  const emiData = useMemo(() => {
    if (!isValid) return null;

    const P = parsedAmount;
    const r = parsedRate / 12 / 100;
    const N = months;

    if (r === 0) {
      const emi = P / N;
      return {
        emi: emi.toFixed(2),
        totalPayment: P.toFixed(2),
        totalInterest: "0.00",
        months: N,
      };
    }

    const emi = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
    const totalPayment = emi * N;
    const totalInterest = totalPayment - P;

    return {
      emi: emi.toFixed(2),
      totalPayment: totalPayment.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      months: N,
    };
  }, [parsedAmount, parsedRate, parsedTime, timeType]);

  const downloadReceipt = () => {
    if (!emiData || !isValid) return;

    const doc = new jsPDF();

    doc.setFillColor(15, 15, 25);
    doc.rect(0, 0, 210, 297, "F");

    doc.setTextColor(0, 200, 255);
    doc.setFontSize(20);
    doc.text("EMI CALCULATOR REPORT", 20, 25);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);

    doc.text(`Loan Amount: ${selectedCurrency?.symbol} ${parsedAmount}`, 20, 45);
    doc.text(`Interest Rate: ${parsedRate}%`, 20, 55);
    doc.text(`Tenure: ${parsedTime} ${timeType}`, 20, 65);
    doc.text(`Currency: ${currency}`, 20, 75);

    doc.setTextColor(0, 255, 180);
    doc.text("EMI BREAKDOWN", 20, 95);

    doc.setTextColor(255, 255, 255);
    doc.text(`Monthly EMI: ${selectedCurrency?.symbol} ${emiData.emi}`, 20, 110);
    doc.text(`Total Payment: ${selectedCurrency?.symbol} ${emiData.totalPayment}`, 20, 120);
    doc.text(`Total Interest: ${selectedCurrency?.symbol} ${emiData.totalInterest}`, 20, 130);
    doc.text(`Duration: ${emiData.months} months`, 20, 140);

    doc.setTextColor(180, 180, 180);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 165);

    doc.save("emi-report.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 text-white p-6">

      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-transparent bg-clip-text">
          🌍 EMI Calculator Pro
        </h1>
        <p className="text-gray-400 mt-2">Modern global loan calculator</p>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4 text-cyan-400">Loan Inputs</h2>

          {!isValid && (
            <p className="text-red-400 text-sm mb-3">⚠ Please enter valid numeric values</p>
          )}

          <div className="space-y-4">

            <div>
              <label className="text-xs text-gray-400">Loan Amount</label>
              <input
                className="w-full mt-1 p-3 rounded-lg bg-black/50 border border-white/10"
                value={amount}
                onChange={(e : any) => setAmount(e.target.value )}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400">Interest Rate (%)</label>
              <input
                className="w-full mt-1 p-3 rounded-lg bg-black/50 border border-white/10"
                value={rate}
                onChange={(e : any) => setRate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400">Tenure</label>
              <div className="flex gap-2 mt-1">
                <input
                  className="flex-1 p-3 rounded-lg bg-black/50 border border-white/10"
                  value={time}
                  onChange={(e : any) => setTime(e.target.value)}
                />
                <select
                  className="p-3 rounded-lg bg-black/50 border border-white/10"
                  value={timeType}
                  onChange={(e) => setTimeType(e.target.value)}
                >
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400">Currency</label>
              <select
                className="w-full mt-1 p-3 rounded-lg bg-black/50 border border-white/10"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <button
            disabled={!isValid}
            onClick={downloadReceipt}
            className="mt-6 w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold disabled:opacity-50"
          >
            Download PDF Receipt
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4 text-purple-400">Results</h2>

          {emiData ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                EMI: <span className="text-green-400 font-bold">
                  {selectedCurrency?.symbol} {emiData.emi}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                Total: {selectedCurrency?.symbol} {emiData.totalPayment}
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                Interest: {selectedCurrency?.symbol} {emiData.totalInterest}
              </div>

              <div className="text-sm text-gray-400">
                Duration: {emiData.months} months
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Enter valid values</p>
          )}
        </div>

      </div>
    </div>
  );
}
