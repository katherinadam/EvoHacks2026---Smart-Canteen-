import React, { useState, useMemo } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { Order, OrderStatus } from '../../types';
import {
  ClipboardList,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  Search,
} from 'lucide-react';

interface PreparationBatch {
  batchKey: string;
  stallId: string;
  stallName: string;
  pickupSlot: string;
  recessPeriod: string;
  orders: Order[];
  aggregatedItems: { name: string; totalQuantity: number }[];
}

export const StaffOrdersPage: React.FC = () => {
  const { orders, stalls, updateOrderStatus, updateBatchOrderStatus } =
    useCanteen();

  const [viewMode, setViewMode] = useState<'individual' | 'batches'>(
    'individual'
  );
  const [statusFilter, setStatusFilter] = useState<string>('ALL_ACTIVE');
  const [stallFilter, setStallFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'pickup' | 'urgency'>('pickup');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = useMemo(() => {
    const list = orders.filter((ord) => {
      if (statusFilter === 'ALL_ACTIVE') {
        if (ord.status === 'Completed' || ord.status === 'Cancelled')
          return false;
      } else if (statusFilter !== 'ALL' && ord.status !== statusFilter) {
        return false;
      }
      if (stallFilter !== 'ALL' && ord.stallId !== stallFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          ord.orderNumber.toLowerCase().includes(q) ||
          ord.userName.toLowerCase().includes(q) ||
          ord.stallName.toLowerCase().includes(q)
        );
      }
      return true;
    });

    if (sortBy === 'pickup') {
      return list.sort((a, b) => a.pickupSlot.localeCompare(b.pickupSlot));
    }

    // Sort by urgency (Pending first, then Accepted, Preparing, Ready)
    const priorityMap: Record<OrderStatus, number> = {
      Pending: 1,
      Accepted: 2,
      Preparing: 3,
      'Ready for Pickup': 4,
      Completed: 5,
      Cancelled: 6,
    };
    return list.sort(
      (a, b) =>
        priorityMap[a.status] - priorityMap[b.status] ||
        a.pickupSlot.localeCompare(b.pickupSlot)
    );
  }, [orders, statusFilter, stallFilter, sortBy, searchQuery]);

  // Group active orders by Stall + Pickup Slot for batch preparation
  const preparationBatches: PreparationBatch[] = useMemo(() => {
    const activeOrders = orders.filter(
      (o) =>
        o.status !== 'Completed' &&
        o.status !== 'Cancelled' &&
        (stallFilter === 'ALL' || o.stallId === stallFilter)
    );

    const map = new Map<string, PreparationBatch>();

    for (const ord of activeOrders) {
      const key = `${ord.stallId}__${ord.pickupSlot}`;
      if (!map.has(key)) {
        map.set(key, {
          batchKey: key,
          stallId: ord.stallId,
          stallName: ord.stallName,
          pickupSlot: ord.pickupSlot,
          recessPeriod: ord.recessPeriod,
          orders: [],
          aggregatedItems: [],
        });
      }
      const batch = map.get(key)!;
      batch.orders.push(ord);

      for (const item of ord.items) {
        const existingItem = batch.aggregatedItems.find(
          (i) => i.name === item.name
        );
        if (existingItem) {
          existingItem.totalQuantity += item.quantity;
        } else {
          batch.aggregatedItems.push({
            name: item.name,
            totalQuantity: item.quantity,
          });
        }
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.pickupSlot.localeCompare(b.pickupSlot)
    );
  }, [orders, stallFilter]);

  const statusTabs = [
    { id: 'ALL_ACTIVE', label: 'Active Queue' },
    { id: 'Pending', label: 'New / Pending' },
    { id: 'Accepted', label: 'Accepted' },
    { id: 'Preparing', label: 'Preparing' },
    { id: 'Ready for Pickup', label: 'Ready for Pickup' },
    { id: 'Completed', label: 'Completed' },
    { id: 'Cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Canteen Order Management & Batch Preparation
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Process incoming pre-orders individually or group by stall and 15-minute pickup slots for kitchen batch efficiency.
          </p>
        </div>

        {/* Toggle between Individual Customer Orders vs Grouped Preparation Batches */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl self-start">
          <button
            type="button"
            onClick={() => setViewMode('individual')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              viewMode === 'individual'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Individual Customer Orders ({orders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('batches')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              viewMode === 'batches'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Grouped Prep Batches ({preparationBatches.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
        {viewMode === 'individual' && (
          <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-100">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === tab.id
                    ? 'bg-purple-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order #SC-8041 or student name..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <select
              aria-label="Filter by stall"
              value={stallFilter}
              onChange={(e) => setStallFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="ALL">All Stalls</option>
              {stalls.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {viewMode === 'individual' && (
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-600">Sort:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSortBy('pickup')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                    sortBy === 'pickup'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  Pickup Time
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('urgency')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                    sortBy === 'urgency'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  Urgency / Status
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Mode 1: Individual Customer Orders */}
      {viewMode === 'individual' ? (
        filteredOrders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <p className="text-sm font-bold text-slate-900">
              No orders match the current filter
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Try switching status tabs or clearing the search filter.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      #{ord.orderNumber}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-800">
                      Pickup Slot: {ord.pickupSlot}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Customer: <strong>{ord.userName}</strong> ({ord.userSubRole})
                    </span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-bold ${
                        ord.status === 'Ready for Pickup'
                          ? 'text-emerald-700'
                          : ord.status === 'Pending'
                          ? 'text-amber-700'
                          : ord.status === 'Cancelled'
                          ? 'text-red-600'
                          : 'text-purple-700'
                      }`}
                    >
                      Status: {ord.status}
                    </span>
                  </div>

                  <div className="text-base font-bold text-slate-900">
                    {ord.stallName} —{' '}
                    {ord.items
                      .map((i) => `${i.quantity}x ${i.name}`)
                      .join(', ')}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{ord.recessPeriod}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono font-semibold text-slate-800 tabular-nums">
                      Total: ${ord.totalPrice.toFixed(2)} ({ord.paymentMethod})
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Inventory:{' '}
                      {ord.inventoryDeducted
                        ? 'Recipe Deducted'
                        : 'Pending Deduction'}
                    </span>
                  </div>

                  {ord.specialRequests && (
                    <div className="text-xs text-amber-800 bg-amber-50/70 border border-amber-200/70 rounded-lg px-3 py-1.5 inline-block mt-1">
                      <strong>Special Request:</strong> {ord.specialRequests}
                    </div>
                  )}
                </div>

                {/* Staff Workflow Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {ord.status === 'Pending' && (
                    <>
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(ord.id, 'Accepted')}
                        className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Order</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(ord.id, 'Cancelled')}
                        className="px-3.5 py-2 border border-red-200 hover:bg-red-50 text-red-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {ord.status === 'Accepted' && (
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(ord.id, 'Preparing')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Mark Preparing</span>
                    </button>
                  )}

                  {ord.status === 'Preparing' && (
                    <button
                      type="button"
                      onClick={() =>
                        updateOrderStatus(ord.id, 'Ready for Pickup')
                      }
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Ready for Pickup</span>
                    </button>
                  )}

                  {ord.status === 'Ready for Pickup' && (
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(ord.id, 'Completed')}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Collected</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* View Mode 2: Grouped Preparation Batches */
        <div className="space-y-5">
          {preparationBatches.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <p className="text-sm font-bold text-slate-900">
                No active preparation batches
              </p>
              <p className="text-xs text-slate-500 mt-1">
                All current pre-orders have been completed or cancelled.
              </p>
            </div>
          ) : (
            preparationBatches.map((batch) => {
              const orderIds = batch.orders.map((o) => o.id);
              return (
                <div
                  key={batch.batchKey}
                  className="bg-white border border-purple-200 rounded-2xl overflow-hidden"
                >
                  {/* Batch Summary Header */}
                  <div className="bg-purple-50/60 px-6 py-4 border-b border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-purple-900 font-semibold">
                        <span>GROUPED KITCHEN PREP BATCH</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">
                          Pickup Slot {batch.pickupSlot}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{batch.orders.length} Customer Orders</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                        {batch.stallName} — Total Batch Quantities:{' '}
                        <span className="text-purple-800">
                          {batch.aggregatedItems
                            .map((i) => `${i.totalQuantity}x ${i.name}`)
                            .join(', ')}
                        </span>
                      </h3>
                    </div>

                    {/* Batch-level Quick Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          updateBatchOrderStatus(orderIds, 'Preparing')
                        }
                        className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl transition-colors"
                      >
                        Start Batch Prep
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateBatchOrderStatus(orderIds, 'Ready for Pickup')
                        }
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors"
                      >
                        Mark Entire Batch Ready
                      </button>
                    </div>
                  </div>

                  {/* Individual Customer Orders inside this Batch */}
                  <div className="p-5 divide-y divide-slate-100">
                    <div className="pb-2 text-xs font-semibold text-slate-500">
                      Individual Customer Orders in Batch (Each retains its own pickup ticket & status):
                    </div>
                    {batch.orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-slate-900">
                            #{ord.orderNumber}
                          </span>{' '}
                          · <strong>{ord.userName}</strong> ({ord.userSubRole}) —{' '}
                          {ord.items
                            .map((i) => `${i.quantity}x ${i.name}`)
                            .join(', ')}
                          {ord.specialRequests && (
                            <span className="text-amber-700 font-medium ml-2">
                              [Note: {ord.specialRequests}]
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-semibold text-purple-700">
                            {ord.status}
                          </span>
                          {ord.status !== 'Ready for Pickup' ? (
                            <button
                              type="button"
                              onClick={() =>
                                updateOrderStatus(ord.id, 'Ready for Pickup')
                              }
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg"
                            >
                              Mark Ready
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                updateOrderStatus(ord.id, 'Completed')
                              }
                              className="px-2.5 py-1 bg-emerald-700 text-white font-semibold rounded-lg"
                            >
                              Mark Collected
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
