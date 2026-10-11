import React, { useState } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { Order, OrderStatus } from '../../types';
import {
  CheckCircle2,
  Clock,
  XCircle,
  ShoppingBag,
  UtensilsCrossed,
  ArrowRight,
} from 'lucide-react';

interface CustomerOrdersPageProps {
  onBrowseMenu: () => void;
}

const STATUS_STEPS: OrderStatus[] = [
  'Pending',
  'Accepted',
  'Preparing',
  'Ready for Pickup',
  'Completed',
];

export const CustomerOrdersPage: React.FC<CustomerOrdersPageProps> = ({
  onBrowseMenu,
}) => {
  const { currentUser, orders, updateOrderStatus } = useCanteen();
  const [tab, setTab] = useState<'active' | 'past'>('active');

  const myOrders = orders.filter((o) => o.userId === currentUser?.id);

  const activeOrders = myOrders.filter(
    (o) => o.status !== 'Completed' && o.status !== 'Cancelled'
  );
  const pastOrders = myOrders.filter(
    (o) => o.status === 'Completed' || o.status === 'Cancelled'
  );

  const readyOrders = activeOrders.filter(
    (o) => o.status === 'Ready for Pickup'
  );

  const displayedOrders = tab === 'active' ? activeOrders : pastOrders;

  const getStepIndex = (status: OrderStatus) => {
    return STATUS_STEPS.indexOf(status);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Canteen Pre-Orders
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track live stall preparation progress, view pickup slots, or cancel eligible orders before preparation begins.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl self-start">
          <button
            type="button"
            onClick={() => setTab('active')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              tab === 'active'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Orders ({activeOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('past')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              tab === 'past'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past & Cancelled ({pastOrders.length})
          </button>
        </div>
      </div>

      {/* Prominent Ready for Pickup Banner */}
      {readyOrders.map((ro) => (
        <div
          key={ro.id}
          className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-emerald-800">
                Ready at Counter · Pickup Pass #{ro.orderNumber}
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Your order from {ro.stallName} is ready for collection!
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Proceed to the Express Pre-Order Counter for slot{' '}
                <strong>{ro.pickupSlot}</strong> and show order number{' '}
                <strong className="font-mono">#{ro.orderNumber}</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateOrderStatus(ro.id, 'Completed')}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            Mark as Collected
          </button>
        </div>
      ))}

      {/* Orders List */}
      {displayedOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">
            {tab === 'active'
              ? 'No active pre-orders right now'
              : 'No past orders found'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            {tab === 'active'
              ? 'Place a pre-order from any stall to skip the recess line.'
              : 'Completed and cancelled orders will appear here.'}
          </p>
          <button
            type="button"
            onClick={onBrowseMenu}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Browse Canteen Menu</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedOrders.map((ord: Order) => {
            const canCancel =
              ord.status === 'Pending' || ord.status === 'Accepted';
            const stepIdx = getStepIndex(ord.status);

            return (
              <div
                key={ord.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        Order #{ord.orderNumber}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Ordered at {ord.createdAt}</span>
                      <span aria-hidden="true">·</span>
                      <span>{ord.paymentMethod}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {ord.stallName}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {ord.recessPeriod} · Scheduled Pickup Slot:{' '}
                      <strong className="font-mono text-slate-900">
                        {ord.pickupSlot}
                      </strong>
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 tabular-nums">
                    <span className="text-xl font-mono font-bold text-slate-900">
                      ${ord.totalPrice.toFixed(2)}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        ord.status === 'Ready for Pickup'
                          ? 'text-emerald-700'
                          : ord.status === 'Completed'
                          ? 'text-slate-600'
                          : ord.status === 'Cancelled'
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }`}
                    >
                      Status: {ord.status}
                    </span>
                  </div>
                </div>

                {/* Step Progress Bar for non-cancelled orders */}
                {ord.status !== 'Cancelled' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-2">
                      {STATUS_STEPS.map((st, idx) => {
                        const isDone = idx <= stepIdx;
                        const isCurrent = idx === stepIdx;
                        return (
                          <div key={st} className="space-y-1.5">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                isDone
                                  ? ord.status === 'Ready for Pickup'
                                    ? 'bg-emerald-600'
                                    : 'bg-blue-600'
                                  : 'bg-slate-100'
                              }`}
                            />
                            <div
                              className={`text-[11px] truncate ${
                                isCurrent
                                  ? 'font-bold text-slate-900'
                                  : isDone
                                  ? 'font-medium text-slate-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {st}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Order Items & Special Requests */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  {ord.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs tabular-nums"
                    >
                      <span className="font-semibold text-slate-800">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-mono text-slate-700">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {ord.specialRequests && (
                    <div className="pt-2 border-t border-slate-200/70 text-xs text-slate-600">
                      <strong className="text-slate-800">Special Request:</strong>{' '}
                      {ord.specialRequests}
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Last updated at {ord.updatedAt}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(ord.id, 'Cancelled')}
                        className="px-3.5 py-2 border border-red-200 bg-red-50/50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel Order</span>
                      </button>
                    )}

                    {ord.status === 'Ready for Pickup' && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(ord.id, 'Completed')}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <span>Confirm Collected</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
