// ---------------------------------------------------------------------------
// Dummy seed data. In production this would be loaded from / saved to
// localStorage (see notes in App.jsx). The transactions below intentionally
// sum to MORE than the weekly allowance so the OVER-BUDGET state renders on
// first load: allowance ₱1,500, spent ₱1,850 -> ₱350 over.
// ---------------------------------------------------------------------------

export const DEFAULT_CATEGORIES = [
  { id: "food", name: "Food", icon: "🍜", color: "#F2851F" }, // orange
  { id: "transport", name: "Transport", icon: "🚌", color: "#3A7CA5" }, // blue
  { id: "coffee", name: "Coffee", icon: "☕", color: "#8B5E34" }, // brown
  { id: "school", name: "School", icon: "📚", color: "#9B5DE5" }, // purple
  { id: "fun", name: "Bouldering / Fun", icon: "🧗", color: "#F15BB5" }, // pink
  { id: "other", name: "Other", icon: "💸", color: "#888888" }, // gray
];

export const DEFAULT_SETTINGS = {
  weeklyAllowance: 150000, // ₱1,500.00 in centavos
  currencySymbol: "₱",
  weekStartDay: 1, // 0 = Sunday, 1 = Monday
};

const now = Date.now();
const hours = (h) => now - h * 3600000;

// Spent total = 1850.00 -> over budget by ₱350.
export const SEED_TRANSACTIONS = [
  { id: "t1", amount: 25000, categoryId: "food", note: "JSEC lunch", ts: hours(2) },
  { id: "t2", amount: 32000, categoryId: "food", note: "Dinner w/ block", ts: hours(20) },
  { id: "t3", amount: 18000, categoryId: "coffee", note: "Katipunan latte", ts: hours(4) },
  { id: "t4", amount: 16500, categoryId: "coffee", note: "Cram sesh cold brew", ts: hours(26) },
  { id: "t5", amount: 6000, categoryId: "transport", note: "Tricycle", ts: hours(5) },
  { id: "t6", amount: 6000, categoryId: "transport", note: "Trike home", ts: hours(7) },
  { id: "t7", amount: 7500, categoryId: "transport", note: "Grab to Ateneo", ts: hours(28) },
  { id: "t8", amount: 30000, categoryId: "school", note: "Lab printout + bond paper", ts: hours(30) },
  { id: "t9", amount: 44000, categoryId: "fun", note: "Bouldering day pass", ts: hours(48) },
];

// To demo the EMPTY / fresh-week dashboard instead, swap the export above for:
// export const SEED_TRANSACTIONS = [];
