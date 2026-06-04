import { formatMoney, formatTime } from "./budget.js";

/**
 * Bottom-sheet modal shown when a History row is tapped.
 * Offers "Edit Transaction" and "Delete" actions.
 */
export default function EditSheet({ tx, category, symbol, onClose, onEdit, onDelete }) {
  if (!tx) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center">
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      {/* Sheet */}
      <div
        className="relative w-full max-w-md rounded-t-3xl bg-white dark:bg-neutral-800
                   p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl
                   animate-[slideUp_200ms_ease-out]"
        style={{}}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-300 dark:bg-white/20" />

        <div className="flex items-center gap-3 mb-5">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
            style={{ backgroundColor: (category?.color || "#888") + "22" }}
          >
            {category?.icon || "❔"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-gray-900 dark:text-white">
              {category?.name || "Uncategorized"}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {tx.note || "No note"} · {formatTime(tx.ts)}
            </div>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
            {formatMoney(tx.amount, symbol)}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onEdit(tx)}
            className="w-full rounded-2xl bg-matcha py-3.5 text-base font-semibold text-white active:scale-[0.99] transition"
          >
            Edit Transaction
          </button>
          <button
            onClick={() => onDelete(tx)}
            className="w-full rounded-2xl bg-over/10 py-3.5 text-base font-semibold text-over active:scale-[0.99] transition"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-2xl py-3 text-base font-medium text-gray-500 dark:text-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>

      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </div>
  );
}
