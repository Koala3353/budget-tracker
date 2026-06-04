import { formatMoney } from "./budget.js";

/** Ranked horizontal bars showing where the money went, top category surfaced. */
export default function CategoryBreakdown({ breakdown, symbol }) {
  const { rows, top } = breakdown;

  if (rows.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-800 p-4 shadow-sm">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Where it went
        </h2>
        {top && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Most spent: {top.icon} {top.name}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.categoryId}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                {r.icon} {r.name}
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                {formatMoney(r.amount, symbol)}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(r.pct * 100, 4)}%`,
                  backgroundColor: r.color,
                  transition: "width 500ms ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
