import { useState } from "react";
import {
  computeTotals,
  computeCategoryBreakdown,
  computeHistory,
  formatMoney,
  parseAmount,
  getWeekRange,
  weekTransactions,
  weekKey,
  getAllowanceForWeek,
} from "./budget.js";
import ProgressRing from "./ProgressRing.jsx";
import CategoryBreakdown from "./CategoryBreakdown.jsx";
import HistoryChart from "./HistoryChart.jsx";
import Modal from "./Modal.jsx";
import { PlusIcon } from "./icons.jsx";

const WEEK_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const RANGES = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "3m", label: "3 Months" },
  { key: "year", label: "1 Year" },
];

export default function Dashboard({
  categories,
  transactions,
  settings,
  weekOverrides,
  onSetWeekAllowance,
  onAdd,
}) {
  const symbol = settings.currencySymbol;
  const now = Date.now();

  // --- Current week (filtered by date range, allowance honors per-week override) ---
  const range = getWeekRange(now, settings.weekStartDay);
  const curKey = weekKey(now, settings.weekStartDay);
  const weekTx = weekTransactions(transactions, range);
  const allowance = getAllowanceForWeek(curKey, settings, weekOverrides);
  const totals = computeTotals(weekTx, allowance);
  const breakdown = computeCategoryBreakdown(weekTx, categories);
  const { spent, remaining, pct, isOver } = totals;
  const isEmpty = weekTx.length === 0;
  const hasOverride = weekOverrides[curKey] != null;

  // --- Historical range view ---
  const [mode, setMode] = useState("month");
  const history = computeHistory(transactions, mode, settings, weekOverrides, now);
  const rangeTotal = history.buckets.reduce((s, b) => s + b.spent, 0);

  // --- Adjust-this-week modal ---
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [draft, setDraft] = useState((allowance / 100).toString());

  return (
    <div className="px-4 pt-5 pb-4">
      <header className="mb-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">This Week</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Resets {WEEK_DAYS[settings.weekStartDay]}
        </p>
      </header>

      {/* Hero ring */}
      <div className="flex flex-col items-center py-6">
        <ProgressRing pct={pct} isOver={isOver}>
          {isEmpty ? (
            <>
              <div className="text-3xl font-extrabold text-matcha tabular-nums">
                {formatMoney(allowance, symbol)}
              </div>
              <div className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                full allowance
              </div>
            </>
          ) : isOver ? (
            <>
              <div className="text-4xl font-extrabold text-over tabular-nums">
                -{formatMoney(Math.abs(remaining), symbol)}
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-over">
                over budget
              </div>
            </>
          ) : (
            <>
              <div className="text-4xl font-extrabold text-gray-900 dark:text-white tabular-nums">
                {formatMoney(remaining, symbol)}
              </div>
              <div className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                remaining
              </div>
            </>
          )}
        </ProgressRing>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          {isEmpty ? (
            <span className="font-medium">Fresh week — nothing logged yet 🎉</span>
          ) : (
            <>
              Spent{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatMoney(spent, symbol)}
              </span>{" "}
              of {formatMoney(allowance, symbol)}
              {!isOver && ` · ${Math.round(pct * 100)}% used`}
            </>
          )}
        </p>
      </div>

      {/* This week's budget + adjust */}
      <div className="mb-4 flex items-center justify-between rounded-2xl bg-white dark:bg-neutral-800 px-4 py-3 shadow-sm">
        <div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            This week's budget {hasOverride && <span className="text-matcha">· adjusted</span>}
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
            {formatMoney(allowance, symbol)}
          </div>
        </div>
        <button
          onClick={() => {
            setDraft((allowance / 100).toString());
            setAdjustOpen(true);
          }}
          className="rounded-xl bg-matcha/10 px-4 py-2 text-sm font-semibold text-matcha active:scale-95"
        >
          Adjust
        </button>
      </div>

      {isEmpty ? (
        <div className="mb-6 rounded-2xl bg-white dark:bg-neutral-800 p-6 text-center shadow-sm">
          <p className="text-gray-600 dark:text-gray-300">
            Log your first expense to see where your allowance goes.
          </p>
          <button
            onClick={onAdd}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-matcha px-5 py-3 font-semibold text-white active:scale-95 transition"
          >
            <PlusIcon size={20} /> Add an expense
          </button>
        </div>
      ) : (
        <div className="mb-6">
          <CategoryBreakdown breakdown={breakdown} symbol={symbol} />
        </div>
      )}

      {/* Historical tracking */}
      <section className="rounded-2xl bg-white dark:bg-neutral-800 p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Spending over time
          </h2>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {formatMoney(rangeTotal, symbol)} total
          </span>
        </div>

        <div className="mb-4 flex gap-1 rounded-xl bg-gray-100 dark:bg-white/5 p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setMode(r.key)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                mode === r.key
                  ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <HistoryChart data={history} symbol={symbol} />

        <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-matcha" /> within budget
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-over" /> over budget
          </span>
        </div>
      </section>

      {adjustOpen && (
        <Modal title="Adjust this week's budget" onClose={() => setAdjustOpen(false)}>
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
            Set a one-off allowance for the current week (your allowance isn't always the same). Other
            weeks keep the default of {formatMoney(settings.weeklyAllowance, symbol)}.
          </p>
          <div className="flex items-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-neutral-900 px-3">
            <span className="text-gray-400">{symbol}</span>
            <input
              autoFocus
              type="text"
              inputMode="decimal"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full bg-transparent px-2 py-3 text-right text-lg font-semibold text-gray-900 dark:text-white focus:outline-none tabular-nums"
            />
          </div>
          <div className="mt-4 space-y-2">
            <button
              onClick={() => {
                onSetWeekAllowance(curKey, parseAmount(draft));
                setAdjustOpen(false);
              }}
              className="w-full rounded-2xl bg-matcha py-3.5 text-base font-semibold text-white active:scale-[0.99]"
            >
              Save this week's budget
            </button>
            {hasOverride && (
              <button
                onClick={() => {
                  onSetWeekAllowance(curKey, null);
                  setAdjustOpen(false);
                }}
                className="w-full rounded-2xl py-3 text-base font-medium text-gray-500 dark:text-gray-400"
              >
                Reset to default
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
