/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CanteenProvider, useCanteen } from './context/CanteenContext';
import { LoginScreen } from './components/LoginScreen';
import { ContextBar } from './components/ContextBar';

// Customer Views
import { CustomerHome } from './components/customer/CustomerHome';
import { CustomerQueuePage } from './components/customer/CustomerQueuePage';
import { CustomerMenuOrderPage } from './components/customer/CustomerMenuOrderPage';
import { CustomerOrdersPage } from './components/customer/CustomerOrdersPage';
import { CustomerProfilePage } from './components/customer/CustomerProfilePage';

// Staff Views
import { StaffDashboard } from './components/staff/StaffDashboard';
import { StaffOrdersPage } from './components/staff/StaffOrdersPage';
import { StaffDemandPage } from './components/staff/StaffDemandPage';
import { StaffInventoryPage } from './components/staff/StaffInventoryPage';
import { StaffReportsPage } from './components/staff/StaffReportsPage';
import { StaffSettingsPage } from './components/staff/StaffSettingsPage';

import {
  Home,
  Clock,
  UtensilsCrossed,
  ShoppingBag,
  User,
  LayoutDashboard,
  ClipboardList,
  TrendingUp,
  Package,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';

type CustomerTab = 'home' | 'queue' | 'menu' | 'orders' | 'profile';
type StaffTab =
  | 'dashboard'
  | 'orders'
  | 'demand'
  | 'inventory'
  | 'reports'
  | 'settings';

const SmartCanteenShell: React.FC = () => {
  const {
    currentUser,
    cart,
    orders,
    notifications,
    dismissNotification,
  } = useCanteen();

  const [customerTab, setCustomerTab] = useState<CustomerTab>('home');
  const [staffTab, setStaffTab] = useState<StaffTab>('dashboard');
  const [selectedStallForMenu, setSelectedStallForMenu] = useState<
    string | undefined
  >(undefined);

  const isStaff = currentUser?.role === 'staff';

  // Reset active sub-route if user switches role
  useEffect(() => {
    if (isStaff) {
      setStaffTab('dashboard');
    } else {
      setCustomerTab('home');
    }
  }, [isStaff]);

  if (!currentUser) {
    return <LoginScreen />;
  }

  const handleCustomerNavigate = (
    tab: CustomerTab,
    stallFilter?: string
  ) => {
    if (stallFilter) {
      setSelectedStallForMenu(stallFilter);
    } else if (tab !== 'menu') {
      setSelectedStallForMenu(undefined);
    }
    setCustomerTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStaffNavigate = (tab: StaffTab) => {
    setStaffTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cartItemCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const pendingStaffOrderCount = orders.filter(
    (o) => o.status === 'Pending'
  ).length;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0">
      {/* Top Bar Contract: Strictly 3 Zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            if (isStaff) handleStaffNavigate('dashboard');
            else handleCustomerNavigate('home');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          SmartCanteen
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        {!isStaff ? (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => handleCustomerNavigate('home')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                customerTab === 'home'
                  ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                  : ''
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleCustomerNavigate('queue')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                customerTab === 'queue'
                  ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                  : ''
              }`}
            >
              Queue Forecast
            </button>
            <button
              type="button"
              onClick={() => handleCustomerNavigate('menu')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                customerTab === 'menu'
                  ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                  : ''
              }`}
            >
              Menu
            </button>
            <button
              type="button"
              onClick={() => handleCustomerNavigate('orders')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                customerTab === 'orders'
                  ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                  : ''
              }`}
            >
              My Orders
            </button>
            <button
              type="button"
              onClick={() => handleCustomerNavigate('profile')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                customerTab === 'profile'
                  ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                  : ''
              }`}
            >
              Profile
            </button>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => handleStaffNavigate('dashboard')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                staffTab === 'dashboard'
                  ? 'text-purple-700 font-semibold border-b-2 border-purple-700'
                  : ''
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => handleStaffNavigate('orders')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                staffTab === 'orders'
                  ? 'text-purple-700 font-semibold border-b-2 border-purple-700'
                  : ''
              }`}
            >
              Orders
            </button>
            <button
              type="button"
              onClick={() => handleStaffNavigate('demand')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                staffTab === 'demand'
                  ? 'text-purple-700 font-semibold border-b-2 border-purple-700'
                  : ''
              }`}
            >
              Demand Forecast
            </button>
            <button
              type="button"
              onClick={() => handleStaffNavigate('inventory')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                staffTab === 'inventory'
                  ? 'text-purple-700 font-semibold border-b-2 border-purple-700'
                  : ''
              }`}
            >
              Inventory
            </button>
            <button
              type="button"
              onClick={() => handleStaffNavigate('reports')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                staffTab === 'reports'
                  ? 'text-purple-700 font-semibold border-b-2 border-purple-700'
                  : ''
              }`}
            >
              Reports
            </button>
            <button
              type="button"
              onClick={() => handleStaffNavigate('settings')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                staffTab === 'settings'
                  ? 'text-purple-700 font-semibold border-b-2 border-purple-700'
                  : ''
              }`}
            >
              Settings
            </button>
          </nav>
        )}

        {/* Zone 3: 1 Primary Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          {!isStaff ? (
            <button
              type="button"
              onClick={() => handleCustomerNavigate('menu')}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
            >
              {cartItemCount > 0
                ? `Pre-Order Cart (${cartItemCount})`
                : 'Pre-Order Food'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleStaffNavigate('orders')}
              className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 rounded-xl hover:bg-purple-800 transition-colors whitespace-nowrap shrink-0"
            >
              {pendingStaffOrderCount > 0
                ? `Process Queue (${pendingStaffOrderCount} New)`
                : 'Manage Orders'}
            </button>
          )}
        </div>
      </header>

      {/* Contextual Simulation & Role-Switching Toolbar */}
      <ContextBar />

      {/* Toast Notifications */}
      {notifications.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`pointer-events-auto p-4 rounded-xl border shadow-lg flex items-start justify-between gap-3 text-xs ${
                n.type === 'success'
                  ? 'bg-emerald-900 text-white border-emerald-700'
                  : n.type === 'warning'
                  ? 'bg-amber-900 text-white border-amber-700'
                  : 'bg-slate-900 text-white border-slate-700'
              }`}
            >
              <div>
                <div className="font-bold">{n.title}</div>
                <div className="text-slate-200 mt-0.5">{n.message}</div>
              </div>
              <button
                type="button"
                onClick={() => dismissNotification(n.id)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {!isStaff ? (
          <>
            {customerTab === 'home' && (
              <CustomerHome onNavigate={handleCustomerNavigate} />
            )}
            {customerTab === 'queue' && (
              <CustomerQueuePage
                onSelectStallForOrder={(stallId) =>
                  handleCustomerNavigate('menu', stallId)
                }
              />
            )}
            {customerTab === 'menu' && (
              <CustomerMenuOrderPage
                initialStallId={selectedStallForMenu}
                onOrderSuccessNavigate={() => handleCustomerNavigate('orders')}
              />
            )}
            {customerTab === 'orders' && (
              <CustomerOrdersPage
                onBrowseMenu={() => handleCustomerNavigate('menu')}
              />
            )}
            {customerTab === 'profile' && <CustomerProfilePage />}
          </>
        ) : (
          <>
            {staffTab === 'dashboard' && (
              <StaffDashboard onNavigate={handleStaffNavigate} />
            )}
            {staffTab === 'orders' && <StaffOrdersPage />}
            {staffTab === 'demand' && <StaffDemandPage />}
            {staffTab === 'inventory' && <StaffInventoryPage />}
            {staffTab === 'reports' && <StaffReportsPage />}
            {staffTab === 'settings' && <StaffSettingsPage />}
          </>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 py-5 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>SmartCanteen</strong> — AI-powered. Less waiting. Less waste.
          </div>
          <div>
            Role-enforced campus dining & inventory prototype · Persistent browser storage active
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 h-14 px-2">
        {!isStaff ? (
          <div className="grid grid-cols-5 h-full items-center">
            <button
              type="button"
              onClick={() => handleCustomerNavigate('home')}
              className={`flex flex-col items-center justify-center min-h-[44px] ${
                customerTab === 'home' ? 'text-blue-600' : 'text-slate-500'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-medium mt-0.5">Home</span>
            </button>
            <button
              type="button"
              onClick={() => handleCustomerNavigate('queue')}
              className={`flex flex-col items-center justify-center min-h-[44px] ${
                customerTab === 'queue' ? 'text-blue-600' : 'text-slate-500'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="text-[10px] font-medium mt-0.5">Queue</span>
            </button>
            <button
              type="button"
              onClick={() => handleCustomerNavigate('menu')}
              className={`flex flex-col items-center justify-center min-h-[44px] ${
                customerTab === 'menu' ? 'text-blue-600' : 'text-slate-500'
              }`}
            >
              <UtensilsCrossed className="w-5 h-5" />
              <span className="text-[10px] font-medium mt-0.5">Menu</span>
            </button>
            <button
              type="button"
              onClick={() => handleCustomerNavigate('orders')}
              className={`flex flex-col items-center justify-center min-h-[44px] ${
                customerTab === 'orders' ? 'text-blue-600' : 'text-slate-500'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-[10px] font-medium mt-0.5">Orders</span>
            </button>
            <button
              type="button"
              onClick={() => handleCustomerNavigate('profile')}
              className={`flex flex-col items-center justify-center min-h-[44px] ${
                customerTab === 'profile' ? 'text-blue-600' : 'text-slate-500'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium mt-0.5">Profile</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-6 h-full items-center">
            <button
              type="button"
              onClick={() => handleStaffNavigate('dashboard')}
              className={`flex flex-col items-center justify-center min-h-[44px] ${
                staffTab === 'dashboard' ? 'text-purple-700' : 'text-slate-500'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-[10px] font-medium mt-0.5">Home</span>
            </button>
            <button
              type="button"
              onClick={() => handleStaffNavigate('orders')}
              className={`flex flex-col items-center justify-center min-h-[44px] ${
                staffTab === 'orders' ? 'text-purple-700' : 'text-slate-500'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span className="text-[10px] font-medium mt-0.5">Orders</span>
            </button>
            <button
              type="button"
              onClick={() => handleStaffNavigate('demand')}
              className={`flex flex-col items-center justify-center min-h-[44px] ${
                staffTab === 'demand' ? 'text-purple-700' : 'text-slate-500'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] font-medium mt-0.5">Demand</span>
            </button>
            <button
              type="button"
              onClick={() => handleStaffNavigate('inventory')}
              className={`flex flex-col items-center justify-center min-h-[44px] ${
                staffTab === 'inventory' ? 'text-purple-700' : 'text-slate-500'
              }`}
            >
              <Package className="w-4 h-4" />
              <span className="text-[10px] font-medium mt-0.5">Stock</span>
            </button>
            <button
              type="button"
              onClick={() => handleStaffNavigate('reports')}
              className={`flex flex-col items-center justify-center min-h-[44px] ${
                staffTab === 'reports' ? 'text-purple-700' : 'text-slate-500'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-[10px] font-medium mt-0.5">Reports</span>
            </button>
            <button
              type="button"
              onClick={() => handleStaffNavigate('settings')}
              className={`flex flex-col items-center justify-center min-h-[44px] ${
                staffTab === 'settings' ? 'text-purple-700' : 'text-slate-500'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="text-[10px] font-medium mt-0.5">Settings</span>
            </button>
          </div>
        )}
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <CanteenProvider>
      <SmartCanteenShell />
    </CanteenProvider>
  );
}
