'use client';

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';

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

// Calculate break-even metrics
const calculateBreakEven = (
  fixedCosts: number,
  variableCostPerUnit: number,
  sellingPricePerUnit: number
) => {
  const contributionMarginPerUnit = sellingPricePerUnit - variableCostPerUnit;
  const breakEvenUnits = contributionMarginPerUnit > 0 ? fixedCosts / contributionMarginPerUnit : Infinity;
  const breakEvenRevenue = breakEvenUnits * sellingPricePerUnit;
  const contributionMarginRatio = sellingPricePerUnit > 0 ? contributionMarginPerUnit / sellingPricePerUnit : 0;
  
  const safeUnits = breakEvenUnits * 1.2;
  const profitAtSafeUnits = (contributionMarginPerUnit * safeUnits) - fixedCosts;
  const marginOfSafetyUnits = safeUnits - breakEvenUnits;
  const marginOfSafetyRevenue = marginOfSafetyUnits * sellingPricePerUnit;
  
  return {
    contributionMarginPerUnit,
    breakEvenUnits: Math.max(0, breakEvenUnits),
    breakEvenRevenue,
    contributionMarginRatio,
    profitAtSafeUnits,
    marginOfSafetyUnits,
    marginOfSafetyRevenue,
    isFeasible: contributionMarginPerUnit > 0,
  };
};

// Generate data for break-even chart
const getChartData = (
  fixedCosts: number,
  variableCostPerUnit: number,
  sellingPricePerUnit: number,
  maxUnits: number
) => {
  const data = [];
  const step = Math.max(1, Math.floor(maxUnits / 20));
  for (let units = 0; units <= maxUnits; units += step) {
    const totalCost = fixedCosts + variableCostPerUnit * units;
    const totalRevenue = sellingPricePerUnit * units;
    data.push({
      units,
      totalCost,
      totalRevenue,
      profit: totalRevenue - totalCost,
    });
  }
  if (data[data.length - 1]?.units !== maxUnits) {
    const totalCost = fixedCosts + variableCostPerUnit * maxUnits;
    const totalRevenue = sellingPricePerUnit * maxUnits;
    data.push({
      units: maxUnits,
      totalCost,
      totalRevenue,
      profit: totalRevenue - totalCost,
    });
  }
  return data;
};

// Helper for compact currency formatting on chart axes
function formatCompactCurrency(value: number): string {
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(1)}Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(1)}L`;
  if (value >= 1e3) return `₹${(value / 1e3).toFixed(0)}K`;
  return `₹${value}`;
}

// --- Main Component ---
export default function BreakEvenCalculator() {
  const [fixedCosts, setFixedCosts] = useState<number>(50000);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState<number>(200);
  const [sellingPricePerUnit, setSellingPricePerUnit] = useState<number>(500);

  const result = useMemo(
    () => calculateBreakEven(fixedCosts, variableCostPerUnit, sellingPricePerUnit),
    [fixedCosts, variableCostPerUnit, sellingPricePerUnit]
  );

  const maxUnits = useMemo(() => {
    if (!result.isFeasible) return 1000;
    return Math.max(500, Math.ceil(result.breakEvenUnits * 3));
  }, [result.breakEvenUnits, result.isFeasible]);

  const chartData = useMemo(
    () => getChartData(fixedCosts, variableCostPerUnit, sellingPricePerUnit, maxUnits),
    [fixedCosts, variableCostPerUnit, sellingPricePerUnit, maxUnits]
  );

  const breakEvenPoint = useMemo(() => {
    if (!result.isFeasible) return null;
    return { units: result.breakEvenUnits, revenue: result.breakEvenRevenue };
  }, [result]);

  // Prepare data for table and download
  const tableData = useMemo(() => [
    { metric: 'Fixed Costs', value: formatCurrency(fixedCosts) },
    { metric: 'Variable Cost per Unit', value: formatCurrency(variableCostPerUnit) },
    { metric: 'Selling Price per Unit', value: formatCurrency(sellingPricePerUnit) },
    { metric: 'Contribution Margin per Unit', value: formatCurrency(result.contributionMarginPerUnit) },
    { metric: 'Break-even Units', value: result.isFeasible ? formatNumber(result.breakEvenUnits) : '∞' },
    { metric: 'Break-even Revenue', value: result.isFeasible ? formatCurrency(result.breakEvenRevenue) : 'N/A' },
    { metric: 'Contribution Margin Ratio', value: `${(result.contributionMarginRatio * 100).toFixed(1)}%` },
    { metric: 'Margin of Safety (Units at +20%)', value: result.isFeasible ? formatNumber(result.marginOfSafetyUnits) : 'N/A' },
    { metric: 'Margin of Safety (Revenue at +20%)', value: result.isFeasible ? formatCurrency(result.marginOfSafetyRevenue) : 'N/A' },
    { metric: 'Profit at 20% above BE', value: result.isFeasible ? formatCurrency(result.profitAtSafeUnits) : 'N/A' },
  ], [fixedCosts, variableCostPerUnit, sellingPricePerUnit, result]);

  // Download as .txt file (table format)
  const handleDownloadData = () => {
    const header = 'Break-even Analysis Report\n';
    const dateLine = `Date: ${new Date().toLocaleDateString('en-IN')}\n`;
    const separator = '--------------------------------------------------\n';
    const rows = tableData.map(row => `${row.metric}: ${row.value}`).join('\n');
    const footer = '\n--------------------------------------------------\n* Calculations based on inputs provided.';
    const textContent = header + dateLine + separator + rows + footer;
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BreakEven_Report_${new Date().toISOString().slice(0, 19)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAnalyze = () => {
    if (!result.isFeasible) {
      alert(`⚠️ Warning: Selling price (${formatCurrency(sellingPricePerUnit)}) is less than or equal to variable cost (${formatCurrency(variableCostPerUnit)}). Break-even is not achievable.`);
      return;
    }
    alert(`📊 Break-even Analysis:\nFixed Costs: ${formatCurrency(fixedCosts)}\nVariable Cost/Unit: ${formatCurrency(variableCostPerUnit)}\nSelling Price/Unit: ${formatCurrency(sellingPricePerUnit)}\n\n✅ Break-even Units: ${formatNumber(result.breakEvenUnits)} units\n💰 Break-even Revenue: ${formatCurrency(result.breakEvenRevenue)}\n📈 Contribution Margin/Unit: ${formatCurrency(result.contributionMarginPerUnit)}\n🎯 Margin of Safety (20% above BE): ${formatNumber(result.marginOfSafetyUnits)} units`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
            Break-even Calculator
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Determine the point where your total revenue equals total costs. Essential for business planning, pricing strategy, and investment decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Input Controls */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-indigo-600 rounded-full"></span>
              Cost & Revenue Details
            </h2>

            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Total Fixed Costs</label>
              <input
                type="number"
                value={fixedCosts}
                onChange={(e) => setFixedCosts(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                step="1000"
                min="0"
              />
              <input
                type="range"
                min="0"
                max="500000"
                step="5000"
                value={fixedCosts}
                onChange={(e) => setFixedCosts(Number(e.target.value))}
                className="w-full mt-2 accent-indigo-600"
              />
              <p className="text-xs text-gray-500 mt-1">Rent, salaries, insurance, depreciation, etc.</p>
            </div>

            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Variable Cost per Unit</label>
              <input
                type="number"
                value={variableCostPerUnit}
                onChange={(e) => setVariableCostPerUnit(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none"
                step="10"
                min="0"
              />
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={variableCostPerUnit}
                onChange={(e) => setVariableCostPerUnit(Number(e.target.value))}
                className="w-full mt-2 accent-purple-600"
              />
              <p className="text-xs text-gray-500 mt-1">Raw materials, direct labor, shipping, commissions</p>
            </div>

            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Selling Price per Unit</label>
              <input
                type="number"
                value={sellingPricePerUnit}
                onChange={(e) => setSellingPricePerUnit(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
                step="10"
                min="0"
              />
              <input
                type="range"
                min="0"
                max="2000"
                step="10"
                value={sellingPricePerUnit}
                onChange={(e) => setSellingPricePerUnit(Number(e.target.value))}
                className="w-full mt-2 accent-pink-600"
              />
            </div>

            {!result.isFeasible && sellingPricePerUnit <= variableCostPerUnit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm">
                ⚠️ Selling price must be greater than variable cost to achieve break-even.
              </div>
            )}

            <div className="bg-indigo-50 rounded-xl p-4 text-sm text-indigo-800">
              💡 Break-even point is where total revenue equals total costs. Below this, you incur a loss; above, you make a profit.
            </div>
          </div>

          {/* RIGHT: Report & Charts */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Break-even Report</h2>
              <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN')}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                <p className="text-gray-600 text-sm">Break-even Units</p>
                <p className="text-2xl font-bold text-blue-700">
                  {result.isFeasible ? formatNumber(result.breakEvenUnits) : '∞'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                <p className="text-gray-600 text-sm">Break-even Revenue</p>
                <p className="text-2xl font-bold text-green-700">
                  {result.isFeasible ? formatCurrency(result.breakEvenRevenue) : 'N/A'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                <p className="text-gray-600 text-sm">Contribution Margin (per unit)</p>
                <p className="text-xl font-bold text-purple-700">{formatCurrency(result.contributionMarginPerUnit)}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center">
                <p className="text-gray-600 text-sm">Contribution Margin Ratio</p>
                <p className="text-xl font-bold text-amber-700">{(result.contributionMarginRatio * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 mb-4">
              Fixed: {formatCurrency(fixedCosts)} | Variable/unit: {formatCurrency(variableCostPerUnit)} | Selling/unit: {formatCurrency(sellingPricePerUnit)}
            </div>

            {/* Break-even Chart */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Break-even Analysis Chart</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="units" tickFormatter={(u) => formatNumber(u)} label={{ value: 'Units Sold', position: 'insideBottom', offset: -5 }} />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} width={80} label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} labelFormatter={(label) => `Units: ${formatNumber(label)}`} />
                    <Legend />
                    <Line type="monotone" dataKey="totalRevenue" name="Total Revenue" stroke="#10B981" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="totalCost" name="Total Cost" stroke="#EF4444" strokeWidth={3} dot={false} />
                    <Area type="monotone" dataKey="profit" name="Profit/Loss" fill="#8B5CF6" stroke="#8B5CF6" fillOpacity={0.2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              {result.isFeasible && breakEvenPoint && (
                <div className="text-xs text-center text-gray-500 mt-2">
                  📍 Break-even at {formatNumber(breakEvenPoint.units)} units (Revenue: {formatCurrency(breakEvenPoint.revenue)})
                </div>
              )}
            </div>

            {/* Data Table (shown on screen) */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-2">📊 Break-even Metrics Table</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-200 rounded-lg">
                  <tbody>
                    {tableData.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-2 font-medium text-gray-700 border-r">{row.metric}</td>
                        <td className="px-4 py-2 text-gray-900 font-semibold">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={handleAnalyze} className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:scale-105 transition">
                Analyze Break-even →
              </button>
              <button onClick={handleDownloadData} className="px-6 py-2 border-2 border-indigo-600 text-indigo-700 rounded-xl hover:bg-indigo-50">
                📄 Download Report as .txt
              </button>
            </div>
          </div>
        </div>

        {/* SEO Content Section (unchanged) */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/50 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to Break-even Calculator</h2>
          <p className="text-gray-600 leading-relaxed">
            Break-even analysis is a fundamental financial tool used by businesses, entrepreneurs, and investors to determine when an investment or product will start generating profit. It tells you the exact number of units you need to sell or the revenue required to cover all costs – both fixed and variable.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            Our interactive <strong>Break-even Calculator</strong> above computes the break-even point in units and revenue, contribution margin per unit, contribution margin ratio, and margin of safety. It also generates a visual chart showing total revenue, total cost, and profit/loss at different sales volumes. In this comprehensive guide, we will explore the mathematics of break-even, practical applications, limitations, and strategic insights.
          </p>
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">1. Understanding the Break-even Formula</h3>
          <p className="text-gray-600">
            The break-even point in units is calculated as:
            <br />
            <code className="bg-gray-100 p-1 rounded">Break-even Units = Fixed Costs / (Selling Price per Unit – Variable Cost per Unit)</code>
            <br />
            The denominator is called the <strong>Contribution Margin per Unit</strong>. The break-even revenue is simply break-even units multiplied by selling price.
            <br />
            <strong>Contribution Margin Ratio</strong> = Contribution Margin per Unit / Selling Price per Unit. It shows the percentage of each sales rupee that contributes to covering fixed costs and profit.
          </p>
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">2. Why Break-even Analysis is Critical</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Pricing decisions:</strong> Determine minimum price to avoid losses.</li>
            <li><strong>Investment appraisal:</strong> Evaluate how many units must be sold to justify a new project.</li>
            <li><strong>Cost control:</strong> Identify impact of fixed and variable cost changes.</li>
            <li><strong>Profit planning:</strong> Set sales targets for desired profit levels.</li>
            <li><strong>Risk assessment:</strong> Lower break-even point means lower business risk.</li>
          </ul>
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">3. Components of Break-even Analysis</h3>
          <p className="text-gray-600">
            - <strong>Fixed Costs:</strong> Costs that do not change with production volume (rent, salaries, insurance, depreciation, loan interest).<br />
            - <strong>Variable Costs:</strong> Costs that vary directly with production (raw materials, direct labor, packaging, shipping).<br />
            - <strong>Selling Price:</strong> The price at which each unit is sold.<br />
            - <strong>Contribution Margin:</strong> Selling price minus variable cost. It contributes to covering fixed costs.<br />
            - <strong>Margin of Safety:</strong> Excess of actual or projected sales over break-even sales. It indicates how much sales can drop before losses occur.
          </p>
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">4. How to Use This Break-even Calculator</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Enter your total fixed costs (monthly or annual).</li>
            <li>Enter variable cost per unit (cost to produce one unit).</li>
            <li>Enter selling price per unit.</li>
            <li>The calculator instantly shows break-even units, revenue, contribution margin, and margin of safety.</li>
            <li>View the interactive chart showing revenue, cost, and profit at different sales volumes.</li>
            <li>Download the report as a .txt file for documentation.</li>
          </ul>
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">5. Practical Examples</h3>
          <p className="text-gray-600">
            <strong>Example 1 – Small Cafe:</strong> Fixed costs (rent + salaries) = ₹1,00,000/month. Variable cost per coffee = ₹50. Selling price = ₹150. Contribution margin = ₹100. Break-even units = 1,00,000/100 = 1,000 coffees per month.<br />
            <strong>Example 2 – Manufacturing:</strong> Fixed costs ₹5,00,000, variable cost ₹200/unit, selling price ₹500. Break-even = 5,00,000/(500-200) = 1,667 units.<br />
            <strong>Example 3 – Service Business:</strong> Fixed costs ₹2,00,000, variable cost per billable hour ₹500, hourly rate ₹1,500. Break-even hours = 2,00,000/1,000 = 200 hours.
          </p>
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">6. Margin of Safety and Its Importance</h3>
          <p className="text-gray-600">
            Margin of Safety (MOS) = (Current Sales – Break-even Sales) / Current Sales × 100. A high MOS means the business can withstand sales declines without incurring losses. For example, if break-even is 1,000 units and you sell 1,500 units, MOS = 500/1,500 = 33.3%. Investors prefer companies with MOS &gt; 20%.
          </p>
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">7. Limitations of Break-even Analysis</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Assumes linearity:</strong> Costs and revenues are linear, which may not hold at very high volumes (discounts, capacity constraints).</li>
            <li><strong>Fixed costs may change:</strong> Step costs (e.g., new machinery) can alter break-even.</li>
            <li><strong>Ignores time value of money:</strong> Not suitable for long-term projects without discounting.</li>
            <li><strong>Single product focus:</strong> For multiple products, weighted average contribution margin needed.</li>
          </ul>
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">8. Strategies to Lower Break-even Point</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Reduce fixed costs (outsource non-core activities, negotiate rent).</li>
            <li>Reduce variable costs (bulk purchasing, automation, cheaper raw materials).</li>
            <li>Increase selling price (if demand is inelastic).</li>
            <li>Improve product mix to favor higher contribution margin items.</li>
            <li>Increase operational efficiency to reduce waste.</li>
          </ul>
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">9. Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div><strong className="text-gray-800">Q1. What is a good break-even point?</strong><p className="text-gray-600">There's no universal number. Lower break-even units relative to market size are better. For most small businesses, break-even within 6-12 months is considered healthy.</p></div>
            <div><strong className="text-gray-800">Q2. Can break-even be negative?</strong><p className="text-gray-600">No. If selling price is less than variable cost, break-even is impossible (infinite). Our calculator shows "∞".</p></div>
            <div><strong className="text-gray-800">Q3. How often should I recalculate break-even?</strong><p className="text-gray-600">Whenever costs or prices change significantly. Monthly for dynamic businesses, quarterly for stable ones.</p></div>
            <div><strong className="text-gray-800">Q4. Does break-even include taxes?</strong><p className="text-gray-600">Typically not. For after-tax break-even, adjust profit target: Required profit before tax = Desired after-tax profit / (1 – tax rate). Then add to fixed costs.</p></div>
            <div><strong className="text-gray-800">Q5. Can I use this for multi-product businesses?</strong><p className="text-gray-600">Yes, if you calculate weighted average contribution margin based on sales mix. Our calculator is best for single product or average margins.</p></div>
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">10. Break-even for Investment Decisions</h3>
          <p className="text-gray-600">
            When evaluating a new project, break-even analysis helps determine the minimum sales volume required to recover the initial investment. Combine with payback period and NPV for a complete picture. For example, if a new machine costs ₹10 lakhs and increases contribution margin by ₹200 per unit, break-even units = 10,00,000/200 = 5,000 units.
          </p>
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">11. Final Thoughts</h3>
          <p className="text-gray-600">
            The Break-even Calculator is an essential tool for anyone running a business, launching a product, or making investment decisions. It transforms abstract cost structures into actionable sales targets. Use it regularly to test scenarios – what if fixed costs increase? What if raw material prices rise? What if you raise prices?
          </p>
          <p className="text-gray-600 mt-4">
            <strong>Start using our Break-even Calculator above now.</strong> Enter your numbers, visualize the chart, and download your report. A clear understanding of your break-even point is the first step toward profitability and sustainable growth.
          </p>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: The calculations are for illustrative purposes only. Actual business performance may vary due to market conditions, cost fluctuations, and other factors.
          </div>
        </div>
      </div>
    </div>
  );
}