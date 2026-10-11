import React from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { SCHOOL_EVENTS } from '../../data/initialData';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import {
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  Package,
} from 'lucide-react';

interface StaffDashboardProps {
  onNavigate: (
    tab: 'dashboard' | 'orders' | 'demand' | 'inventory' | 'reports' | 'settings'
  ) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ onNavigate }) => {
  const {
    orders,
    demandForecasts,
    stockAnalysis,
    simulationContext,
    updateOrderStatus,
  } = useCanteen();

  const activeEvent =
    SCHOOL_EVENTS.find((e) => e.id === simulationContext.activeEventId) ||
    SCHOOL_EVENTS[0];

  const pendingOrders = orders.filter((o) => o.status === 'Pending');
  const preparingOrders = orders.filter(
    (o) => o.status === 'Accepted' || o.status === 'Preparing'
  );
  const readyOrders = orders.filter((o) => o.status === 'Ready for Pickup');
  const completedOrders = orders.filter((o) => o.status === 'Completed');

  const lowStockAlerts = stockAnalysis.filter(
    (s) => s.status === 'Low Stock' || s.status === 'Running Low' || s.status === 'Out of Stock'
  );

  // School Day Demand Timeline Data (08:00 to 14:00)
  const timelineData = [
    { time: '08:00', predictedPortions: 35, preOrders: 12, label: 'Pre-School' },
    { time: '09:00', predictedPortions: 80, preOrders: 34, label: 'Early Prep' },
    { time: '09:45', predictedPortions: 265, preOrders: 110, label: 'Morning Recess' },
    { time: '10:45', predictedPortions: 220, preOrders: 92, label: 'Upper Sec Recess' },
    { time: '11:45', predictedPortions: 95, preOrders: 40, label: 'Midday Transition' },
    { time: '12:45', predictedPortions: 285, preOrders: 128, label: 'Lunch Peak' },
    { time: '13:45', predictedPortions: 60, preOrders: 18, label: 'Post-Lunch CCA' },
  ];

  // Top 4 Flagship Forecast Chart Data
  const flagshipForecastData = demandForecasts
    .filter((f) =>
      [
        'item-chicken-rice',
        'item-laksa',
        'item-noodles',
        'item-western-food',
      ].includes(f.menuItemId)
    )
    .map((f) => ({
      name: f.menuItemName.split(' (')[0],
      Predicted: f.predictedPortions,
      Planned: f.overridePortions ?? f.predictedPortions,
    }));

  return (
    <div className="space-y-8">
      {/* Staff Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <p className="text-xs font-semibold text-purple-300 mb-1.5">
            Central Canteen Operations Console · {simulationContext.selectedDay} ·{' '}
            {simulationContext.weather}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Canteen Staff Operations & AI Forecast Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl">
            Active Event: <strong className="text-white">{activeEvent.title}</strong> ({activeEvent.description}) · Inventory Policy:{' '}
            <strong className="text-purple-300">
              Deduct {simulationContext.inventoryDeductionPolicy}
            </strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Manage Orders ({pendingOrders.length} New)</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('demand')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Demand Forecast</span>
          </button>
        </div>
      </div>

      {/* 4-Column KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Today's Total Pre-Orders</span>
            <ClipboardList className="w-4 h-4 text-purple-700" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-900">
              {orders.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {readyOrders.length} Ready · {completedOrders.length} Completed
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Waiting to Accept</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-amber-700">
              {pendingOrders.length}
            </div>
            <button
              type="button"
              onClick={() => onNavigate('orders')}
              className="text-xs font-semibold text-purple-700 hover:underline mt-1 inline-flex items-center gap-1"
            >
              <span>Review Incoming Queue</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>In Active Preparation</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-900">
              {preparingOrders.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Grouped by stall & 15m slot
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Ingredient Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-red-600">
              {lowStockAlerts.length}
            </div>
            <button
              type="button"
              onClick={() => onNavigate('inventory')}
              className="text-xs font-semibold text-purple-700 hover:underline mt-1 inline-flex items-center gap-1"
            >
              <span>Inspect Low Stock Items</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Low-Stock Alert Strip */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Automated Inventory Alert: {lowStockAlerts.length} ingredients below minimum threshold
              </h2>
              <p className="text-xs text-slate-700 mt-1">
                {lowStockAlerts
                  .map(
                    (s) =>
                      `${s.ingredient.name}: ${s.ingredient.currentStock} ${s.ingredient.unit} remaining (${s.status} — Replenish +${s.recommendedReplenishment} ${s.ingredient.unit})`
                  )
                  .join(' · ')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('inventory')}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            Restock Inventory
          </button>
        </div>
      )}

      {/* Charts Row: School Day Demand Timeline & Next Recess Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Predicted School Day Demand Timeline (08:00 – 14:00)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Estimated total portions vs confirmed pre-orders across staggered recess waves
              </p>
            </div>
            <span className="text-xs text-purple-700 font-semibold">
              Heuristic Estimate
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
                <Area
                  type="monotone"
                  dataKey="predictedPortions"
                  name="Predicted Total Portions"
                  stroke="#7C3AED"
                  fill="#EDE9FE"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="preOrders"
                  name="Confirmed Pre-Orders"
                  stroke="#2563EB"
                  fill="#DBEAFE"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Next Recess Flagship Portion Forecast */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Flagship Stall Portion Forecast
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Suggested preparation targets for {simulationContext.selectedDay}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('demand')}
                className="text-xs font-semibold text-purple-700 hover:underline flex items-center gap-1"
              >
                <span>Override Targets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flagshipForecastData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
                  <Bar dataKey="Predicted" name="AI Heuristic Forecast" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Planned" name="Staff Planned Prep" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between tabular-nums">
            <span>Chicken Rice: ~250 portions</span>
            <span>·</span>
            <span>Laksa: ~180 portions</span>
            <span>·</span>
            <span>Noodles: ~120 portions</span>
          </div>
        </div>
      </div>

      {/* Bottom Split: Orders Waiting Action + Critical Ingredient Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incoming Orders Action Queue */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Incoming Pre-Orders Requiring Action
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Accepting an order automatically triggers recipe ingredient deduction ({simulationContext.inventoryDeductionPolicy})
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('orders')}
              className="text-xs font-semibold text-purple-700 hover:underline flex items-center gap-1"
            >
              <span>All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {orders.filter((o) => o.status !== 'Completed' && o.status !== 'Cancelled').length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              All active pre-orders have been completed.
            </div>
          ) : (
            <div className="space-y-3">
              {orders
                .filter((o) => o.status !== 'Completed' && o.status !== 'Cancelled')
                .slice(0, 4)
                .map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono font-bold text-slate-900">
                          #{ord.orderNumber}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Slot {ord.pickupSlot}</span>
                        <span aria-hidden="true">·</span>
                        <span>{ord.userName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-purple-700">
                          {ord.status}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-1">
                        {ord.stallName}:{' '}
                        {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                      {ord.specialRequests && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          Note: {ord.specialRequests}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {ord.status === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(ord.id, 'Accepted')}
                          className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl transition-colors"
                        >
                          Accept Order
                        </button>
                      )}
                      {ord.status === 'Accepted' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(ord.id, 'Preparing')}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
                        >
                          Start Prep
                        </button>
                      )}
                      {ord.status === 'Preparing' && (
                        <button
                          type="button"
                          onClick={() =>
                            updateOrderStatus(ord.id, 'Ready for Pickup')
                          }
                          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors"
                        >
                          Mark Ready
                        </button>
                      )}
                      {ord.status === 'Ready for Pickup' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(ord.id, 'Completed')}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors"
                        >
                          Mark Collected
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Inventory Snapshot */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-700" />
              <h2 className="text-base font-bold text-slate-900">
                Stock & Stockout Monitor
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('inventory')}
              className="text-xs font-semibold text-purple-700 hover:underline"
            >
              Manage Stock →
            </button>
          </div>

          <div className="divide-y divide-slate-100 tabular-nums">
            {stockAnalysis.slice(0, 5).map((st) => {
              const statusColor =
                st.status === 'Low Stock' || st.status === 'Out of Stock'
                  ? 'text-red-700 font-bold'
                  : st.status === 'Running Low'
                  ? 'text-amber-700 font-bold'
                  : 'text-emerald-700 font-semibold';

              return (
                <div
                  key={st.ingredient.id}
                  className="py-3 flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">
                      {st.ingredient.name}
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      Min threshold: {st.ingredient.minThreshold} {st.ingredient.unit} · Est.{' '}
                      {st.daysUntilStockout}d left
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900">
                      {st.ingredient.currentStock.toFixed(1)} {st.ingredient.unit}
                    </div>
                    <div className={statusColor}>{st.status}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
