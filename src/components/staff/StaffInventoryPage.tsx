import React, { useState } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { Ingredient, RecipeIngredientRequirement } from '../../types';
import {
  Package,
  AlertTriangle,
  Plus,
  Truck,
  BookOpen,
  History,
  Trash2,
} from 'lucide-react';

export const StaffInventoryPage: React.FC = () => {
  const {
    ingredients,
    stockAnalysis,
    menuItems,
    transactions,
    addIngredient,
    adjustIngredientStock,
    updateItemRecipe,
  } = useCanteen();

  const [activeTab, setActiveTab] = useState<'stock' | 'recipes' | 'log'>(
    'stock'
  );

  // Delivery / Manual adjustment modal state
  const [selectedIngId, setSelectedIngId] = useState<string>(
    ingredients[0]?.id || ''
  );
  const [adjustmentType, setAdjustmentType] = useState<
    'Incoming Delivery' | 'Manual Adjustment'
  >('Incoming Delivery');
  const [deltaQty, setDeltaQty] = useState<string>('10');
  const [newMinThreshold, setNewMinThreshold] = useState<string>('');
  const [adjustReason, setAdjustReason] = useState<string>(
    'Morning supplier replenishment'
  );

  // Add new ingredient form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIngName, setNewIngName] = useState('');
  const [newIngCategory, setNewIngCategory] =
    useState<Ingredient['category']>('Produce');
  const [newIngStock, setNewIngStock] = useState('5');
  const [newIngUnit, setNewIngUnit] = useState<Ingredient['unit']>('kg');
  const [newIngThreshold, setNewIngThreshold] = useState('3');
  const [newIngSupplier, setNewIngSupplier] = useState('Campus Fresh Supplies');

  // Recipe Editor state
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string>(
    menuItems[0]?.id || ''
  );
  const selectedMenuItem = menuItems.find((m) => m.id === selectedMenuItemId);
  const [draftRecipe, setDraftRecipe] = useState<RecipeIngredientRequirement[]>(
    selectedMenuItem?.recipe || []
  );

  const handleSelectMenuItemForRecipe = (itemId: string) => {
    setSelectedMenuItemId(itemId);
    const found = menuItems.find((m) => m.id === itemId);
    setDraftRecipe(found ? [...found.recipe] : []);
  };

  const handleUpdateStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedDelta = parseFloat(deltaQty);
    if (isNaN(parsedDelta)) return;

    const parsedThreshold =
      newMinThreshold.trim() !== '' ? parseFloat(newMinThreshold) : undefined;

    adjustIngredientStock(
      selectedIngId,
      parsedDelta,
      adjustmentType,
      adjustReason,
      parsedThreshold && !isNaN(parsedThreshold) ? parsedThreshold : undefined
    );
    setDeltaQty('5');
    setNewMinThreshold('');
  };

  const handleAddNewIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName.trim()) return;
    const stockNum = parseFloat(newIngStock) || 0;
    const threshNum = parseFloat(newIngThreshold) || 2;

    addIngredient({
      name: newIngName.trim(),
      category: newIngCategory,
      currentStock: stockNum,
      unit: newIngUnit,
      minThreshold: threshNum,
      estimatedDailyConsumption: Number((threshNum * 1.2).toFixed(1)),
      supplier: newIngSupplier.trim() || 'Standard Supplier',
    });

    setNewIngName('');
    setShowAddForm(false);
  };

  const lowStockItems = stockAnalysis.filter(
    (s) =>
      s.status === 'Low Stock' ||
      s.status === 'Running Low' ||
      s.status === 'Out of Stock'
  );

  return (
    <div className="space-y-6">
      {/* Page Header & Sub-Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Automated Stock Management & Recipe Mapping
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Monitor ingredient levels, estimated days until stockout, incoming deliveries, and per-portion recipe consumption rules.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl self-start">
          <button
            type="button"
            onClick={() => setActiveTab('stock')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'stock'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Ingredient Inventory ({ingredients.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('recipes')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'recipes'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Recipe-to-Ingredient Mapping</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('log')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'log'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Transaction Log ({transactions.length})</span>
          </button>
        </div>
      </div>

      {/* Prominent Low-Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50/80 border border-red-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Low-Stock Replenishment Recommendations ({lowStockItems.length} Items Below Threshold)
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Based on today's forecast demand and configured dish recipes, the following ingredients may run out soon:
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {lowStockItems.map((item) => (
              <div
                key={item.ingredient.id}
                className="bg-white border border-red-200 rounded-xl p-3.5 flex items-center justify-between gap-3 tabular-nums"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {item.ingredient.name}
                  </div>
                  <div className="text-[11px] text-red-700 font-semibold mt-0.5">
                    {item.ingredient.currentStock.toFixed(1)}{' '}
                    {item.ingredient.unit} remaining — {item.status}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Recommended order: +{item.recommendedReplenishment}{' '}
                    {item.ingredient.unit}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    adjustIngredientStock(
                      item.ingredient.id,
                      item.recommendedReplenishment,
                      'Incoming Delivery',
                      `Quick restock (+${item.recommendedReplenishment} ${item.ingredient.unit})`
                    )
                  }
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  + Restock {item.recommendedReplenishment} {item.ingredient.unit}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: Ingredient Inventory Table + Delivery/Adjustment Form */}
      {activeTab === 'stock' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 8 Columns: Stock Table */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Live Ingredient Stock & Stockout Horizon
                </h2>
                <p className="text-xs text-slate-500">
                  Daily consumption is dynamically calculated from today's forecast portions and recipe mappings
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Ingredient</span>
              </button>
            </div>

            {showAddForm && (
              <form
                onSubmit={handleAddNewIngredient}
                className="p-5 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
              >
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ingredient Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newIngName}
                    onChange={(e) => setNewIngName(e.target.value)}
                    placeholder="e.g., Fresh Prawns"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category & Unit
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={newIngCategory}
                      onChange={(e) =>
                        setNewIngCategory(
                          e.target.value as Ingredient['category']
                        )
                      }
                      className="flex-1 px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="Poultry & Meat">Poultry & Meat</option>
                      <option value="Grains & Noodles">Grains & Noodles</option>
                      <option value="Produce">Produce</option>
                      <option value="Pantry & Condiments">Pantry & Condiments</option>
                    </select>
                    <select
                      value={newIngUnit}
                      onChange={(e) =>
                        setNewIngUnit(e.target.value as Ingredient['unit'])
                      }
                      className="w-20 px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="kg">kg</option>
                      <option value="litres">litres</option>
                      <option value="packs">packs</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Initial Stock & Min Threshold
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      value={newIngStock}
                      onChange={(e) => setNewIngStock(e.target.value)}
                      placeholder="Stock"
                      className="w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={newIngThreshold}
                      onChange={(e) => setNewIngThreshold(e.target.value)}
                      placeholder="Min"
                      className="w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-purple-700 text-white font-semibold rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                    <th className="py-3.5 px-4">Ingredient</th>
                    <th className="py-3.5 px-4 text-right">Current Stock</th>
                    <th className="py-3.5 px-4 text-right">Min Threshold</th>
                    <th className="py-3.5 px-4 text-right">Est. Daily Need</th>
                    <th className="py-3.5 px-4 text-right">Days to Stockout</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs tabular-nums">
                  {stockAnalysis.map((st) => {
                    const statusColor =
                      st.status === 'Low Stock' || st.status === 'Out of Stock'
                        ? 'text-red-700 font-bold'
                        : st.status === 'Running Low'
                        ? 'text-amber-700 font-bold'
                        : 'text-emerald-700 font-semibold';

                    return (
                      <tr
                        key={st.ingredient.id}
                        onClick={() => setSelectedIngId(st.ingredient.id)}
                        className={`cursor-pointer transition-colors ${
                          selectedIngId === st.ingredient.id
                            ? 'bg-purple-50/50'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">
                            {st.ingredient.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {st.ingredient.category} · {st.ingredient.supplier}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          {st.ingredient.currentStock.toFixed(2)}{' '}
                          {st.ingredient.unit}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                          {st.ingredient.minThreshold.toFixed(1)}{' '}
                          {st.ingredient.unit}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                          {st.forecastDailyRequirement.toFixed(1)}{' '}
                          {st.ingredient.unit}/day
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                          ~{st.daysUntilStockout} days
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={statusColor}>{st.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right 4 Columns: Record Incoming Delivery / Manual Stock Adjustment */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Truck className="w-5 h-5 text-purple-700" />
              <h2 className="text-base font-bold text-slate-900">
                Record Delivery or Stock Adjustment
              </h2>
            </div>

            <form onSubmit={handleUpdateStockSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Ingredient
                </label>
                <select
                  value={selectedIngId}
                  onChange={(e) => setSelectedIngId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  {ingredients.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.currentStock} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustmentType('Incoming Delivery');
                      setDeltaQty('10');
                      setAdjustReason('Supplier delivery restock');
                    }}
                    className={`py-2 px-3 rounded-xl border font-semibold transition-all ${
                      adjustmentType === 'Incoming Delivery'
                        ? 'border-purple-700 bg-purple-50 text-purple-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Incoming Delivery (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustmentType('Manual Adjustment');
                      setDeltaQty('-1');
                      setAdjustReason('Physical stocktake adjustment');
                    }}
                    className={`py-2 px-3 rounded-xl border font-semibold transition-all ${
                      adjustmentType === 'Manual Adjustment'
                        ? 'border-purple-700 bg-purple-50 text-purple-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Manual Audit (+/-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity Change (Use negative for reduction)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={deltaQty}
                  onChange={(e) => setDeltaQty(e.target.value)}
                  className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Update Minimum Stock Threshold (Optional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newMinThreshold}
                  onChange={(e) => setNewMinThreshold(e.target.value)}
                  placeholder="Leave blank to keep existing threshold"
                  className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason / Delivery Reference
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-xl transition-colors"
              >
                Save Inventory Update
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Editable Recipe-to-Ingredient Mapping */}
      {activeTab === 'recipes' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Editable Recipe-to-Ingredient Consumption Mapping
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure exact ingredient quantities deducted per portion when an order is accepted or completed. If no recipe is configured, no automatic deduction occurs.
              </p>
            </div>

            <select
              value={selectedMenuItemId}
              onChange={(e) => handleSelectMenuItemForRecipe(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              {menuItems.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {draftRecipe.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
                No ingredients mapped to this dish yet. Add an ingredient requirement below.
              </div>
            ) : (
              draftRecipe.map((req, idx) => {
                const ing = ingredients.find((i) => i.id === req.ingredientId);
                return (
                  <div
                    key={idx}
                    className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                      <select
                        value={req.ingredientId}
                        onChange={(e) => {
                          const updated = [...draftRecipe];
                          updated[idx] = {
                            ...updated[idx],
                            ingredientId: e.target.value,
                          };
                          setDraftRecipe(updated);
                        }}
                        className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-900"
                      >
                        {ingredients.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.name} ({i.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Qty per portion:</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={req.quantityPerPortion}
                        onChange={(e) => {
                          const updated = [...draftRecipe];
                          updated[idx] = {
                            ...updated[idx],
                            quantityPerPortion: parseFloat(e.target.value) || 0,
                          };
                          setDraftRecipe(updated);
                        }}
                        className="w-24 px-2.5 py-1.5 font-mono rounded-lg border border-slate-300 bg-white text-right"
                      />
                      <span className="font-mono text-slate-600 w-10">
                        {ing?.unit || 'unit'}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setDraftRecipe(draftRecipe.filter((_, i) => i !== idx))
                        }
                        className="p-1.5 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() =>
                setDraftRecipe([
                  ...draftRecipe,
                  {
                    ingredientId: ingredients[0]?.id || 'ing-chicken',
                    quantityPerPortion: 0.1,
                  },
                ])
              }
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Ingredient Requirement</span>
            </button>

            <button
              type="button"
              onClick={() => updateItemRecipe(selectedMenuItemId, draftRecipe)}
              className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Save Recipe Mapping for {selectedMenuItem?.name}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Inventory Transaction Log */}
      {activeTab === 'log' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">
              Automated Order Deductions & Stock Audit Log
            </h2>
            <p className="text-xs text-slate-500">
              Complete ledger of recipe-driven order deductions, incoming supplier deliveries, and manual adjustments
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs tabular-nums">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-slate-900">
                    {tx.ingredientName}
                  </span>{' '}
                  · <span className="text-slate-500">{tx.type}</span>
                  <div className="text-slate-600 mt-0.5">{tx.reason}</div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span
                    className={`font-mono font-bold ${
                      tx.deltaQuantity > 0
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {tx.deltaQuantity > 0 ? '+' : ''}
                    {tx.deltaQuantity} {tx.unit}
                  </span>
                  <span className="text-slate-400">{tx.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
