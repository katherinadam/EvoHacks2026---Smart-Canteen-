import React, { useState, useMemo } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { SCHOOL_EVENTS } from '../../data/initialData';
import { FoodImage } from '../FoodImage';
import { RecessPeriod } from '../../types';
import {
  Clock,
  Sparkles,
  ArrowUpDown,
  Info,
  UtensilsCrossed,
  Users,
} from 'lucide-react';

interface CustomerQueuePageProps {
  onSelectStallForOrder: (stallId: string) => void;
}

export const CustomerQueuePage: React.FC<CustomerQueuePageProps> = ({
  onSelectStallForOrder,
}) => {
  const {
    stalls,
    queuePredictions,
    simulationContext,
    setSimulationContext,
  } = useCanteen();

  const [sortBy, setSortBy] = useState<'shortest' | 'popularity' | 'category'>(
    'shortest'
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const activeEvent =
    SCHOOL_EVENTS.find((e) => e.id === simulationContext.activeEventId) ||
    SCHOOL_EVENTS[0];

  const categories = ['All', 'Asian Rice', 'Spicy & Peranakan', 'Noodles & Soup', 'Western Grill'];

  const enrichedStalls = useMemo(() => {
    const list = queuePredictions
      .map((qp) => {
        const stall = stalls.find((s) => s.id === qp.stallId)!;
        return { ...qp, stall };
      })
      .filter((item) =>
        categoryFilter === 'All' ? true : item.category === categoryFilter
      );

    if (sortBy === 'shortest') {
      return list.sort(
        (a, b) => a.predictedRecessWaitMinutes - b.predictedRecessWaitMinutes
      );
    }
    if (sortBy === 'popularity') {
      return list.sort((a, b) => b.stall.popularityScore - a.stall.popularityScore);
    }
    return list.sort((a, b) => a.category.localeCompare(b.category));
  }, [queuePredictions, stalls, sortBy, categoryFilter]);

  const shortestStalls = useMemo(() => {
    return [...queuePredictions]
      .sort((a, b) => a.predictedRecessWaitMinutes - b.predictedRecessWaitMinutes)
      .slice(0, 2);
  }, [queuePredictions]);

  const recessOptions: RecessPeriod[] = [
    'Morning Recess (09:30–10:15)',
    'Upper Sec Recess (10:30–11:15)',
    'Lunch Break (12:15–13:30)',
  ];

  return (
    <div className="space-y-6">
      {/* Header & Recess Period Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            AI Queue Waiting Time Forecast
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Approximate waiting time estimates across all participating canteen stalls based on historical volume, active pre-orders, and preparation capacity.
          </p>
        </div>

        {/* Interactive Recess Period Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
          {recessOptions.map((rec) => (
            <button
              key={rec}
              type="button"
              onClick={() =>
                setSimulationContext((prev) => ({
                  ...prev,
                  selectedRecess: rec,
                }))
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                simulationContext.selectedRecess === rec
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {rec.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Smart Recommendation Banner */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Want a shorter wait during {simulationContext.selectedRecess.split(' (')[0]}? Try{' '}
              {shortestStalls[0]?.stallName} (~{shortestStalls[0]?.predictedRecessWaitMinutes}m) or{' '}
              {shortestStalls[1]?.stallName} (~{shortestStalls[1]?.predictedRecessWaitMinutes}m).
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Context active: {simulationContext.selectedDay} · {simulationContext.weather} ·{' '}
              {activeEvent.title}. You can also reserve a pre-order slot to skip the walk-in queue.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            shortestStalls[0] && onSelectStallForOrder(shortestStalls[0].stallId)
          }
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0"
        >
          Order from Fastest Stall
        </button>
      </div>

      {/* Filter & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600">Sort by:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setSortBy('shortest')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                sortBy === 'shortest'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Shortest Wait
            </button>
            <button
              type="button"
              onClick={() => setSortBy('popularity')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                sortBy === 'popularity'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Popularity
            </button>
            <button
              type="button"
              onClick={() => setSortBy('category')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                sortBy === 'category'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Category
            </button>
          </div>
        </div>
      </div>

      {/* Stall Queue Prediction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {enrichedStalls.map((item) => {
          const statusColor =
            item.queueStatus === 'Long'
              ? 'text-red-700'
              : item.queueStatus === 'Moderate'
              ? 'text-amber-700'
              : 'text-emerald-700';

          const barColor =
            item.queueStatus === 'Long'
              ? 'bg-red-600'
              : item.queueStatus === 'Moderate'
              ? 'bg-amber-500'
              : 'bg-emerald-600';

          const waitPercent = Math.min(
            100,
            Math.round((item.predictedRecessWaitMinutes / 25) * 100)
          );

          return (
            <div
              key={item.stallId}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-44 aspect-[4/3] sm:aspect-auto bg-slate-100 shrink-0">
                    <FoodImage
                      src={item.stall.imageUrl}
                      alt={item.stallName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-5 flex-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <span>{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>Hours: {item.stall.operatingHours}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        ~{item.confidencePercent}% Est. Confidence
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">
                      {item.stallName}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {item.stall.description}
                    </p>

                    {/* Wait Time Metrics Grid */}
                    <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-100 tabular-nums">
                      <div>
                        <span className="block text-[11px] text-slate-500">
                          Current Wait
                        </span>
                        <span className="text-base font-mono font-bold text-slate-900">
                          ~{item.currentWaitMinutes} min
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] text-slate-500">
                          Predicted Recess
                        </span>
                        <span className="text-base font-mono font-bold text-slate-900">
                          ~{item.predictedRecessWaitMinutes} min
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] text-slate-500">
                          Queue Status
                        </span>
                        <span className={`text-sm font-bold ${statusColor}`}>
                          {item.queueStatus} Queue
                        </span>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="mt-3">
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${waitPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Heuristic Factors Breakdown */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Forecast Inputs (Approximate Estimate):</span>
                  </div>
                  <p className="text-slate-600">
                    {item.explanationFactors.join(' · ')}
                  </p>
                </div>
              </div>

              <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 tabular-nums">
                  Active pre-orders in queue: <strong>{item.activeOrdersInQueue} portions</strong>
                </span>
                <button
                  type="button"
                  onClick={() => onSelectStallForOrder(item.stallId)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>View Menu & Pre-Order</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Disclosure Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900">How Queue Estimates Work:</strong> Waiting times are generated using a transparent heuristic model combining historical recess arrival rates, day-of-week multipliers, weather shifts, active pre-order portions currently queued at each stall, and each stall's 15-minute preparation capacity. Estimates are approximate and not guaranteed waiting times.
        </div>
      </div>
    </div>
  );
};
