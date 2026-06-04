import { useState } from "react";
import { parseAmount } from "./budget.js";
import CategoryEditor from "./CategoryEditor.jsx";

const WEEK_DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
];

/** Settings: default weekly allowance, week start, currency, working category CRUD, backups. */
export default function Settings({
  categories,
  settings,
  onUpdateSettings,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onExport,
  onImport,
}) {
  const symbol = settings.currencySymbol;
  const [editing, setEditing] = useState(null); // category object, {} for add, or null

  return (
    <div className="px-4 pt-5 pb-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <Section title="Budget">
        <Field label="Default weekly allowance">
          <div className="flex items-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-neutral-800 px-3">
            <span className="text-gray-400">{symbol}</span>
            <input
              type="text"
              inputMode="decimal"
              defaultValue={(settings.weeklyAllowance / 100).toString()}
              onBlur={(e) => onUpdateSettings({ weeklyAllowance: parseAmount(e.target.value) })}
              className="w-full bg-transparent px-2 py-3 text-right font-semibold text-gray-900 dark:text-white focus:outline-none tabular-nums"
            />
          </div>
          <p className="mt-1 px-1 text-xs text-gray-400">
            Used for any week without its own override. Adjust a single week from the Dashboard.
          </p>
        </Field>

        <Field label="Week starts on">
          <select
            value={settings.weekStartDay}
            onChange={(e) => onUpdateSettings({ weekStartDay: Number(e.target.value) })}
            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-neutral-800 px-3 py-3 text-gray-900 dark:text-white focus:outline-none"
          >
            {WEEK_DAYS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Currency symbol">
          <input
            type="text"
            maxLength={3}
            defaultValue={settings.currencySymbol}
            onBlur={(e) => onUpdateSettings({ currencySymbol: e.target.value.trim() || "₱" })}
            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-neutral-800 px-3 py-3 text-gray-900 dark:text-white focus:outline-none"
          />
        </Field>
      </Section>

      <Section title="Categories">
        <div className="overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 shadow-sm divide-y divide-gray-100 dark:divide-white/5">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setEditing(c)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-gray-50 dark:active:bg-neutral-700/50"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
                style={{ backgroundColor: c.color + "22" }}
              >
                {c.icon}
              </span>
              <span className="flex-1 font-medium text-gray-900 dark:text-white">{c.name}</span>
              <span className="h-4 w-4 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-sm font-medium text-matcha">Edit</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setEditing({})}
          className="mt-3 w-full rounded-2xl border border-dashed border-gray-300 dark:border-white/15 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 active:scale-[0.99]"
        >
          + Add category
        </button>
      </Section>

      <Section title="Data">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onExport}
            className="rounded-2xl bg-white dark:bg-neutral-800 py-3.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm active:scale-[0.99]"
          >
            Export Data
          </button>
          <button
            onClick={onImport}
            className="rounded-2xl bg-white dark:bg-neutral-800 py-3.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm active:scale-[0.99]"
          >
            Import Data
          </button>
        </div>
        <p className="mt-2 px-1 text-xs text-gray-400">
          Backups download/read a JSON file. Your data lives only on this device.
        </p>
      </Section>

      {editing && (
        <CategoryEditor
          category={editing.id ? editing : null}
          canDelete={categories.length > 1}
          onSave={(payload) => {
            if (payload.id) onEditCategory(payload.id, payload);
            else onAddCategory(payload);
            setEditing(null);
          }}
          onDelete={(id) => {
            onDeleteCategory(id);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block px-1 text-sm text-gray-600 dark:text-gray-300">{label}</span>
      {children}
    </label>
  );
}
