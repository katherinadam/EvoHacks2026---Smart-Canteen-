export type UserRole = 'customer' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subRole?: 'Student' | 'Teacher' | 'Canteen Manager' | 'Stall Operator';
  gradeOrDept?: string;
  walletBalance: number;
  dietaryPreferences: string[];
}

export type RecessPeriod = 'Morning Recess (09:30–10:15)' | 'Upper Sec Recess (10:30–11:15)' | 'Lunch Break (12:15–13:30)';

export type QueueStatus = 'Short' | 'Moderate' | 'Long';
export type DemandLevel = 'Low' | 'Medium' | 'High';

export interface Stall {
  id: string;
  name: string;
  category: 'Asian Rice' | 'Noodles & Soup' | 'Spicy & Peranakan' | 'Western Grill';
  description: string;
  prepCapacityPer15Min: number; // Max portions per 15-min slot
  baseWaitMinutes: number;
  imageUrl: string;
  operatingHours: string;
  popularityScore: number; // 1-100
}

export interface RecipeIngredientRequirement {
  ingredientId: string;
  quantityPerPortion: number; // in the ingredient's unit
}

export interface MenuItem {
  id: string;
  stallId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
  dailyLimit: number;
  remainingPortions: number;
  calories: number;
  isHalal: boolean;
  isVegetarian: boolean;
  baseDemandPortions: number; // Historical average per day
  recipe: RecipeIngredientRequirement[];
}

export type OrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'Preparing'
  | 'Ready for Pickup'
  | 'Completed'
  | 'Cancelled';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userSubRole: string;
  stallId: string;
  stallName: string;
  items: OrderItem[];
  totalPrice: number;
  pickupSlot: string; // e.g., "09:45", "10:00", "10:45", "12:30"
  recessPeriod: RecessPeriod;
  specialRequests?: string;
  paymentMethod: 'Campus Wallet (Simulated)' | 'Pay at Pickup';
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  inventoryDeducted: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  stallName: string;
  quantity: number;
}

export type StockStatus = 'Sufficient' | 'Running Low' | 'Low Stock' | 'Out of Stock';

export interface Ingredient {
  id: string;
  name: string;
  category: 'Poultry & Meat' | 'Grains & Noodles' | 'Produce' | 'Pantry & Condiments';
  currentStock: number;
  unit: 'kg' | 'litres' | 'packs' | 'portions';
  minThreshold: number;
  estimatedDailyConsumption: number;
  supplier: string;
  lastUpdated: string;
}

export interface InventoryTransaction {
  id: string;
  ingredientId: string;
  ingredientName: string;
  type: 'Order Deduction' | 'Incoming Delivery' | 'Manual Adjustment' | 'Wastage';
  deltaQuantity: number;
  unit: string;
  reason: string;
  timestamp: string;
}

export type WeatherCondition = 'Sunny (31°C)' | 'Rainy (25°C)' | 'Cloudy (28°C)';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export interface SchoolEvent {
  id: string;
  title: string;
  effectMultiplier: number; // e.g. 1.15 (+15% overall or stall-specific)
  description: string;
  affectedCategory?: string;
}

export interface SimulationContext {
  selectedDay: DayOfWeek;
  selectedRecess: RecessPeriod;
  weather: WeatherCondition;
  activeEventId: string;
  inventoryDeductionPolicy: 'On Accepted' | 'On Completed';
}

export interface DemandOverride {
  menuItemId: string;
  overridePortions: number | null;
  actualSalesRecorded: number | null;
}

export interface WastageRecord {
  id: string;
  date: string;
  recessPeriod: RecessPeriod;
  menuItemId: string;
  menuItemName: string;
  stallName: string;
  portionsPrepared: number;
  portionsSold: number;
  unsoldPortions: number;
  estimatedCostLost: number;
  notes: string;
}

export interface HistoricalDayRecord {
  day: DayOfWeek;
  dateLabel: string;
  totalOrders: number;
  totalRevenue: number;
  predictedTotalPortions: number;
  actualTotalPortions: number;
  wastagePortions: number;
  chickenRiceSold: number;
  laksaSold: number;
  noodlesSold: number;
  westernSold: number;
}
