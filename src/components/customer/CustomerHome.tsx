import React from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { SCHOOL_EVENTS, HERO_BANNER_IMAGE } from '../../data/initialData';
import { FoodImage } from '../FoodImage';
import {
  Clock,
  UtensilsCrossed,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface CustomerHomeProps {
  onNavigate: (tab: 'home' | 'queue' | 'menu' | 'orders' | 'profile', stallFilter?: string) => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({ onNavigate }) => {
  const {
    currentUser,
    stalls,
    menuItems,
    orders,
    queuePredictions,
    demandForecasts,
    simulationContext,
    addToCart,
  } = useCanteen();

  const activeEvent =
    SCHOOL_EVENTS.find((e) => e.id === simulationContext.activeEventId) ||
    SCHOOL_EVENTS[0];

  // Current user's active orders
  const myActiveOrders = orders.filter(
    (o) =>
      o.userId === currentUser?.id &&
      o.status !== 'Completed' &&
      o.status !== 'Cancelled'
  );

  const readyOrder = myActiveOrders.find((o) => o.status === 'Ready for Pickup');

  // Shortest queue stall recommendation
  const sortedByWait = [...queuePredictions].sort(
    (a, b) => a.predictedRecessWaitMinutes - b.predictedRecessWaitMinutes
  );
  const shortestStalls = sortedByWait.slice(0, 2);

  // Popular dishes (top 4 flagship items)
  const popularItems = menuItems.filter((m) =>
    ['item-chicken-rice', 'item-laksa', 'item-noodles', 'item-western-food'].includes(
      m.id
    )
  );

  return (
    <div className="space-y-8">
      {/* Ready for Pickup Alert Banner */}
      {readyOrder && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Order #{readyOrder.orderNumber} is Ready for Pickup!
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {readyOrder.stallName} · Scheduled Slot {readyOrder.pickupSlot} ·{' '}
                {readyOrder.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            View Pickup Pass
          </button>
        </div>
      )}

      {/* Hero Split Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between">
          <img
            src={HERO_BANNER_IMAGE}
            alt="SmartCanteen dining hall"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-900/40" />

          <div className="relative z-10">
            <p className="text-xs font-medium text-emerald-400 mb-2">
              {simulationContext.selectedDay}, October 10, 2026 · {simulationContext.weather}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Good morning, {currentUser?.name.split(' ')[0]}.
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              AI-powered. Less waiting. Less waste. Pre-order before{' '}
              <span className="text-white font-semibold">
                {simulationContext.selectedRecess}
              </span>{' '}
              or check real-time stall queue estimates below.
            </p>
          </div>

          <div className="relative z-10 mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-300">
              <span className="text-slate-400">Campus Notice:</span>{' '}
              <span className="font-medium text-white">{activeEvent.title}</span> —{' '}
              {activeEvent.description}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('menu')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Pre-Order Meal</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('queue')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Check Queue Forecast</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Summary Card: Next Recess Queue Snapshot */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Next Recess Queue Snapshot
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {simulationContext.selectedRecess} · Heuristic Estimate
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('queue')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <span>All Stalls</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {queuePredictions.map((qp) => {
                const barWidth = Math.min(
                  100,
                  Math.round((qp.predictedRecessWaitMinutes / 25) * 100)
                );
                const barColor =
                  qp.queueStatus === 'Long'
                    ? 'bg-red-600'
                    : qp.queueStatus === 'Moderate'
                    ? 'bg-amber-500'
                    : 'bg-emerald-600';
                const statusColor =
                  qp.queueStatus === 'Long'
                    ? 'text-red-700 font-semibold'
                    : qp.queueStatus === 'Moderate'
                    ? 'text-amber-700 font-semibold'
                    : 'text-emerald-700 font-semibold';

                return (
                  <div key={qp.stallId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900 truncate">
                        {qp.stallName}
                      </span>
                      <div className="flex items-center gap-1.5 tabular-nums shrink-0">
                        <span className="font-mono font-semibold text-slate-900">
                          ~{qp.predictedRecessWaitMinutes} min
                        </span>
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                        <span className={statusColor}>{qp.queueStatus} Queue</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${barColor}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-600">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-900">Want a shorter wait?</strong> Try{' '}
              <button
                type="button"
                onClick={() => onNavigate('menu', shortestStalls[0]?.stallId)}
                className="text-blue-600 font-semibold underline hover:text-blue-800"
              >
                {shortestStalls[0]?.stallName}
              </button>{' '}
              (~{shortestStalls[0]?.predictedRecessWaitMinutes}m) or{' '}
              <button
                type="button"
                onClick={() => onNavigate('menu', shortestStalls[1]?.stallId)}
                className="text-blue-600 font-semibold underline hover:text-blue-800"
              >
                {shortestStalls[1]?.stallName}
              </button>{' '}
              (~{shortestStalls[1]?.predictedRecessWaitMinutes}m).
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Pre-Orders Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Your Upcoming Pre-Orders
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status synced with canteen stall preparation screens
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <span>Order History ({orders.filter((o) => o.userId === currentUser?.id).length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {myActiveOrders.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl">
            <ShoppingBag className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">
              No active pre-orders for today
            </p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Skip the recess queue by reserving a 15-minute pickup slot in advance.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('menu')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Browse Stalls & Pre-Order
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myActiveOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-xl border border-slate-200 flex flex-col justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-bold text-slate-900">
                        #{ord.orderNumber}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Pickup at {ord.pickupSlot}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-semibold ${
                          ord.status === 'Ready for Pickup'
                            ? 'text-emerald-700'
                            : ord.status === 'Preparing'
                            ? 'text-blue-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      {ord.stallName}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                  </div>
                  <div className="text-right tabular-nums">
                    <span className="text-sm font-mono font-bold text-slate-900">
                      ${ord.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">{ord.recessPeriod}</span>
                  <button
                    type="button"
                    onClick={() => onNavigate('orders')}
                    className="font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Track Status →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popular Dishes & Available Stalls */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Popular Dishes & Recess Demand Forecast
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Estimated recess popularity and remaining portions across participating stalls
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('menu')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <span>Full Menu ({menuItems.length} Dishes)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularItems.map((item) => {
            const stall = stalls.find((s) => s.id === item.stallId);
            const forecast = demandForecasts.find((f) => f.menuItemId === item.id);
            const waitPred = queuePredictions.find((q) => q.stallId === item.stallId);

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <FoodImage
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <span className="truncate">{stall?.name}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums font-medium text-slate-700 shrink-0">
                        ~{waitPred?.predictedRecessWaitMinutes ?? 10}m wait
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>
                        Demand:{' '}
                        <strong
                          className={
                            forecast?.demandLevel === 'High'
                              ? 'text-red-700'
                              : forecast?.demandLevel === 'Medium'
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }
                        >
                          {forecast?.demandLevel || 'Medium'}
                        </strong>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {item.remainingPortions} left today
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4 flex items-center justify-between gap-2">
                  <span className="text-base font-mono font-bold text-slate-900 tabular-nums">
                    ${item.price.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => addToCart(item, 1)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    + Pre-Order
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transparency Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600">
        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-800">Prediction Transparency:</strong> Queue waiting times and recess demand levels are approximate estimates calculated from sample historical order volumes, day-of-week patterns, active campus events, and live pre-order backlogs.
        </p>
      </div>
    </div>
  );
};
