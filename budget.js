// ---------------------------------------------------------------------------
// Pure helpers for money math, parsing, and weekly budget derivation.
// Money is stored as INTEGER centavos (e.g. ₱123.45 -> 12345) to avoid float
// drift. Format only at render time.
// ---------------------------------------------------------------------------

export const MAX_CENTAVOS = 999999999; // ₱9,999,999.99 cap

/** Format integer centavos as a display string with thousands separators.
 *  Drops the decimals when the value is a whole peso (₱350 not ₱350.00). */
export function formatMoney(centavos, symbol = "₱") {
  const negative = centavos < 0;
  const abs = Math.abs(centavos);
  const whole = Math.floor(abs / 100);
  const cents = abs % 100;
  const grouped = whole.toLocaleString("en-US");
  const body = cents === 0 ? grouped : `${grouped}.${String(cents).padStart(2, "0")}`;
  return `${negative ? "-" : ""}${symbol}${body}`;
}

/** Parse a keypad/input string ("350", "12.5", "12.34") into integer centavos.
 *  Truncates (clamps) to 2 decimals, rejects invalid input, caps at MAX. */
export function parseAmount(str) {
  if (str == null) return 0;
  const s = String(str).trim();
  if (s === "" || s === ".") return 0;
  if (!/^\d*\.?\d*$/.test(s)) return 0; // digits + optional single dot only
  const [intPart = "0", decPartRaw = ""] = s.split(".");
  const decPart = decPartRaw.slice(0, 2).padEnd(2, "0"); // truncate, not round
  const cents = parseInt(intPart || "0", 10) * 100 + parseInt(decPart || "0", 10);
  if (!Number.isFinite(cents) || cents < 0) return 0;
  return Math.min(cents, MAX_CENTAVOS);
}

/** Totals for the current week. */
export function computeTotals(transactions, allowance) {
  const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const remaining = allowance - spent;
  const pct = allowance > 0 ? spent / allowance : 0; // guard divide-by-zero
  return {
    spent,
    allowance,
    remaining,
    pct,
    isOver: spent > allowance,
  };
}

/** Per-category sums, sorted high -> low, with the top category surfaced. */
export function computeCategoryBreakdown(transactions, categories) {
  const byId = new Map();
  for (const t of transactions) {
    byId.set(t.categoryId, (byId.get(t.categoryId) || 0) + t.amount);
  }
  const total = transactions.reduce((s, t) => s + t.amount, 0);
  const rows = [];
  for (const [categoryId, amount] of byId.entries()) {
    const cat =
      categories.find((c) => c.id === categoryId) || {
        id: categoryId,
        name: "Uncategorized",
        color: "#888888",
        icon: "❔",
      };
    rows.push({
      categoryId,
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      amount,
      pct: total > 0 ? amount / total : 0,
    });
  }
  rows.sort((a, b) => b.amount - a.amount);
  return { rows, total, top: rows[0] || null };
}

/** Ring color based on how much of the allowance is spent. */
export function ringColor(pct, isOver) {
  if (isOver) return "#E5484D"; // over -> red
  if (pct >= 0.8) return "#F5A623"; // nearing -> amber
  return "#5B8C5A"; // safe -> matcha
}

/** "2:30 PM" */
export function formatTime(ts) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Group label for a timestamp: "Today", "Yesterday", or "Monday, Aug 12". */
export function dayLabel(ts) {
  const d = new Date(ts);
  const now = new Date();
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dayMs = 86400000;
  const diffDays = Math.round((startOf(now) - startOf(d)) / dayMs);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}
