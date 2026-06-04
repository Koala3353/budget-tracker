// ---------------------------------------------------------------------------
// Dummy seed data. Persists to / loads from localStorage in production.
// Generates ~1 year of weekly spending so the historical charts have data,
// and forces the CURRENT week to be over budget (₱1,500 allowance, ₱1,850 spent).
// ---------------------------------------------------------------------------

export const DEFAULT_CATEGORIES = [
  { id: "food", name: "Food", icon: "🍜", color: "#F2851F" },
  { id: "transport", name: "Transport", icon: "🚌", color: "#3A7CA5" },
  { id: "coffee", name: "Coffee", icon: "☕", color: "#8B5E34" },
  { id: "school", name: "School", icon: "📚", color: "#9B5DE5" },
  { id: "fun", name: "Bouldering / Fun", icon: "🧗", color: "#F15BB5" },
  { id: "other", name: "Other", icon: "💸", color: "#888888" },
];

export const DEFAULT_SETTINGS = {
  weeklyAllowance: 150000, // ₱1,500.00
  currencySymbol: "₱",
  weekStartDay: 1, // Monday
};

// Per-week allowance overrides keyed by the week-start date (YYYY-MM-DD).
// Empty by default — the user sets these from the dashboard "Adjust" control.
export const DEFAULT_WEEK_OVERRIDES = {};

const DAY = 86400000;
const now = Date.now();

// Deterministic PRNG so the demo data is stable across reloads.
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260604);
const catIds = ["food", "transport", "coffee", "school", "fun", "other"];
const notesByCat = {
  food: ["JSEC lunch", "Dinner w/ block", "Siomai rice", "Grab food"],
  transport: ["Tricycle", "Jeep", "Grab to Ateneo", "Trike home"],
  coffee: ["Katipunan latte", "Cold brew", "Study fuel"],
  school: ["Bond paper", "Lab printout", "Photocopy", "Org fee"],
  fun: ["Bouldering pass", "Movie", "Arcade", "Concert ticket"],
  other: ["Load", "Toiletries", "Gift", "Misc"],
};

let idc = 0;
const txns = [];

// Past 51 weeks (excludes the current week, which is set explicitly below).
for (let w = 51; w >= 1; w--) {
  const weekStart = now - w * 7 * DAY;
  const count = 3 + Math.floor(rand() * 4); // 3–6 logs/week
  for (let k = 0; k < count; k++) {
    const dayOffset = Math.floor(rand() * 7);
    const ts = weekStart + dayOffset * DAY + Math.floor(rand() * 12) * 3600000;
    const cat = catIds[Math.floor(rand() * catIds.length)];
    const amount = (50 + Math.floor(rand() * 450)) * 100; // ₱50–₱500
    const notes = notesByCat[cat];
    txns.push({
      id: "s" + idc++,
      amount,
      categoryId: cat,
      note: notes[Math.floor(rand() * notes.length)],
      ts,
    });
  }
}

// Current week — totals ₱1,850 so the dashboard opens OVER budget by ₱350.
const hours = (h) => now - h * 3600000;
txns.push(
  { id: "c1", amount: 25000, categoryId: "food", note: "JSEC lunch", ts: hours(2) },
  { id: "c2", amount: 32000, categoryId: "food", note: "Dinner w/ block", ts: hours(20) },
  { id: "c3", amount: 18000, categoryId: "coffee", note: "Katipunan latte", ts: hours(4) },
  { id: "c4", amount: 16500, categoryId: "coffee", note: "Cram sesh cold brew", ts: hours(26) },
  { id: "c5", amount: 6000, categoryId: "transport", note: "Tricycle", ts: hours(5) },
  { id: "c6", amount: 6000, categoryId: "transport", note: "Trike home", ts: hours(7) },
  { id: "c7", amount: 7500, categoryId: "transport", note: "Grab to Ateneo", ts: hours(28) },
  { id: "c8", amount: 30000, categoryId: "school", note: "Lab printout + bond paper", ts: hours(30) },
  { id: "c9", amount: 44000, categoryId: "fun", note: "Bouldering day pass", ts: hours(48) }
);

export const SEED_TRANSACTIONS = txns;
