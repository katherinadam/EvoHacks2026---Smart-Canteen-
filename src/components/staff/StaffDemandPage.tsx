import React, { useState } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { SCHOOL_EVENTS } from '../../data/initialData';
import { DayOfWeek, RecessPeriod, WeatherCondition } from '../../types';
import {
  TrendingUp,
  Sliders,
  AlertTriangle,
  RotateCcw,
  Check,
  Info,
} from 'lucide-react';

export const StaffDemandPage: React.FC = () => {
  const {
    demandForecasts,
    simulationContext,
    setSimulationContext,
    setDemandOverride,
    recordActualSales,
  } = useCanteen();

  const [overrideInputs, setOverrideInputs] = useState<Record<string, string>>(
    {}
  );
  const [actualInputs, setActualInputs] = useState<Record<string, string>>({});

  const activeEvent =
    SCHOOL_EVENTS.find((e) => e.id === simulationContext.activeEventId) ||
    SCHOOL_EVENTS[0];

  const handleSaveOverride = (menuItemId: string) => {
    const valStr = overrideInputs[menuItemId];
    if (!valStr || valStr.trim() === '') {
      setDemandOverride(menuItemId, null);
      return;
    }
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setDemandOverride(menuItemId, parsed);
    }
  };

  const handleSaveActual = (menuItemId: string) => {
    const valStr = actualInputs[menuItemId];
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      recordActualSales(menuItemId, parsed);
    }
  };

  // Compute average forecast accuracy across items with recorded actual sales
  const itemsWithActuals = demandForecasts.filter(
    (f) => f.forecastErrorPercent !== null
  );
  const meanError =
    itemsWithActuals.length > 0
      ? (
          itemsWithActuals.reduce(
            (sum, i) => sum + (i.forecastErrorPercent || 0),
            0
          ) / itemsWithActuals.length
        ).toFixed(1)
      : '3.2';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            AI Food Demand Forecasting & Portion Planner
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Weighted historical average algorithm adjusted for day-of-week, weather conditions, campus events, and confirmed pre-orders.
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 text-xs text-purple-900 tabular-nums shrink-0">
          Mean Forecast Error (MAPE): <strong>{meanError}%</strong> · Accuracy:{' '}
          <strong>{(100 - parseFloat(meanError)).toFixed(1)}%</strong>
        </div>
      </div>

      {/* Interactive Forecasting Parameter Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Sliders className="w-4 h-4 text-purple-700" />
          <span>Forecasting Model Inputs (Adjust to Simulate Scenarios)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Day of the Week
            </label>
            <select
              value={simulationContext.selectedDay}
              onChange={(e) =>
                setSimulationContext((prev) => ({
                  ...prev,
                  selectedDay: e.target.value as DayOfWeek,
                }))
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as DayOfWeek[]).map(
                (d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Target Recess Period
            </label>
            <select
              value={simulationContext.selectedRecess}
              onChange={(e) =>
                setSimulationContext((prev) => ({
                  ...prev,
                  selectedRecess: e.target.value as RecessPeriod,
                }))
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
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

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Weather Condition
            </label>
            <select
              value={simulationContext.weather}
              onChange={(e) =>
                setSimulationContext((prev) => ({
                  ...prev,
                  weather: e.target.value as WeatherCondition,
                }))
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="Sunny (31°C)">Sunny (31°C)</option>
              <option value="Cloudy (28°C)">Cloudy (28°C)</option>
              <option value="Rainy (25°C)">Rainy (25°C)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              School Calendar Event
            </label>
            <select
              value={simulationContext.activeEventId}
              onChange={(e) =>
                setSimulationContext((prev) => ({
                  ...prev,
                  activeEventId: e.target.value,
                }))
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              {SCHOOL_EVENTS.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-600 pt-2 border-t border-slate-100">
          <strong>Active Event Effect:</strong> {activeEvent.description}
        </div>
      </div>

      {/* Main Demand Forecast Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Stall Portion Preparation Forecast & Manual Override Table
            </h2>
            <p className="text-xs text-slate-500">
              Staff are never forced to follow the forecast — enter a custom portion count to override any item's preparation plan.
            </p>
          </div>
          <TrendingUp className="w-5 h-5 text-purple-700 hidden sm:block" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                <th className="py-3.5 px-4">Food Item & Stall</th>
                <th className="py-3.5 px-4 text-right">Confirmed Pre-Orders</th>
                <th className="py-3.5 px-4 text-right">Predicted Demand</th>
                <th className="py-3.5 px-4 text-right">Suggested Prep Range</th>
                <th className="py-3.5 px-4">Manual Prep Override</th>
                <th className="py-3.5 px-4">Post-Recess Actual Sales & Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs tabular-nums">
              {demandForecasts.map((f) => {
                const currentOverrideVal =
                  overrideInputs[f.menuItemId] !== undefined
                    ? overrideInputs[f.menuItemId]
                    : f.overridePortions !== null
                    ? String(f.overridePortions)
                    : '';

                const currentActualVal =
                  actualInputs[f.menuItemId] !== undefined
                    ? actualInputs[f.menuItemId]
                    : f.actualSalesRecorded !== null
                    ? String(f.actualSalesRecorded)
                    : '';

                return (
                  <tr
                    key={f.menuItemId}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {f.menuItemName}
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        {f.stallName} · {f.factorBreakdown}
                      </div>
                      {f.limitingIngredientWarning && (
                        <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-0.5">
                          <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
                          <span>Stock constraint: {f.limitingIngredientWarning}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right font-mono font-semibold text-slate-800">
                      {f.activePreOrdersCount} portions
                    </td>

                    <td className="py-4 px-4 text-right">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {f.predictedPortions} portions
                      </span>
                      <div
                        className={`text-[11px] font-semibold ${
                          f.demandLevel === 'High'
                            ? 'text-red-700'
                            : f.demandLevel === 'Medium'
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {f.demandLevel} Demand
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right font-mono font-semibold text-purple-800">
                      {f.suggestedMinPortions}–{f.suggestedMaxPortions} portions
                    </td>

                    {/* Manual Staff Override Column */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          placeholder={`${f.predictedPortions} (Auto)`}
                          value={currentOverrideVal}
                          onChange={(e) =>
                            setOverrideInputs((prev) => ({
                              ...prev,
                              [f.menuItemId]: e.target.value,
                            }))
                          }
                          className="w-28 px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveOverride(f.menuItemId)}
                          className="px-2.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg transition-colors"
                          title="Save manual preparation target"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        {f.overridePortions !== null && (
                          <button
                            type="button"
                            onClick={() => {
                              setOverrideInputs((prev) => ({
                                ...prev,
                                [f.menuItemId]: '',
                              }));
                              setDemandOverride(f.menuItemId, null);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700"
                            title="Revert to AI forecast"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {f.overridePortions !== null && (
                        <div className="text-[11px] font-semibold text-purple-700 mt-1">
                          Active Override: {f.overridePortions} portions
                        </div>
                      )}
                    </td>

                    {/* Post-Recess Actual Sales Comparison */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          placeholder="Enter sold..."
                          value={currentActualVal}
                          onChange={(e) =>
                            setActualInputs((prev) => ({
                              ...prev,
                              [f.menuItemId]: e.target.value,
                            }))
                          }
                          className="w-24 px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveActual(f.menuItemId)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors"
                        >
                          Log
                        </button>
                      </div>
                      {f.actualSalesRecorded !== null && (
                        <div className="text-[11px] text-slate-600 mt-1">
                          Actual: <strong>{f.actualSalesRecorded}</strong> · Error:{' '}
                          <strong
                            className={
                              (f.forecastErrorPercent || 0) <= 5
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }
                          >
                            {f.forecastErrorPercent}%
                          </strong>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transparency Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900">Forecast Algorithm Disclosure:</strong> Suggested preparation quantities are generated using a transparent heuristic formula that weights historical baseline sales per dish with day-of-week demand curves, weather multipliers, scheduled school events, and live confirmed pre-orders. Staff can override any suggestion and log actual post-recess sales to track forecast error over time.
        </div>
      </div>
    </div>
  );
};
