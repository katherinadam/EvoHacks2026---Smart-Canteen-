import React, { useState } from 'react';
import { useCanteen } from '../context/CanteenContext';
import { DEMO_USERS, HERO_BANNER_IMAGE } from '../data/initialData';
import { Utensils, Clock, BarChart3, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { loginAs } = useCanteen();
  const [selectedRoleTab, setSelectedRoleTab] = useState<'customer' | 'staff'>('customer');
  const [emailInput, setEmailInput] = useState('ethan.tan@students.edu.sg');
  const [passwordInput, setPasswordInput] = useState('••••••••');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleSelect = (role: 'customer' | 'staff') => {
    setSelectedRoleTab(role);
    setErrorMsg('');
    if (role === 'customer') {
      setEmailInput('ethan.tan@students.edu.sg');
    } else {
      setEmailInput('raymond.goh@canteen.edu.sg');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMsg('Please enter your school or staff email address.');
      return;
    }
    const matched = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === emailInput.trim().toLowerCase()
    );
    if (matched) {
      loginAs(matched.id);
    } else {
      // Fallback to selected role demo user
      const fallback =
        selectedRoleTab === 'staff' ? 'usr-staff-1' : 'usr-student-1';
      loginAs(fallback);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col lg:flex-row items-stretch">
      {/* Left Column: Brand & Visual Showcase */}
      <div className="lg:w-7/12 relative bg-slate-900 text-white flex flex-col justify-between p-8 lg:p-14 overflow-hidden">
        <img
          src={HERO_BANNER_IMAGE}
          alt="Modern sunlit school canteen dining hall"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-900/50" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Utensils className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">SmartCanteen</span>
          </div>
          <span className="text-xs text-slate-300">Campus Dining & Inventory System</span>
        </div>

        <div className="relative z-10 my-12 max-w-xl">
          <p className="text-sm font-medium text-emerald-400 mb-3">
            AI-powered. Less waiting. Less waste.
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
            Smarter school recesses with transparent demand & queue forecasting.
          </h1>
          <p className="text-slate-300 text-base leading-relaxed mb-8">
            Students and teachers check live queue times and pre-order meals for exact recess pickup slots. Canteen staff plan portion preparation using historical heuristics, weather, and campus events while automating recipe-based stock alerts.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/15">
            <div>
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm mb-1">
                <Clock className="w-4 h-4" />
                <span>Queue Forecasting</span>
              </div>
              <p className="text-xs text-slate-300">
                Compare 5-min vs 20-min stalls before walking to the canteen.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1">
                <BarChart3 className="w-4 h-4" />
                <span>Waste Reduction</span>
              </div>
              <p className="text-xs text-slate-300">
                Portion guidance calibrated to pre-orders, weather, and sports days.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Recipe Stock Sync</span>
              </div>
              <p className="text-xs text-slate-300">
                Automatic ingredient deductions and low-stock replenishment alerts.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-4">
          <span>Prototype Environment · Persistent Browser Storage Enabled</span>
          <span>Transparent Heuristic Forecasting Model</span>
        </div>
      </div>

      {/* Right Column: Role Selector & Demo Login */}
      <div className="lg:w-5/12 flex flex-col justify-center p-6 sm:p-12 lg:p-16 bg-white">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Sign in to SmartCanteen
            </h2>
            <p className="text-sm text-slate-600">
              Select your campus role or use a one-click demo profile below to explore the prototype.
            </p>
          </div>

          {/* Interactive Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => handleRoleSelect('customer')}
              className={`py-2.5 px-4 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                selectedRoleTab === 'customer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student / Teacher
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('staff')}
              className={`py-2.5 px-4 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                selectedRoleTab === 'staff'
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Canteen Staff
            </button>
          </div>

          {/* Quick Demo Login Cards */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-slate-500 mb-3">
              Instant Demo Access (No registration required)
            </p>
            <div className="space-y-2.5">
              {DEMO_USERS.map((u) => {
                const isStaff = u.role === 'staff';
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => loginAs(u.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group ${
                      isStaff
                        ? 'border-purple-200 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-300'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-blue-50/50 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                          isStaff
                            ? 'bg-purple-700 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {u.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {u.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {u.subRole} · {u.gradeOrDept}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 ${
                        isStaff ? 'text-purple-700' : 'text-blue-600'
                      }`}
                    >
                      Launch Demo
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Standard Login Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4 pt-6 border-t border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Campus Email Address
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="name@school.edu.sg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
            )}

            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-xl text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                selectedRoleTab === 'staff'
                  ? 'bg-purple-700 hover:bg-purple-800'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>
                Sign In as {selectedRoleTab === 'staff' ? 'Canteen Staff' : 'Customer'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
