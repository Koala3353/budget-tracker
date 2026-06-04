import { useState } from "react";
import { formatMoney, formatTime, dayLabel } from "./budget.js";
import EditSheet from "./EditSheet.jsx";

/** Group transactions (sorted newest first) into day buckets keyed by label. */
function groupByDay(transactions) {
  const sorted = [...transactions].sort((a, b) => b.ts - a.ts);
  const groups = [];
  let current = null;
  for (const t of sorted) {
    const label = dayLabel(t.ts);
    if (!current || current.label !== label) {
      current = { label, items: [] };
      groups.push(current);
    }
    current.items.push(t);
  }
  return groups;
}

export default function History({ categories, transactions, settings, onEdit, onDelete }) {
  const symbol = settings.currencySymbol;
  const [selected, setSelected] = useState(null);
  const catById = (id) => categories.find((c) => c.id === id);
  const groups = groupByDay(transactions);

  return (
    <div className="px-4 pt-5 pb-4">
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">History</h1>

      {transactions.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-neutral-800 p-8 text-center text-gray-500 dark:text-gray-400 shadow-sm">
          No transactions yet. Logged expenses will appear here.
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g.label}>
              <h2 className="mb-2 px-1 text-sm font-semibold text-gray-500 dark:text-gray-400">
                {g.label}
              </h2>
              <div className="overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 shadow-sm divide-y divide-gray-100 dark:divide-white/5">
                {g.items.map((t) => {
                  const c = catById(t.categoryId);
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelected(t)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-gray-50 dark:active:bg-neutral-700/50 transition"
                    >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl"
                        style={{ backgroundColor: (c?.color || "#888") + "22" }}
                      >
                        {c?.icon || "❔"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {c?.name || "Uncategorized"}
                        </div>
                        {t.note && (
                          <div className="truncate text-sm text-gray-500 dark:text-gray-400">
                            {t.note}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-white tabular-nums">
                          -{formatMoney(t.amount, symbol)}
                        </div>
                        <div className="text-xs text-gray-400">{formatTime(t.ts)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <EditSheet
        tx={selected}
        category={selected ? catById(selected.categoryId) : null}
        symbol={symbol}
        onClose={() => setSelected(null)}
        onEdit={(tx) => {
          onEdit?.(tx);
          setSelected(null);
        }}
        onDelete={(tx) => {
          onDelete?.(tx);
          setSelected(null);
        }}
      />
    </div>
  );
}
