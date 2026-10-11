import React, { useState, useMemo, useEffect } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { PICKUP_SLOTS_BY_RECESS, SCHOOL_EVENTS } from '../../data/initialData';
import { FoodImage } from '../FoodImage';
import { RecessPeriod } from '../../types';
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  CloudSun,
  Wallet,
} from 'lucide-react';

interface CustomerMenuOrderPageProps {
  initialStallId?: string;
  onOrderSuccessNavigate: () => void;
}

export const CustomerMenuOrderPage: React.FC<CustomerMenuOrderPageProps> = ({
  initialStallId,
  onOrderSuccessNavigate,
}) => {
  const {
    currentUser,
    stalls,
    menuItems,
    orders,
    cart,
    addToCart,
    updateCartQuantity,
    clearCart,
    placePreOrder,
    demandForecasts,
    queuePredictions,
    simulationContext,
  } = useCanteen();

  const [selectedStallId, setSelectedStallId] = useState<string>(
    initialStallId || 'ALL'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'ALL' | 'UNDER_350' | 'OVER_350'>(
    'ALL'
  );
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  // Checkout state
  const [selectedRecess, setSelectedRecess] = useState<RecessPeriod>(
    simulationContext.selectedRecess
  );
  const availableSlots =
    PICKUP_SLOTS_BY_RECESS[selectedRecess] || ['09:45', '10:00'];
  const [selectedSlot, setSelectedSlot] = useState<string>(availableSlots[1] || availableSlots[0]);
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<
    'Campus Wallet (Simulated)' | 'Pay at Pickup'
  >('Campus Wallet (Simulated)');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (initialStallId) {
      setSelectedStallId(initialStallId);
    }
  }, [initialStallId]);

  useEffect(() => {
    const slots = PICKUP_SLOTS_BY_RECESS[selectedRecess] || ['09:45'];
    if (!slots.includes(selectedSlot)) {
      setSelectedSlot(slots[0]);
    }
  }, [selectedRecess, selectedSlot]);

  const activeEvent =
    SCHOOL_EVENTS.find((e) => e.id === simulationContext.activeEventId) ||
    SCHOOL_EVENTS[0];

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (selectedStallId !== 'ALL' && item.stallId !== selectedStallId) {
        return false;
      }
      if (onlyAvailable && (!item.available || item.remainingPortions <= 0)) {
        return false;
      }
      if (priceFilter === 'UNDER_350' && item.price > 3.5) {
        return false;
      }
      if (priceFilter === 'OVER_350' && item.price <= 3.5) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [menuItems, selectedStallId, onlyAvailable, priceFilter, searchQuery]);

  const getQtySelection = (itemId: string) => itemQuantities[itemId] || 1;
  const setQtySelection = (itemId: string, qty: number) => {
    setItemQuantities((prev) => ({ ...prev, [itemId]: Math.max(1, qty) }));
  };

  const cartTotal = useMemo(
    () =>
      Number(
        cart
          .reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0)
          .toFixed(2)
      ),
    [cart]
  );

  const cartStall = useMemo(() => {
    if (cart.length === 0) return null;
    return stalls.find((s) => s.id === cart[0].menuItem.stallId) || null;
  }, [cart, stalls]);

  // Calculate slot occupancy for the active stall in cart
  const getSlotBookedPortions = (slot: string) => {
    if (!cartStall) return 0;
    return orders
      .filter(
        (o) =>
          o.stallId === cartStall.id &&
          o.pickupSlot === slot &&
          o.status !== 'Cancelled'
      )
      .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  };

  const handleConfirmPreOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    const res = placePreOrder({
      pickupSlot: selectedSlot,
      recessPeriod: selectedRecess,
      specialRequests,
      paymentMethod,
    });

    if (!res.success) {
      setCheckoutError(res.error || 'Could not complete order.');
      return;
    }

    if (res.order) {
      setConfirmedOrderNumber(res.order.orderNumber);
      setSpecialRequests('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Contextual Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Canteen Menu, Demand Forecast & Pre-Ordering
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Browse participating stalls, inspect predicted recess popularity, and schedule your pre-order pickup slot.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-3 text-xs text-slate-700">
          <CloudSun className="w-4 h-4 text-blue-600 shrink-0" />
          <div>
            <span className="font-semibold text-slate-900">
              {simulationContext.weather} · {activeEvent.title}:
            </span>{' '}
            <span>{activeEvent.description}</span>
          </div>
        </div>
      </div>

      {/* Order Confirmation Banner if just placed */}
      {confirmedOrderNumber && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pre-Order #{confirmedOrderNumber} Confirmed!
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Your order has been sent to the Canteen Staff dashboard and queued for the{' '}
                <strong>{selectedSlot}</strong> pickup slot.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOrderSuccessNavigate}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Track in My Orders
            </button>
            <button
              type="button"
              onClick={() => setConfirmedOrderNumber(null)}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Layout: Menu Grid (Left) + Pre-Order Cart & Checkout (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Columns: Filters & Menu Items */}
        <div className="lg:col-span-8 space-y-5">
          {/* Stall Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
            <button
              type="button"
              onClick={() => setSelectedStallId('ALL')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                selectedStallId === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Stalls ({menuItems.length})
            </button>
            {stalls.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStallId(st.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  selectedStallId === st.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.name}
              </button>
            ))}
          </div>

          {/* Search & Secondary Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dish name, stall, or category..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter by price"
                value={priceFilter}
                onChange={(e) =>
                  setPriceFilter(
                    e.target.value as 'ALL' | 'UNDER_350' | 'OVER_350'
                  )
                }
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">All Prices</option>
                <option value="UNDER_350">$3.50 & Under</option>
                <option value="OVER_350">Above $3.50</option>
              </select>

              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Available Only</span>
              </label>
            </div>
          </div>

          {/* Menu Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
              <p className="text-sm font-bold text-slate-900">
                No menu items match your current filters
              </p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Try clearing your search query or viewing all participating stalls.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedStallId('ALL');
                  setSearchQuery('');
                  setPriceFilter('ALL');
                  setOnlyAvailable(false);
                }}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredItems.map((item) => {
                const stall = stalls.find((s) => s.id === item.stallId);
                const forecast = demandForecasts.find(
                  (f) => f.menuItemId === item.id
                );
                const waitPred = queuePredictions.find(
                  (q) => q.stallId === item.stallId
                );
                const qty = getQtySelection(item.id);
                const isSoldOut = !item.available || item.remainingPortions <= 0;

                const demandColor =
                  forecast?.demandLevel === 'High'
                    ? 'text-red-700 font-semibold'
                    : forecast?.demandLevel === 'Medium'
                    ? 'text-amber-700 font-semibold'
                    : 'text-emerald-700 font-semibold';

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden relative">
                        <FoodImage
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="p-4">
                        {/* Clean Unboxed Metadata Line */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mb-1">
                          <span className="font-medium text-slate-700">
                            {stall?.name}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">
                            ~{waitPred?.predictedRecessWaitMinutes ?? 8}m stall wait
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {item.isVegetarian
                              ? 'Vegetarian'
                              : item.isHalal
                              ? 'Halal Certified'
                              : 'Standard'}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-bold text-slate-900">
                            {item.name}
                          </h3>
                          <span className="text-base font-mono font-bold text-slate-900 tabular-nums shrink-0">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Forecast Popularity & Availability Metadata */}
                        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 tabular-nums">
                          <div>
                            Recess Demand:{' '}
                            <span className={demandColor}>
                              {forecast?.demandLevel || 'Medium'} (~
                              {forecast?.predictedPortions || item.baseDemandPortions}{' '}
                              est. portions)
                            </span>
                          </div>
                          <div>
                            {isSoldOut ? (
                              <span className="text-red-600 font-semibold">
                                Sold Out
                              </span>
                            ) : (
                              <span>
                                <strong>{item.remainingPortions}</strong> portions left
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Selector & Add to Cart */}
                    <div className="px-4 pb-4 pt-1 flex items-center justify-between gap-3">
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                        <button
                          type="button"
                          disabled={isSoldOut || qty <= 1}
                          onClick={() => setQtySelection(item.id, qty - 1)}
                          aria-label="Decrease quantity"
                          className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-40"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-semibold text-slate-900 tabular-nums">
                          {qty}
                        </span>
                        <button
                          type="button"
                          disabled={isSoldOut || qty >= item.remainingPortions}
                          onClick={() => setQtySelection(item.id, qty + 1)}
                          aria-label="Increase quantity"
                          className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-40"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={isSoldOut}
                        onClick={() => addToCart(item, qty)}
                        className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>
                          {isSoldOut
                            ? 'Unavailable'
                            : `Add to Pre-Order ($${(item.price * qty).toFixed(2)})`}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 4 Columns: Pre-Order Cart & Pickup Slot Checkout */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 sticky top-20">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                AI Pre-Order Checkout
              </h2>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-semibold text-slate-500 hover:text-red-600"
              >
                Clear Cart
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="py-10 text-center">
              <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">
                Your pre-order cart is empty
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Select a dish from any stall on the left to reserve a recess pickup slot.
              </p>
            </div>
          ) : (
            <form onSubmit={handleConfirmPreOrder} className="mt-4 space-y-5">
              {/* Active Stall Indicator */}
              <div className="bg-slate-50 rounded-xl p-3 text-xs">
                <span className="text-slate-500">Preparing Stall:</span>{' '}
                <strong className="text-slate-900">{cartStall?.name}</strong>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Max slot capacity: {cartStall?.prepCapacityPer15Min} portions / 15m
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((c) => (
                  <div
                    key={c.menuItem.id}
                    className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {c.menuItem.name}
                      </div>
                      <div className="text-[11px] text-slate-500 tabular-nums">
                        ${c.menuItem.price.toFixed(2)} each
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(c.menuItem.id, c.quantity - 1)
                          }
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-semibold tabular-nums">
                          {c.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(c.menuItem.id, c.quantity + 1)
                          }
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(c.menuItem.id, 0)}
                        aria-label="Remove item"
                        className="p-1.5 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recess Period & Pickup Time Slot Selection */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    1. Select Recess Period
                  </label>
                  <select
                    value={selectedRecess}
                    onChange={(e) =>
                      setSelectedRecess(e.target.value as RecessPeriod)
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    2. Choose 15-Min Pickup Time Slot
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot) => {
                      const booked = getSlotBookedPortions(slot);
                      const cap = cartStall?.prepCapacityPer15Min || 22;
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-xl border text-left transition-all tabular-nums ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/70 text-blue-900'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold">
                              {slot}
                            </span>
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {booked}/{cap} cap booked
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    3. Optional Special Requests
                  </label>
                  <input
                    type="text"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="e.g., Less gravy, no chili, extra cucumber..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Payment Option */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    4. Payment Method (Simulated Prototype)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPaymentMethod('Campus Wallet (Simulated)')
                      }
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        paymentMethod === 'Campus Wallet (Simulated)'
                          ? 'border-blue-600 bg-blue-50/70 font-semibold text-blue-900'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Campus Wallet</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 tabular-nums">
                        Bal: ${currentUser?.walletBalance.toFixed(2)}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Pay at Pickup')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        paymentMethod === 'Pay at Pickup'
                          ? 'border-blue-600 bg-blue-50/70 font-semibold text-blue-900'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      <div>Pay at Pickup</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Cash / Student Card
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {checkoutError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Order Total & Submit */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-600">
                    Total Pre-Order Amount
                  </span>
                  <span className="text-lg font-mono font-bold text-slate-900 tabular-nums">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                >
                  Confirm Pre-Order for {selectedSlot}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
