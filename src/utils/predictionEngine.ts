import {
  Stall,
  MenuItem,
  Order,
  Ingredient,
  SimulationContext,
  QueueStatus,
  DemandLevel,
  StockStatus,
  DemandOverride,
} from '../types';
import { SCHOOL_EVENTS } from '../data/initialData';

export interface StallQueuePrediction {
  stallId: string;
  stallName: string;
  category: string;
  currentWaitMinutes: number;
  predictedRecessWaitMinutes: number;
  queueStatus: QueueStatus;
  activeOrdersInQueue: number;
  prepCapacityPer15Min: number;
  confidencePercent: number;
  explanationFactors: string[];
}

export interface ItemDemandForecast {
  menuItemId: string;
  menuItemName: string;
  stallId: string;
  stallName: string;
  price: number;
  baseHistoricalPortions: number;
  activePreOrdersCount: number;
  predictedPortions: number;
  suggestedMinPortions: number;
  suggestedMaxPortions: number;
  demandLevel: DemandLevel;
  overridePortions: number | null;
  actualSalesRecorded: number | null;
  forecastErrorPercent: number | null;
  limitingIngredientWarning: string | null;
  factorBreakdown: string;
}

export interface IngredientStockAnalysis {
  ingredient: Ingredient;
  status: StockStatus;
  daysUntilStockout: number;
  forecastDailyRequirement: number;
  recommendedReplenishment: number;
}

/**
 * Transparent Heuristic Model for Queue Waiting Time Prediction
 * Explicitly combines:
 * - Stall base preparation time
 * - Active pending/accepted/preparing orders for this stall
 * - Selected Recess Period multiplier
 * - Day of week & School event impact
 * - Weather impact
 */
export function calculateQueuePredictions(
  stalls: Stall[],
  orders: Order[],
  context: SimulationContext
): StallQueuePrediction[] {
  const event = SCHOOL_EVENTS.find((e) => e.id === context.activeEventId) || SCHOOL_EVENTS[0];

  const dayMultiplierMap: Record<string, number> = {
    Monday: 0.95,
    Tuesday: 1.0,
    Wednesday: 1.05,
    Thursday: 0.98,
    Friday: 1.12,
  };
  const dayFactor = dayMultiplierMap[context.selectedDay] ?? 1.0;

  const recessMultiplierMap: Record<string, number> = {
    'Morning Recess (09:30–10:15)': 1.1,
    'Upper Sec Recess (10:30–11:15)': 1.0,
    'Lunch Break (12:15–13:30)': 1.18,
  };
  const recessFactor = recessMultiplierMap[context.selectedRecess] ?? 1.0;

  return stalls.map((stall) => {
    // Count active orders currently in queue for this stall
    const activeOrders = orders.filter(
      (o) =>
        o.stallId === stall.id &&
        (o.status === 'Pending' || o.status === 'Accepted' || o.status === 'Preparing')
    );

    const activePortions = activeOrders.reduce(
      (sum, ord) => sum + ord.items.reduce((s, i) => s + i.quantity, 0),
      0
    );

    // Weather adjustment: Rainy weather increases hot soup/laksa & noodle wait slightly
    let weatherWaitDelta = 0;
    if (context.weather === 'Rainy (25°C)') {
      if (stall.category === 'Spicy & Peranakan' || stall.category === 'Noodles & Soup') {
        weatherWaitDelta = 3;
      }
    } else if (context.weather === 'Sunny (31°C)' && stall.id === 'stall-chicken-rice') {
      weatherWaitDelta = 1;
    }

    // Event adjustment
    let eventMultiplier = event.effectMultiplier;
    if (event.affectedCategory && event.affectedCategory === stall.category) {
      eventMultiplier += 0.05;
    }

    // Current wait based on base + active queue backlog
    //Baseline aligned with sample prompt: Chicken Rice ~20m, Laksa ~10m, Noodles ~5m, Western ~5m
    const queuePressureMinutes = Math.round((activePortions / Math.max(stall.prepCapacityPer15Min, 1)) * 12);
    const rawRecessWait =
      stall.baseWaitMinutes * dayFactor * recessFactor * eventMultiplier +
      queuePressureMinutes +
      weatherWaitDelta;

    const predictedRecessWaitMinutes = Math.max(2, Math.round(rawRecessWait));
    const currentWaitMinutes = Math.max(
      2,
      Math.round(stall.baseWaitMinutes * 0.8 + queuePressureMinutes)
    );

    let queueStatus: QueueStatus = 'Short';
    if (predictedRecessWaitMinutes >= 15) {
      queueStatus = 'Long';
    } else if (predictedRecessWaitMinutes >= 8) {
      queueStatus = 'Moderate';
    }

    const factors: string[] = [
      `Base prep speed: ${stall.prepCapacityPer15Min} portions / 15m`,
      `${activePortions} pre-ordered portions in active queue`,
    ];
    if (context.selectedDay === 'Friday') {
      factors.push('Friday peak demand (+12% historical volume)');
    }
    if (event.id !== 'evt-none') {
      factors.push(`${event.title} (${Math.round((event.effectMultiplier - 1) * 100)}% shift)`);
    }
    if (weatherWaitDelta > 0) {
      factors.push(`Weather adjustment (+${weatherWaitDelta} min)`);
    }

    return {
      stallId: stall.id,
      stallName: stall.name,
      category: stall.category,
      currentWaitMinutes,
      predictedRecessWaitMinutes,
      queueStatus,
      activeOrdersInQueue: activePortions,
      prepCapacityPer15Min: stall.prepCapacityPer15Min,
      confidencePercent: stall.id === 'stall-chicken-rice' ? 89 : 86,
      explanationFactors: factors,
    };
  });
}

/**
 * Transparent Heuristic Model for Food Demand Forecasting
 * Combines weighted historical baseline + day-of-week + weather + school event + confirmed pre-orders
 */
export function calculateDemandForecasts(
  menuItems: MenuItem[],
  stalls: Stall[],
  orders: Order[],
  ingredients: Ingredient[],
  overrides: DemandOverride[],
  context: SimulationContext
): ItemDemandForecast[] {
  const event = SCHOOL_EVENTS.find((e) => e.id === context.activeEventId) || SCHOOL_EVENTS[0];

  const dayMultiplier: Record<string, number> = {
    Monday: 0.94,
    Tuesday: 0.98,
    Wednesday: 1.02,
    Thursday: 0.96,
    Friday: 1.06,
  };

  return menuItems.map((item) => {
    const stall = stalls.find((s) => s.id === item.stallId);
    const activeOrderPortions = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, ord) => {
        const match = ord.items.find((i) => i.menuItemId === item.id);
        return sum + (match ? match.quantity : 0);
      }, 0);

    let weatherFactor = 1.0;
    if (context.weather === 'Rainy (25°C)' && item.category === 'Spicy & Peranakan') {
      weatherFactor = 1.12;
    } else if (context.weather === 'Sunny (31°C)' && item.category === 'Spicy & Peranakan') {
      weatherFactor = 0.96;
    }

    const dFactor = dayMultiplier[context.selectedDay] ?? 1.0;
    const eFactor = event.effectMultiplier;

    // Calculate predicted portions (calibrated so flagship items match prompt examples on default Friday + Sports day:
    // Chicken Rice ~250, Laksa ~180, Noodles ~120, Western Food ~140)
    const rawPredicted =
      item.baseDemandPortions * ((dFactor + eFactor) / 2) * weatherFactor +
      activeOrderPortions * 1.5;

    const predictedPortions = Math.max(15, Math.round(rawPredicted / 5) * 5);
    const suggestedMinPortions = Math.max(10, predictedPortions - 10);
    const suggestedMaxPortions = predictedPortions + 10;

    let demandLevel: DemandLevel = 'Low';
    if (predictedPortions >= 170) {
      demandLevel = 'High';
    } else if (predictedPortions >= 90) {
      demandLevel = 'Medium';
    }

    const overrideRecord = overrides.find((ov) => ov.menuItemId === item.id);
    const overridePortions = overrideRecord?.overridePortions ?? null;
    const actualSalesRecorded = overrideRecord?.actualSalesRecorded ?? null;

    let forecastErrorPercent: number | null = null;
    if (actualSalesRecorded !== null && actualSalesRecorded > 0) {
      forecastErrorPercent = Number(
        (
          (Math.abs(predictedPortions - actualSalesRecorded) / actualSalesRecorded) *
          100
        ).toFixed(1)
      );
    }

    // Check if any recipe ingredient has insufficient stock to cover predictedPortions
    let limitingIngredientWarning: string | null = null;
    for (const req of item.recipe) {
      const ing = ingredients.find((g) => g.id === req.ingredientId);
      if (ing) {
        const neededQty = Number((req.quantityPerPortion * predictedPortions).toFixed(1));
        if (ing.currentStock < neededQty) {
          limitingIngredientWarning = `Needs ${neededQty} ${ing.unit} ${ing.name} (${ing.currentStock.toFixed(1)} ${ing.unit} in stock)`;
          break;
        }
      }
    }

    const factorBreakdown = `Hist. base ${item.baseDemandPortions} + ${activeOrderPortions} pre-orders · ${context.selectedDay} · ${event.title}`;

    return {
      menuItemId: item.id,
      menuItemName: item.name,
      stallId: item.stallId,
      stallName: stall?.name || 'Canteen Stall',
      price: item.price,
      baseHistoricalPortions: item.baseDemandPortions,
      activePreOrdersCount: activeOrderPortions,
      predictedPortions,
      suggestedMinPortions,
      suggestedMaxPortions,
      demandLevel,
      overridePortions,
      actualSalesRecorded,
      forecastErrorPercent,
      limitingIngredientWarning,
      factorBreakdown,
    };
  });
}

/**
 * Automated Stock & Stockout Estimation Engine
 * Uses recipe-to-ingredient mapping + forecast demand to estimate daily requirement and days until stockout
 */
export function analyzeInventoryStock(
  ingredients: Ingredient[],
  forecasts: ItemDemandForecast[],
  menuItems: MenuItem[]
): IngredientStockAnalysis[] {
  return ingredients.map((ing) => {
    // Calculate forecast requirement from all items using this ingredient
    let forecastNeed = 0;
    for (const item of menuItems) {
      const req = item.recipe.find((r) => r.ingredientId === ing.id);
      if (req) {
        const f = forecasts.find((fc) => fc.menuItemId === item.id);
        const plannedPortions = f ? f.overridePortions ?? f.predictedPortions : item.baseDemandPortions;
        forecastNeed += req.quantityPerPortion * plannedPortions;
      }
    }

    const dailyConsumption =
      forecastNeed > 0 ? Number(forecastNeed.toFixed(2)) : ing.estimatedDailyConsumption;

    const daysUntilStockout =
      dailyConsumption > 0
        ? Number(Math.max(0, ing.currentStock / dailyConsumption).toFixed(1))
        : 99;

    let status: StockStatus = 'Sufficient';
    if (ing.currentStock <= 0) {
      status = 'Out of Stock';
    } else if (ing.currentStock <= ing.minThreshold * 0.75) {
      status = 'Low Stock';
    } else if (ing.currentStock <= ing.minThreshold) {
      status = 'Running Low';
    }

    const targetStock = Math.max(ing.minThreshold * 2, dailyConsumption * 2);
    const recommendedReplenishment =
      ing.currentStock < ing.minThreshold
        ? Number(Math.max(5, Math.ceil(targetStock - ing.currentStock)).toFixed(1))
        : 0;

    return {
      ingredient: {
        ...ing,
        estimatedDailyConsumption: dailyConsumption,
      },
      status,
      daysUntilStockout,
      forecastDailyRequirement: dailyConsumption,
      recommendedReplenishment,
    };
  });
}
