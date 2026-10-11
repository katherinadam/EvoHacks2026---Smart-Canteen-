# SmartCanteen — AI-Powered School Canteen Management App

> **AI-powered. Less waiting. Less waste.**

**SmartCanteen** is a responsive web application designed to reduce school canteen waiting times, minimise food wastage, simplify ingredient stock management, and make recess pre-ordering seamless for students, teachers, and canteen staff.

---

## 1. Quick Start (Launch Locally)

No paid API keys or external database credentials are required to launch and test the prototype. All state (pre-orders, inventory deductions, recipe mappings, and demand overrides) persists automatically in your browser's `localStorage`.

### Prerequisites
- **Node.js** (v18 or newer recommended)
- **npm** (comes bundled with Node.js)

### Step-by-Step Launch Guide

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open the application in your browser:**
   Navigate to `http://localhost:3000` (or the local URL displayed in your terminal).

4. **Build for production (optional):**
   ```bash
   npm run build
   npm run preview
   ```

---

## 2. Exploring the Prototype & Demo Roles

You can switch between **Customer (Student / Teacher)** and **Canteen Staff** roles at any time using either:
- The **Sign-In / Role Selector** screen (`Sign Out` button in Profile / Settings), or
- The **Quick Role Switcher** (`Switch to Staff Console` / `Switch to Student View`) located in the top right of the **Campus Forecast Context** bar.

### Demo Accounts Included
| Profile | Role | Campus Dept / Class | Access Level |
| :--- | :--- | :--- | :--- |
| **Ethan Tan** | Student | Secondary 3E2 | Customer Interface (`Home`, `Queue Forecast`, `Menu`, `My Orders`, `Profile`) |
| **Uncle Raymond Goh** | Canteen Staff | Central Canteen Ops | Staff Console (`Dashboard`, `Orders`, `Demand Forecast`, `Inventory`, `Reports`, `Settings`) |

---

## 3. End-to-End Walkthrough Scenario

To test the full customer-to-staff workflow:

1. **Place a Student Pre-Order:**
   - Ensure you are signed in as **Ethan Tan (Student)**.
   - Go to **Menu**, select **Chicken Rice (Steamed / Roasted)** ($3.50), and click **Add to Pre-Order**.
   - In the **AI Pre-Order Checkout** panel on the right, pick a recess period and a 15-minute pickup slot (e.g., `09:45`), add an optional special request, and click **Confirm Pre-Order**.
2. **Process the Order as Canteen Staff:**
   - Click **Switch to Staff Console** in the top context bar.
   - Open **Orders** (or inspect the **Incoming Pre-Orders** queue on the **Dashboard**).
   - Click **Accept Order** → **Mark Preparing** → **Mark Ready for Pickup**.
   - Notice that accepting the order automatically deducts the configured recipe ingredients (*Chicken*, *Rice*, *Lettuce*, *Cooking Oil*) from **Inventory** according to the active stock deduction policy.
   - Switch to **Grouped Prep Batches** in the **Orders** tab to see how orders from the same stall and pickup time are batched together for kitchen efficiency while preserving each student's individual order number.
3. **Track & Collect the Order as a Student:**
   - Click **Switch to Student View** in the top context bar.
   - A green pickup banner alerts you that your order is **Ready for Pickup**.
   - Open **My Orders** and click **Mark as Collected** (or **Confirm Collected**) to complete the lifecycle.

---

## 4. Key Features & Architecture

- **Transparent Heuristic Queue & Demand Forecasting (`src/utils/predictionEngine.ts`):**
  - Calculates approximate stall waiting times and suggested portion counts using historical order baselines, day-of-week multipliers, weather conditions, scheduled school events, stall preparation capacities, and live pre-orders.
  - Clearly distinguishes measured historical data from heuristic estimates and allows staff to manually override preparation targets or log post-recess actual sales to measure forecast accuracy.
- **Automated Recipe-Driven Stock Management (`src/components/staff/StaffInventoryPage.tsx`):**
  - Editable recipe-to-ingredient mapping per dish.
  - Automatic ingredient deductions when orders are accepted or completed, plus low-stock alerts and replenishment recommendations.
- **Resetting Demo Data:**
  - To restore all sample orders, inventory quantities, and forecast overrides to their original state, go to **Profile** (Customer) or **Settings** (Staff) and click **Reset Demo Data**.
