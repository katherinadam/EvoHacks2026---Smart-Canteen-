import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  Stall,
  MenuItem,
  Order,
  OrderStatus,
  CartItem,
  Ingredient,
  SimulationContext,
  DemandOverride,
  WastageRecord,
  InventoryTransaction,
  RecessPeriod,
  RecipeIngredientRequirement,
} from '../types';
import {
  DEMO_USERS,
  INITIAL_STALLS,
  INITIAL_MENU_ITEMS,
  INITIAL_INGREDIENTS,
  INITIAL_ORDERS,
  INITIAL_SIMULATION_CONTEXT,
  INITIAL_DEMAND_OVERRIDES,
  INITIAL_WASTAGE_RECORDS,
  INITIAL_TRANSACTIONS,
} from '../data/initialData';
import {
  calculateQueuePredictions,
  calculateDemandForecasts,
  analyzeInventoryStock,
  StallQueuePrediction,
  ItemDemandForecast,
  IngredientStockAnalysis,
} from '../utils/predictionEngine';

const STORAGE_KEY = 'smartcanteen_state_v1';

interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info';
}

interface CanteenContextValue {
  currentUser: User | null;
  loginAs: (userId: string) => void;
  logout: () => void;
  stalls: Stall[];
  menuItems: MenuItem[];
  orders: Order[];
  ingredients: Ingredient[];
  transactions: InventoryTransaction[];
  simulationContext: SimulationContext;
  demandOverrides: DemandOverride[];
  wastageRecords: WastageRecord[];
  cart: CartItem[];
  notifications: NotificationToast[];
  dismissNotification: (id: string) => void;
  notify: (title: string, message: string, type?: 'success' | 'warning' | 'info') => void;

  // Computed predictions & analytics
  queuePredictions: StallQueuePrediction[];
  demandForecasts: ItemDemandForecast[];
  stockAnalysis: IngredientStockAnalysis[];

  // Cart & Order actions
  addToCart: (menuItem: MenuItem, quantity: number) => void;
  updateCartQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  placePreOrder: (params: {
    pickupSlot: string;
    recessPeriod: RecessPeriod;
    specialRequests: string;
    paymentMethod: 'Campus Wallet (Simulated)' | 'Pay at Pickup';
  }) => { success: boolean; order?: Order; error?: string };
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  updateBatchOrderStatus: (orderIds: string[], newStatus: OrderStatus) => void;

  // Staff Demand & Inventory actions
  setSimulationContext: React.Dispatch<React.SetStateAction<SimulationContext>>;
  setDemandOverride: (menuItemId: string, overridePortions: number | null) => void;
  recordActualSales: (menuItemId: string, actualSales: number) => void;
  addIngredient: (ing: Omit<Ingredient, 'id' | 'lastUpdated'>) => void;
  adjustIngredientStock: (
    ingredientId: string,
    delta: number,
    type: 'Incoming Delivery' | 'Manual Adjustment',
    reason: string,
    newMinThreshold?: number
  ) => void;
  updateItemRecipe: (menuItemId: string, recipe: RecipeIngredientRequirement[]) => void;
  recordWastage: (record: Omit<WastageRecord, 'id'>) => void;
  topUpWallet: (amount: number) => void;
  resetDemoData: () => void;
}

const CanteenContext = createContext<CanteenContextValue | undefined>(undefined);

export const CanteenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from localStorage if available
  const loadSaved = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore storage errors
    }
    return null;
  };

  const saved = loadSaved();

  const [users, setUsers] = useState<User[]>(saved?.users || DEMO_USERS);
  const [currentUserId, setCurrentUserId] = useState<string | null>(
    saved?.currentUserId !== undefined ? saved.currentUserId : 'usr-student-1'
  );
  const [stalls, setStalls] = useState<Stall[]>(saved?.stalls || INITIAL_STALLS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(saved?.menuItems || INITIAL_MENU_ITEMS);
  const [orders, setOrders] = useState<Order[]>(saved?.orders || INITIAL_ORDERS);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    saved?.ingredients || INITIAL_INGREDIENTS
  );
  const [transactions, setTransactions] = useState<InventoryTransaction[]>(
    saved?.transactions || INITIAL_TRANSACTIONS
  );
  const [simulationContext, setSimulationContext] = useState<SimulationContext>(
    saved?.simulationContext || INITIAL_SIMULATION_CONTEXT
  );
  const [demandOverrides, setDemandOverrides] = useState<DemandOverride[]>(
    saved?.demandOverrides || INITIAL_DEMAND_OVERRIDES
  );
  const [wastageRecords, setWastageRecords] = useState<WastageRecord[]>(
    saved?.wastageRecords || INITIAL_WASTAGE_RECORDS
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationToast[]>([]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          users,
          currentUserId,
          stalls,
          menuItems,
          orders,
          ingredients,
          transactions,
          simulationContext,
          demandOverrides,
          wastageRecords,
        })
      );
    } catch {
      // ignore storage write failure
    }
  }, [
    users,
    currentUserId,
    stalls,
    menuItems,
    orders,
    ingredients,
    transactions,
    simulationContext,
    demandOverrides,
    wastageRecords,
  ]);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) || null,
    [users, currentUserId]
  );

  const notify = (
    title: string,
    message: string,
    type: 'success' | 'warning' | 'info' = 'info'
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setNotifications((prev) => [{ id, title, message, type }, ...prev.slice(0, 3)]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const loginAs = (userId: string) => {
    setCurrentUserId(userId);
    const u = users.find((usr) => usr.id === userId);
    if (u) {
      notify(
        `Signed in as ${u.name}`,
        `Active role: ${u.subRole} (${u.role === 'staff' ? 'Staff Console' : 'Customer View'})`,
        'info'
      );
    }
  };

  const logout = () => {
    setCurrentUserId(null);
    setCart([]);
  };

  // Computed predictions
  const queuePredictions = useMemo(
    () => calculateQueuePredictions(stalls, orders, simulationContext),
    [stalls, orders, simulationContext]
  );

  const demandForecasts = useMemo(
    () =>
      calculateDemandForecasts(
        menuItems,
        stalls,
        orders,
        ingredients,
        demandOverrides,
        simulationContext
      ),
    [menuItems, stalls, orders, ingredients, demandOverrides, simulationContext]
  );

  const stockAnalysis = useMemo(
    () => analyzeInventoryStock(ingredients, demandForecasts, menuItems),
    [ingredients, demandForecasts, menuItems]
  );

  // Cart functions
  const addToCart = (menuItem: MenuItem, quantity: number) => {
    if (quantity <= 0) return;
    if (!menuItem.available || menuItem.remainingPortions <= 0) {
      notify('Unavailable Item', `${menuItem.name} has no remaining portions for today.`, 'warning');
      return;
    }

    const stall = stalls.find((s) => s.id === menuItem.stallId);
    const stallName = stall ? stall.name : 'Canteen Stall';

    // Enforce single-stall pre-order per batch so pickup slot & stall preparation capacity stay accurate
    if (cart.length > 0 && cart[0].menuItem.stallId !== menuItem.stallId) {
      // Replace or add? Let's allow switching stall or notify clearly
      const existingStallName = cart[0].stallName;
      notify(
        'Stall Switched in Cart',
        `Pre-orders are grouped by stall for fast pickup. Replaced ${existingStallName} items with ${stallName}.`,
        'info'
      );
      setCart([{ menuItem, stallName, quantity: Math.min(quantity, menuItem.remainingPortions) }]);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === menuItem.id);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, menuItem.remainingPortions);
        return prev.map((c) =>
          c.menuItem.id === menuItem.id ? { ...c, quantity: nextQty } : c
        );
      }
      return [...prev, { menuItem, stallName, quantity: Math.min(quantity, menuItem.remainingPortions) }];
    });

    notify('Added to Pre-Order Cart', `${quantity}x ${menuItem.name} added.`, 'success');
  };

  const updateCartQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((c) => c.menuItem.id !== menuItemId));
      return;
    }
    setCart((prev) =>
      prev.map((c) =>
        c.menuItem.id === menuItemId
          ? { ...c, quantity: Math.min(quantity, c.menuItem.remainingPortions) }
          : c
      )
    );
  };

  const clearCart = () => setCart([]);

  // Helper to deduct recipe ingredients for an order
  const deductIngredientsForOrder = (order: Order) => {
    const newTx: InventoryTransaction[] = [];
    const updatedIngredients = [...ingredients];

    for (const ordItem of order.items) {
      const mItem = menuItems.find((m) => m.id === ordItem.menuItemId);
      if (!mItem || !mItem.recipe || mItem.recipe.length === 0) continue;

      for (const req of mItem.recipe) {
        const ingIndex = updatedIngredients.findIndex((g) => g.id === req.ingredientId);
        if (ingIndex !== -1) {
          const totalDeduct = Number((req.quantityPerPortion * ordItem.quantity).toFixed(2));
          const current = updatedIngredients[ingIndex];
          const nextStock = Number(Math.max(0, current.currentStock - totalDeduct).toFixed(2));
          updatedIngredients[ingIndex] = {
            ...current,
            currentStock: nextStock,
            lastUpdated: 'Just now',
          };
          newTx.push({
            id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            ingredientId: current.id,
            ingredientName: current.name,
            type: 'Order Deduction',
            deltaQuantity: -totalDeduct,
            unit: current.unit,
            reason: `Order #${order.orderNumber} (${ordItem.quantity}x ${ordItem.name})`,
            timestamp: 'Just now',
          });
        }
      }
    }

    if (newTx.length > 0) {
      setIngredients(updatedIngredients);
      setTransactions((prev) => [...newTx, ...prev]);
    }
  };

  const placePreOrder = (params: {
    pickupSlot: string;
    recessPeriod: RecessPeriod;
    specialRequests: string;
    paymentMethod: 'Campus Wallet (Simulated)' | 'Pay at Pickup';
  }) => {
    if (!currentUser) {
      return { success: false, error: 'Please sign in to place a pre-order.' };
    }
    if (cart.length === 0) {
      return { success: false, error: 'Your cart is empty.' };
    }

    const stallId = cart[0].menuItem.stallId;
    const stall = stalls.find((s) => s.id === stallId);
    if (!stall) {
      return { success: false, error: 'Selected stall not found.' };
    }

    const totalOrderPortions = cart.reduce((sum, c) => sum + c.quantity, 0);

    // Check stall slot capacity
    const existingSlotPortions = orders
      .filter(
        (o) =>
          o.stallId === stallId &&
          o.pickupSlot === params.pickupSlot &&
          o.status !== 'Cancelled'
      )
      .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

    if (existingSlotPortions + totalOrderPortions > stall.prepCapacityPer15Min) {
      return {
        success: false,
        error: `Pickup slot ${params.pickupSlot} exceeds ${stall.name}'s 15-min preparation capacity (${stall.prepCapacityPer15Min} portions max). Please choose another pickup slot.`,
      };
    }

    // Check remaining portions for each item
    for (const c of cart) {
      const latestItem = menuItems.find((m) => m.id === c.menuItem.id);
      if (!latestItem || latestItem.remainingPortions < c.quantity) {
        return {
          success: false,
          error: `Insufficient remaining portions for ${c.menuItem.name}.`,
        };
      }
    }

    const totalPrice = Number(
      cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0).toFixed(2)
    );

    if (
      params.paymentMethod === 'Campus Wallet (Simulated)' &&
      currentUser.walletBalance < totalPrice
    ) {
      return {
        success: false,
        error: `Insufficient Campus Wallet balance ($${currentUser.walletBalance.toFixed(
          2
        )}). Please choose Pay at Pickup or top up wallet in Profile.`,
      };
    }

    // Generate unique order number
    const randomNum = Math.floor(8047 + orders.length + Math.random() * 90);
    const orderNumber = `SC-${randomNum}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: currentUser.id,
      userName: currentUser.name,
      userSubRole: `${currentUser.subRole} (${currentUser.gradeOrDept || 'Campus'})`,
      stallId: stall.id,
      stallName: stall.name,
      items: cart.map((c) => ({
        menuItemId: c.menuItem.id,
        name: c.menuItem.name,
        price: c.menuItem.price,
        quantity: c.quantity,
      })),
      totalPrice,
      pickupSlot: params.pickupSlot,
      recessPeriod: params.recessPeriod,
      specialRequests: params.specialRequests.trim() || undefined,
      paymentMethod: params.paymentMethod,
      status: 'Pending',
      createdAt: nowTime,
      updatedAt: nowTime,
      inventoryDeducted: false,
    };

    // Reduce available menu item portions
    setMenuItems((prev) =>
      prev.map((m) => {
        const inCart = cart.find((c) => c.menuItem.id === m.id);
        if (inCart) {
          const nextRem = Math.max(0, m.remainingPortions - inCart.quantity);
          return {
            ...m,
            remainingPortions: nextRem,
            available: nextRem > 0,
          };
        }
        return m;
      })
    );

    // Deduct wallet if Campus Wallet selected
    if (params.paymentMethod === 'Campus Wallet (Simulated)') {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id
            ? { ...u, walletBalance: Number((u.walletBalance - totalPrice).toFixed(2)) }
            : u
        )
      );
    }

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);

    notify(
      `Pre-Order ${orderNumber} Confirmed!`,
      `Scheduled for ${params.pickupSlot} pickup at ${stall.name}. Sent to staff dashboard.`,
      'success'
    );

    return { success: true, order: newOrder };
  };

  const applyOrderStatusChange = (order: Order, newStatus: OrderStatus): Order => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    let shouldDeductInventory = false;

    if (!order.inventoryDeducted) {
      if (
        simulationContext.inventoryDeductionPolicy === 'On Accepted' &&
        (newStatus === 'Accepted' || newStatus === 'Preparing' || newStatus === 'Ready for Pickup' || newStatus === 'Completed')
      ) {
        shouldDeductInventory = true;
      } else if (
        simulationContext.inventoryDeductionPolicy === 'On Completed' &&
        newStatus === 'Completed'
      ) {
        shouldDeductInventory = true;
      }
    }

    if (shouldDeductInventory) {
      deductIngredientsForOrder(order);
    }

    // If cancelled before preparation, restore menu item portions and refund wallet if applicable
    if (newStatus === 'Cancelled' && order.status !== 'Cancelled') {
      setMenuItems((prev) =>
        prev.map((m) => {
          const itemInOrd = order.items.find((i) => i.menuItemId === m.id);
          if (itemInOrd) {
            return {
              ...m,
              remainingPortions: m.remainingPortions + itemInOrd.quantity,
              available: true,
            };
          }
          return m;
        })
      );
      if (order.paymentMethod === 'Campus Wallet (Simulated)') {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === order.userId
              ? { ...u, walletBalance: Number((u.walletBalance + order.totalPrice).toFixed(2)) }
              : u
          )
        );
      }
    }

    return {
      ...order,
      status: newStatus,
      updatedAt: nowTime,
      inventoryDeducted: order.inventoryDeducted || shouldDeductInventory,
    };
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    const updatedOrder = applyOrderStatusChange(target, newStatus);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));

    if (newStatus === 'Ready for Pickup') {
      notify(
        `Order #${target.orderNumber} is Ready for Pickup!`,
        `${target.stallName} · Pickup slot ${target.pickupSlot}`,
        'success'
      );
    } else {
      notify(
        `Order #${target.orderNumber} → ${newStatus}`,
        `${target.stallName} status updated${
          !target.inventoryDeducted && updatedOrder.inventoryDeducted
            ? ' & recipe ingredients deducted.'
            : '.'
        }`,
        'info'
      );
    }
  };

  const updateBatchOrderStatus = (orderIds: string[], newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (orderIds.includes(o.id)) {
          return applyOrderStatusChange(o, newStatus);
        }
        return o;
      })
    );
    notify(
      `Batch Updated (${orderIds.length} Orders)`,
      `Marked ${orderIds.length} orders as ${newStatus}.`,
      'success'
    );
  };

  const setDemandOverride = (menuItemId: string, overridePortions: number | null) => {
    setDemandOverrides((prev) => {
      const exists = prev.find((p) => p.menuItemId === menuItemId);
      if (exists) {
        return prev.map((p) =>
          p.menuItemId === menuItemId ? { ...p, overridePortions } : p
        );
      }
      return [...prev, { menuItemId, overridePortions, actualSalesRecorded: null }];
    });
    notify(
      'Preparation Plan Updated',
      overridePortions !== null
        ? `Manual target set to ${overridePortions} portions.`
        : 'Reverted to AI heuristic forecast.',
      'info'
    );
  };

  const recordActualSales = (menuItemId: string, actualSales: number) => {
    setDemandOverrides((prev) => {
      const exists = prev.find((p) => p.menuItemId === menuItemId);
      if (exists) {
        return prev.map((p) =>
          p.menuItemId === menuItemId ? { ...p, actualSalesRecorded: actualSales } : p
        );
      }
      return [...prev, { menuItemId, overridePortions: null, actualSalesRecorded: actualSales }];
    });
    notify('Actual Sales Logged', `Recorded ${actualSales} portions sold for accuracy comparison.`, 'success');
  };

  const addIngredient = (ing: Omit<Ingredient, 'id' | 'lastUpdated'>) => {
    const newIng: Ingredient = {
      ...ing,
      id: `ing-${Date.now()}`,
      lastUpdated: 'Just now',
    };
    setIngredients((prev) => [newIng, ...prev]);
    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}`,
        ingredientId: newIng.id,
        ingredientName: newIng.name,
        type: 'Incoming Delivery',
        deltaQuantity: newIng.currentStock,
        unit: newIng.unit,
        reason: 'Initial inventory registration',
        timestamp: 'Just now',
      },
      ...prev,
    ]);
    notify('Ingredient Added', `${newIng.name} added to inventory tracking.`, 'success');
  };

  const adjustIngredientStock = (
    ingredientId: string,
    delta: number,
    type: 'Incoming Delivery' | 'Manual Adjustment',
    reason: string,
    newMinThreshold?: number
  ) => {
    const target = ingredients.find((i) => i.id === ingredientId);
    if (!target) return;

    const nextStock = Number(Math.max(0, target.currentStock + delta).toFixed(2));
    setIngredients((prev) =>
      prev.map((i) =>
        i.id === ingredientId
          ? {
              ...i,
              currentStock: nextStock,
              minThreshold: newMinThreshold !== undefined ? newMinThreshold : i.minThreshold,
              lastUpdated: 'Just now',
            }
          : i
      )
    );

    if (delta !== 0) {
      setTransactions((prev) => [
        {
          id: `tx-${Date.now()}`,
          ingredientId: target.id,
          ingredientName: target.name,
          type,
          deltaQuantity: Number(delta.toFixed(2)),
          unit: target.unit,
          reason: reason || type,
          timestamp: 'Just now',
        },
        ...prev,
      ]);
    }

    notify(
      `Inventory Updated: ${target.name}`,
      `Current stock: ${nextStock} ${target.unit}`,
      'success'
    );
  };

  const updateItemRecipe = (menuItemId: string, recipe: RecipeIngredientRequirement[]) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === menuItemId ? { ...m, recipe } : m))
    );
    notify('Recipe Mapping Saved', 'Ingredient consumption per portion updated.', 'success');
  };

  const recordWastage = (record: Omit<WastageRecord, 'id'>) => {
    const newRecord: WastageRecord = {
      ...record,
      id: `wst-${Date.now()}`,
    };
    setWastageRecords((prev) => [newRecord, ...prev]);
    notify(
      'Post-Recess Wastage Logged',
      `${record.unsoldPortions} unsold portions recorded for ${record.menuItemName}.`,
      'info'
    );
  };

  const topUpWallet = (amount: number) => {
    if (!currentUser || amount <= 0) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? { ...u, walletBalance: Number((u.walletBalance + amount).toFixed(2)) }
          : u
      )
    );
    notify('Campus Wallet Topped Up', `Added $${amount.toFixed(2)} (Simulated).`, 'success');
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUsers(DEMO_USERS);
    setStalls(INITIAL_STALLS);
    setMenuItems(INITIAL_MENU_ITEMS);
    setOrders(INITIAL_ORDERS);
    setIngredients(INITIAL_INGREDIENTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setSimulationContext(INITIAL_SIMULATION_CONTEXT);
    setDemandOverrides(INITIAL_DEMAND_OVERRIDES);
    setWastageRecords(INITIAL_WASTAGE_RECORDS);
    setCart([]);
    notify('Demo Data Reset', 'All orders, stock, and forecasts restored to initial sample state.', 'info');
  };

  return (
    <CanteenContext.Provider
      value={{
        currentUser,
        loginAs,
        logout,
        stalls,
        menuItems,
        orders,
        ingredients,
        transactions,
        simulationContext,
        demandOverrides,
        wastageRecords,
        cart,
        notifications,
        dismissNotification,
        notify,
        queuePredictions,
        demandForecasts,
        stockAnalysis,
        addToCart,
        updateCartQuantity,
        clearCart,
        placePreOrder,
        updateOrderStatus,
        updateBatchOrderStatus,
        setSimulationContext,
        setDemandOverride,
        recordActualSales,
        addIngredient,
        adjustIngredientStock,
        updateItemRecipe,
        recordWastage,
        topUpWallet,
        resetDemoData,
      }}
    >
      {children}
    </CanteenContext.Provider>
  );
};

export const useCanteen = () => {
  const ctx = useContext(CanteenContext);
  if (!ctx) {
    throw new Error('useCanteen must be used within a CanteenProvider');
  }
  return ctx;
};
