import React from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { DEMO_USERS } from '../../data/initialData';
import { Wallet, User, RotateCcw, LogOut, ArrowRight } from 'lucide-react';

export const CustomerProfilePage: React.FC = () => {
  const { currentUser, topUpWallet, loginAs, logout, resetDemoData } =
    useCanteen();

  if (!currentUser) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Campus Account & Wallet Profile
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage your simulated Campus Wallet balance, dietary preferences, or switch demo user accounts.
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold shrink-0">
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{currentUser.subRole}</span>
              <span aria-hidden="true">·</span>
              <span>{currentUser.gradeOrDept}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {currentUser.name}
            </h2>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 self-start sm:self-center"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Campus Wallet Top-Up Simulation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Wallet className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Campus Pre-Order Wallet (Simulated)
              </h3>
              <p className="text-xs text-slate-500">
                Used for cashless recess pre-ordering across all participating school stalls.
              </p>
            </div>
          </div>
          <div className="text-right tabular-nums">
            <span className="block text-xs text-slate-500">Current Balance</span>
            <span className="text-2xl font-mono font-bold text-slate-900">
              ${currentUser.walletBalance.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-700">
            Instant Prototype Top-Up:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {[5, 10, 20].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => topUpWallet(amt)}
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-mono font-semibold rounded-xl transition-colors tabular-nums"
              >
                +${amt.toFixed(2)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Role & Demo Profile Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-slate-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Switch Demo User or Role
            </h3>
            <p className="text-xs text-slate-500">
              Test the end-to-end workflow between Student, Teacher, and Canteen Staff consoles.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {DEMO_USERS.map((u) => {
            const isActive = u.id === currentUser.id;
            const isStaff = u.role === 'staff';
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => loginAs(u.id)}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 ${
                  isActive
                    ? 'border-blue-600 bg-blue-50/50'
                    : isStaff
                    ? 'border-purple-200 hover:bg-purple-50/40'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-slate-500">
                    {u.subRole}
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {u.name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {u.gradeOrDept}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-blue-600 pt-2 border-t border-slate-100">
                  <span>{isActive ? 'Active Profile' : 'Switch Role'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-800">
              Reset Prototype Sample Data
            </div>
            <div className="text-[11px] text-slate-500">
              Restore all initial orders, ingredient stock quantities, and forecast overrides.
            </div>
          </div>
          <button
            type="button"
            onClick={resetDemoData}
            className="px-3.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
