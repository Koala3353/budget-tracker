import {
  computeTotals,
  computeCategoryBreakdown,
  formatMoney,
} from "./budget.js";
import ProgressRing from "./ProgressRing.jsx";
import CategoryBreakdown from "./CategoryBreakdown.jsx";
import { PlusIcon } from "./icons.jsx";

const WEEK_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Dashboard / overview. Handles safe, near-limit, over-budget, and empty states. */
export default function Dashboard({ categories, transactions, settings, onAdd }) {
  const symbol = settings.currencySymbol;
  const totals = computeTotals(transactions, settings.weeklyAllowance);
  const breakdown = computeCategoryBreakdown(transactions, categories);
  const { spent, allowance, remaining, pct, isOver } = totals;
  const isEmpty = transactions.length === 0;
  const pctSpent = Math.round(pct * 100);

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
              {!isOver && ` · ${pctSpent}% used`}
            </>
          )}
        </p>
      </div>

      {isEmpty ? (
        <div className="rounded-2xl bg-white dark:bg-neutral-800 p-6 text-center shadow-sm">
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
        <CategoryBreakdown breakdown={breakdown} symbol={symbol} />
      )}
    </div>
  );
}
