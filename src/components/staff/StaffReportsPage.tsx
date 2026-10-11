import React, { useState } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { HISTORICAL_SALES_DATA } from '../../data/initialData';
import { RecessPeriod } from '../../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Lightbulb,
  Trash2,
  TrendingDown,
  Clock,
  Package,
} from 'lucide-react';

export const StaffReportsPage: React.FC = () => {
  const {
    menuItems,
    stalls,
    stockAnalysis,
    wastageRecords,
    recordWastage,
  } = useCanteen();

  // Record unsold food form state
  const [selectedMenuId, setSelectedMenuId] = useState<string>(
    menuItems[0]?.id || 'item-chicken-rice'
  );
  const [recessPeriod, setRecessPeriod] = useState<RecessPeriod>(
    'Lunch Break (12:15–13:30)'
  );
  const [portionsPrepared, setPortionsPrepared] = useState<string>('250');
  const [portionsSold, setPortionsSold] = useState<string>('242');
  const [notes, setNotes] = useState<string>(
    'Post-recess count logged by stall operator'
  );

  const handleLogWastage = (e: React.FormEvent) => {
    e.preventDefault();
    const prep = parseInt(portionsPrepared, 10) || 0;
    const sold = parseInt(portionsSold, 10) || 0;
    const unsold = Math.max(0, prep - sold);

    const item = menuItems.find((m) => m.id === selectedMenuId);
    const stall = stalls.find((s) => s.id === item?.stallId);
    const estCost = Number((unsold * (item ? item.price * 0.45 : 1.5)).toFixed(2));

    recordWastage({
      date: 'Today (Fri)',
      recessPeriod,
      menuItemId: selectedMenuId,
      menuItemName: item?.name || 'Canteen Dish',
      stallName: stall?.name || 'Canteen Stall',
      portionsPrepared: prep,
      portionsSold: sold,
      unsoldPortions: unsold,
      estimatedCostLost: estCost,
      notes: notes.trim() || 'Recorded post-recess',
    });
  };

  // Orders by Recess Period Chart Data
  const ordersByRecessData = [
    {
      recess: 'Morning Recess (09:30)',
      PreOrders: 112,
      WalkInSales: 148,
    },
    {
      recess: 'Upper Sec Recess (10:30)',
      PreOrders: 94,
      WalkInSales: 126,
    },
    {
      recess: 'Lunch Break (12:15)',
      PreOrders: 138,
      WalkInSales: 152,
    },
  ];

  // Queue Estimates Over Time Chart Data
  const queueOverTimeData = [
    { time: '09:30', ChickenRice: 12, Laksa: 6, Noodles: 3, Western: 4 },
    { time: '09:45', ChickenRice: 20, Laksa: 10, Noodles: 5, Western: 5 },
    { time: '10:00', ChickenRice: 15, Laksa: 8, Noodles: 4, Western: 5 },
    { time: '10:45', ChickenRice: 18, Laksa: 11, Noodles: 6, Western: 6 },
    { time: '12:30', ChickenRice: 22, Laksa: 12, Noodles: 6, Western: 7 },
    { time: '13:15', ChickenRice: 9, Laksa: 5, Noodles: 3, Western: 4 },
  ];

  // Ingredient Consumption vs Current Stock Chart Data
  const ingredientChartData = stockAnalysis.slice(0, 6).map((s) => ({
    name: s.ingredient.name.split(' (')[0],
    CurrentStock: s.ingredient.currentStock,
    DailyNeed: s.forecastDailyRequirement,
  }));

  const totalUnsoldPortions = wastageRecords.reduce(
    (sum, r) => sum + r.unsoldPortions,
    0
  );
  const totalWastageCost = wastageRecords.reduce(
    (sum, r) => sum + r.estimatedCostLost,
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Canteen Analytics, Wastage Tracker & AI Insights
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Compare historical measured sales against heuristic demand forecasts, log post-recess unsold food, and review actionable recommendations.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 tabular-nums">
          Logged Unsold Portions (Week):{' '}
          <strong className="text-slate-900">{totalUnsoldPortions} portions</strong> · Est. Cost Impact:{' '}
          <strong className="text-red-700">${totalWastageCost.toFixed(2)}</strong>
        </div>
      </div>

      {/* Actionable AI Insights Section */}
      <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-700" />
            <h2 className="text-base font-bold text-slate-900">
              Generated Operational Recommendations & Insights
            </h2>
          </div>
          <span className="text-xs font-semibold text-purple-800">
            Heuristic Pattern Analysis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-purple-100 rounded-xl p-4">
            <div className="text-xs font-bold text-purple-800 mb-1">
              Day-of-Week Demand Pattern
            </div>
            <p className="text-xs font-semibold text-slate-900">
              "Demand for chicken rice is consistently higher on Fridays."
            </p>
            <p className="text-[11px] text-slate-600 mt-1">
              Measured Friday sales average 250 portions (+11.6% vs Mon–Thu average of 224 portions). Recommend preparing 240–260 portions on Fridays.
            </p>
          </div>

          <div className="bg-white border border-purple-100 rounded-xl p-4">
            <div className="text-xs font-bold text-emerald-800 mb-1">
              Wastage Reduction Opportunity
            </div>
            <p className="text-xs font-semibold text-slate-900">
              "Laksa preparation may be reduced on low-demand days."
            </p>
            <p className="text-[11px] text-slate-600 mt-1">
              On warm (&gt;30°C) Thursdays without afternoon events, Laksa unsold portions averaged 13 bowls. Trimming prep by 8% saves ~$18/day.
            </p>
          </div>

          <div className="bg-white border border-purple-100 rounded-xl p-4">
            <div className="text-xs font-bold text-amber-800 mb-1">
              Inventory & Forecast Risk
            </div>
            <p className="text-xs font-semibold text-slate-900">
              "Rice stock may be insufficient for tomorrow's forecast."
            </p>
            <p className="text-[11px] text-slate-600 mt-1">
              Fragrant Jasmine Rice is at 2.0 kg (below 6.0 kg threshold) while forecast requires ~12.0 kg/day. Immediate replenishment advised.
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid Row 1: Sales by Day & Demand vs Actual Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Sales & Forecast vs Actual by Day */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Food Demand Forecast vs Actual Sales (By Day)
              </h2>
              <p className="text-xs text-slate-500">
                Measured daily portions sold vs AI heuristic forecast and unsold wastage
              </p>
            </div>
            <BarChart3 className="w-4 h-4 text-purple-700" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HISTORICAL_SALES_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar
                  dataKey="predictedTotalPortions"
                  name="Predicted Demand (Est.)"
                  fill="#7C3AED"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="actualTotalPortions"
                  name="Actual Sold (Measured)"
                  fill="#2563EB"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="wastagePortions"
                  name="Unsold Wastage"
                  fill="#DC2626"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Orders by Recess Period */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Orders Breakdown by Recess Period
              </h2>
              <p className="text-xs text-slate-500">
                Comparison of advance pre-orders vs walk-in counter purchases
              </p>
            </div>
            <TrendingDown className="w-4 h-4 text-blue-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersByRecessData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="recess" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar
                  dataKey="PreOrders"
                  name="Scheduled Pre-Orders"
                  stackId="a"
                  fill="#7C3AED"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="WalkInSales"
                  name="Walk-In Counter Sales"
                  stackId="a"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2: Queue Estimates Over Time & Ingredient Consumption */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Queue Estimates Over Time */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Stall Queue Waiting Time Estimates Over School Day (Minutes)
              </h2>
              <p className="text-xs text-slate-500">
                Simulated queue curve showing peak waiting times during 09:45 and 12:30 waves
              </p>
            </div>
            <Clock className="w-4 h-4 text-purple-700" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={queueOverTimeData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="ChickenRice"
                  name="Chicken Rice (min)"
                  stroke="#DC2626"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="Laksa"
                  name="Laksa (min)"
                  stroke="#D97706"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="Noodles"
                  name="Noodles (min)"
                  stroke="#16A34A"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="Western"
                  name="Western (min)"
                  stroke="#2563EB"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Ingredient Consumption vs Available Stock */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Daily Ingredient Consumption vs Current Stock
              </h2>
              <p className="text-xs text-slate-500">
                Highlights ingredients where daily recipe requirement exceeds current stock
              </p>
            </div>
            <Package className="w-4 h-4 text-purple-700" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ingredientChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar
                  dataKey="CurrentStock"
                  name="Current Stock (Measured)"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="DailyNeed"
                  name="Est. Daily Consumption"
                  fill="#7C3AED"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Post-Recess Food Wastage Logger & Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form to Record Unsold Food Quantities After Recess */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Trash2 className="w-5 h-5 text-purple-700" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Log Unsold Portions After Recess
              </h2>
              <p className="text-xs text-slate-500">
                Calculates wastage from portions prepared minus portions sold
              </p>
            </div>
          </div>

          <form onSubmit={handleLogWastage} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Menu Item
              </label>
              <select
                value={selectedMenuId}
                onChange={(e) => setSelectedMenuId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-900"
              >
                {menuItems.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Recess Period
              </label>
              <select
                value={recessPeriod}
                onChange={(e) =>
                  setRecessPeriod(e.target.value as RecessPeriod)
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-900"
              >
                <option value="Morning Recess (09:30–10:15)">
                  Morning Recess (09:30–10:15)
                </option>
                <option value="Upper Sec Recess (10:30–11:15)">
                  Upper Sec Recess (10:30–11:15)
                </option>
                <option value="Lunch Break (12:15–13:30)">
                  Lunch Break (12:15–13:30)
                </option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Portions Prepared
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={portionsPrepared}
                  onChange={(e) => setPortionsPrepared(e.target.value)}
                  className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Portions Sold
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={portionsSold}
                  onChange={(e) => setPortionsSold(e.target.value)}
                  className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between tabular-nums">
              <span className="text-slate-600">Calculated Unsold Wastage:</span>
              <span className="font-mono font-bold text-red-700">
                {Math.max(
                  0,
                  (parseInt(portionsPrepared, 10) || 0) -
                    (parseInt(portionsSold, 10) || 0)
                )}{' '}
                portions
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Notes / Cause
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-xl transition-colors"
            >
              Record Post-Recess Wastage
            </button>
          </form>
        </div>

        {/* Recorded Wastage History Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">
              Recorded Food Wastage Log (Measured vs Prepared)
            </h2>
            <p className="text-xs text-slate-500">
              Historical log used to refine future portion preparation buffers
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                  <th className="py-3 px-4">Date & Recess</th>
                  <th className="py-3 px-4">Dish & Stall</th>
                  <th className="py-3 px-4 text-right">Prepared</th>
                  <th className="py-3 px-4 text-right">Sold</th>
                  <th className="py-3 px-4 text-right">Unsold Wastage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs tabular-nums">
                {wastageRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{rec.date}</div>
                      <div className="text-[11px] text-slate-500">
                        {rec.recessPeriod.split(' (')[0]}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {rec.menuItemName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {rec.notes}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      {rec.portionsPrepared}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      {rec.portionsSold}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-red-700">
                      {rec.unsoldPortions} portions (${rec.estimatedCostLost.toFixed(2)})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
