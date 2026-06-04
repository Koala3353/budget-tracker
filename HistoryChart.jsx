import { formatMoney } from "./budget.js";

/**
 * Lightweight responsive bar chart (pure divs, no chart lib).
 * `data` = { buckets: [{label, spent, allowance?, over?}], refLine?, refLabel? }
 * Over-budget bars render red; an optional dashed reference line marks a target.
 */
export default function HistoryChart({ data, symbol }) {
  const { buckets, refLine, refLabel } = data;
  const H = 160;
  const max = Math.max(
    1,
    ...buckets.map((b) => Math.max(b.spent, b.allowance || 0)),
    refLine || 0
  );
  // Thin out x-labels when there are many bars.
  const step = buckets.length > 8 ? Math.ceil(buckets.length / 8) : 1;

  return (
    <div>
      <div className="relative" style={{ height: H }}>
        {refLine != null && (
          <div
            className="absolute left-0 right-0 flex items-center"
            style={{ bottom: (refLine / max) * H }}
          >
            <div className="h-px flex-1 border-t border-dashed border-gray-400/70" />
            {refLabel && (
              <span className="ml-1 text-[9px] text-gray-400 whitespace-nowrap">
                {refLabel}
              </span>
            )}
          </div>
        )}
        <div className="flex h-full items-end gap-1">
          {buckets.map((b, i) => (
            <div
              key={i}
              className="flex h-full flex-1 flex-col justify-end items-center"
              title={`${b.label}: ${formatMoney(b.spent, symbol)}${
                b.allowance != null ? ` of ${formatMoney(b.allowance, symbol)}` : ""
              }`}
            >
              <div
                className="w-full rounded-t"
                style={{
                  height: Math.max((b.spent / max) * H, b.spent > 0 ? 3 : 0),
                  backgroundColor: b.over ? "#E5484D" : "#5B8C5A",
                  transition: "height .4s ease",
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-1 flex gap-1">
        {buckets.map((b, i) => (
          <div
            key={i}
            className="flex-1 truncate text-center text-[10px] text-gray-400"
          >
            {i % step === 0 ? b.label : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
