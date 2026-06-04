import { useState } from "react";
import { parseAmount, formatMoney, computeTotals } from "./budget.js";
import { ChartIcon } from "./icons.jsx";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

/**
 * Quick-Add (the app's HOME screen). Built for speed: custom on-screen numpad,
 * one-tap category chips, optional note, and a Save button that stays disabled
 * until an amount > 0 AND a category are chosen.
 *
 * A budget banner + a dedicated button route to the Dashboard.
 */
export default function QuickAdd({
  categories,
  transactions,
  settings,
  onAdd,
  onGoDashboard,
}) {
  const symbol = settings.currencySymbol;
  const [amountStr, setAmountStr] = useState(""); // raw keypad string
  const [categoryId, setCategoryId] = useState(null);
  const [note, setNote] = useState("");

  const cents = parseAmount(amountStr);
  const canSave = cents > 0 && categoryId != null;

  const { remaining, isOver } = computeTotals(transactions, settings.weeklyAllowance);

  function press(k) {
    setAmountStr((prev) => {
      if (k === "⌫") return prev.slice(0, -1);
      if (k === ".") {
        if (prev.includes(".")) return prev; // only one dot
        return prev === "" ? "0." : prev + ".";
      }
      // block a third decimal place
      if (prev.includes(".") && prev.split(".")[1].length >= 2) return prev;
      if (prev === "0" && k !== ".") return k; // avoid leading zeros like 09
      return prev + k;
    });
  }

  function save() {
    if (!canSave) return;
    onAdd({ amount: cents, categoryId, note: note.trim() });
    setAmountStr("");
    setCategoryId(null);
    setNote("");
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Tappable budget banner -> Dashboard */}
      <button
        onClick={onGoDashboard}
        className={`mx-4 mt-4 flex items-center justify-between rounded-2xl px-4 py-3 text-left
          ${isOver ? "bg-over/10" : "bg-matcha/10"}`}
      >
        <div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {isOver ? "Over budget this week" : "Remaining this week"}
          </div>
          <div
            className={`text-lg font-bold tabular-nums ${
              isOver ? "text-over" : "text-matcha"
            }`}
          >
            {isOver
              ? `-${formatMoney(Math.abs(remaining), symbol)} over`
              : formatMoney(remaining, symbol)}
          </div>
        </div>
        <span
          className={`flex items-center gap-1 text-sm font-semibold ${
            isOver ? "text-over" : "text-matcha"
          }`}
        >
          <ChartIcon size={18} /> Dashboard →
        </span>
      </button>

      {/* Amount display */}
      <div className="px-4 pt-6 pb-3 text-center">
        <div className="text-sm font-medium uppercase tracking-wide text-gray-400">
          Amount
        </div>
        <div className="mt-1 text-5xl font-extrabold text-gray-900 dark:text-white tabular-nums">
          {amountStr === "" ? `${symbol}0` : formatMoney(cents, symbol)}
        </div>
      </div>

      {/* Category chips */}
      <div className="px-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = categoryId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={`min-h-[44px] rounded-full px-4 py-2 text-sm font-medium border transition active:scale-95
                  ${
                    active
                      ? "text-white border-transparent"
                      : "text-gray-700 dark:text-gray-200 border-gray-300 dark:border-white/15 bg-white dark:bg-neutral-800"
                  }`}
                style={active ? { backgroundColor: c.color } : undefined}
              >
                {c.icon} {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional note */}
      <div className="px-4 pt-4">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note (e.g. JSEC lunch, Grab to Ateneo)"
          className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-neutral-800
                     px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-matcha/40"
        />
      </div>

      {/* Numpad */}
      <div className="px-4 pt-5">
        <div className="grid grid-cols-3 gap-2.5">
          {KEYS.map((k) => (
            <button
              key={k}
              onClick={() => press(k)}
              className="h-16 rounded-2xl bg-white dark:bg-neutral-800 text-2xl font-semibold
                         text-gray-900 dark:text-white shadow-sm active:scale-95 active:bg-gray-100
                         dark:active:bg-neutral-700 transition"
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Save + Dashboard buttons */}
      <div className="px-4 pt-5 pb-4 space-y-3">
        <button
          onClick={save}
          disabled={!canSave}
          className={`w-full rounded-2xl py-4 text-base font-semibold transition
            ${
              canSave
                ? "bg-matcha text-white active:scale-[0.99]"
                : "bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed"
            }`}
        >
          {canSave ? `Save ${formatMoney(cents, symbol)}` : "Enter amount & category"}
        </button>

        <button
          onClick={onGoDashboard}
          className="w-full rounded-2xl border border-matcha/40 py-3.5 text-base font-semibold
                     text-matcha active:scale-[0.99] transition flex items-center justify-center gap-2"
        >
          <ChartIcon size={20} /> View Dashboard
        </button>
      </div>
    </div>
  );
}
