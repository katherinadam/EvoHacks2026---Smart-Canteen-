import React from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { DEMO_USERS } from '../../data/initialData';
import {
  Settings,
  Terminal,
  RotateCcw,
  LogOut,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const StaffSettingsPage: React.FC = () => {
  const {
    currentUser,
    simulationContext,
    setSimulationContext,
    loginAs,
    logout,
    resetDemoData,
  } = useCanteen();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Canteen System Configuration & Local Setup Guide
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Configure automated inventory deduction policies, switch user roles, or review local prototype execution instructions.
        </p>
      </div>

      {/* Inventory Deduction Policy Configuration */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-purple-700" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Automated Recipe Inventory Deduction Policy
            </h2>
            <p className="text-xs text-slate-500">
              Choose when SmartCanteen automatically deducts configured recipe ingredient quantities for customer orders.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <button
            type="button"
            onClick={() =>
              setSimulationContext((prev) => ({
                ...prev,
                inventoryDeductionPolicy: 'On Accepted',
              }))
            }
            className={`p-4 rounded-xl border text-left transition-all ${
              simulationContext.inventoryDeductionPolicy === 'On Accepted'
                ? 'border-purple-700 bg-purple-50/60'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">
                Deduct When Order is Accepted (Recommended)
              </span>
              {simulationContext.inventoryDeductionPolicy === 'On Accepted' && (
                <CheckCircle2 className="w-4 h-4 text-purple-700" />
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Immediately reserves and deducts recipe ingredients as soon as canteen staff accept an incoming pre-order.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              setSimulationContext((prev) => ({
                ...prev,
                inventoryDeductionPolicy: 'On Completed',
              }))
            }
            className={`p-4 rounded-xl border text-left transition-all ${
              simulationContext.inventoryDeductionPolicy === 'On Completed'
                ? 'border-purple-700 bg-purple-50/60'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">
                Deduct When Order is Completed / Collected
              </span>
              {simulationContext.inventoryDeductionPolicy ===
                'On Completed' && (
                <CheckCircle2 className="w-4 h-4 text-purple-700" />
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Deducts recipe ingredients only after the student or teacher collects the finished meal at the counter.
            </p>
          </button>
        </div>
      </div>

      {/* Role Switcher & Demo Data Reset */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Role Testing & Prototype Data Controls
            </h2>
            <p className="text-xs text-slate-500">
              Switch between Student, Teacher, and Canteen Staff views while keeping shared state intact.
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DEMO_USERS.map((u) => {
            const isActive = u.id === currentUser?.id;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => loginAs(u.id)}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  isActive
                    ? 'border-purple-700 bg-purple-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-slate-500">
                    {u.subRole}
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {u.name}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-purple-700 pt-2 border-t border-slate-100">
                  <span>{isActive ? 'Current User' : 'Switch to Profile'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-900">
              Reset All Prototype Data to Default
            </div>
            <div className="text-[11px] text-slate-500">
              Clears browser storage and restores initial sample orders, inventory, and recipes.
            </div>
          </div>
          <button
            type="button"
            onClick={resetDemoData}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Clear Instructions for Starting the Application Locally */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-5 h-5 text-purple-400" />
          <div>
            <h2 className="text-base font-bold">
              Local Development & Execution Instructions
            </h2>
            <p className="text-xs text-slate-300">
              Run SmartCanteen on your local workstation with zero paid API keys required
            </p>
          </div>
        </div>

        <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-200 space-y-2 overflow-x-auto">
          <div># 1. Install dependencies</div>
          <div className="text-emerald-400">npm install</div>
          <div className="pt-1"># 2. Start the Vite development server on port 3000</div>
          <div className="text-emerald-400">npm run dev</div>
          <div className="pt-1"># 3. Build production bundle</div>
          <div className="text-emerald-400">npm run build</div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Architecture Note:</strong> SmartCanteen persists all orders, inventory transactions, recipe mappings, and demand overrides automatically in browser <code className="text-purple-300">localStorage</code> (`smartcanteen_state_v1`). The heuristic prediction engine in <code className="text-purple-300">src/utils/predictionEngine.ts</code> is modularly structured so an external ML inference endpoint or Supabase database can be plugged in directly.
        </p>
      </div>
    </div>
  );
};
