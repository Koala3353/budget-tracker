import { parseAmount, formatMoney } from "./budget.js";

const WEEK_DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
];

/** Settings: weekly allowance, week start, currency, categories, and backups. */
export default function Settings({
  categories,
  settings,
  onUpdateSettings,
  onExport,
  onImport,
}) {
  const symbol = settings.currencySymbol;

  return (
    <div className="px-4 pt-5 pb-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      {/* Budget */}
      <Section title="Budget">
        <Field label="Weekly allowance">
          <div className="flex items-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-neutral-800 px-3">
            <span className="text-gray-400">{symbol}</span>
            <input
              type="text"
              inputMode="decimal"
              defaultValue={(settings.weeklyAllowance / 100).toString()}
              onBlur={(e) =>
                onUpdateSettings({ weeklyAllowance: parseAmount(e.target.value) })
              }
              className="w-full bg-transparent px-2 py-3 text-right font-semibold text-gray-900 dark:text-white focus:outline-none tabular-nums"
            />
          </div>
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
            onBlur={(e) =>
              onUpdateSettings({ currencySymbol: e.target.value.trim() || "₱" })
            }
            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-neutral-800 px-3 py-3 text-gray-900 dark:text-white focus:outline-none"
          />
        </Field>
      </Section>

      {/* Categories */}
      <Section title="Categories">
        <div className="overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 shadow-sm divide-y divide-gray-100 dark:divide-white/5">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
                style={{ backgroundColor: c.color + "22" }}
              >
                {c.icon}
              </span>
              <span className="flex-1 font-medium text-gray-900 dark:text-white">
                {c.name}
              </span>
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: c.color }}
                title={c.color}
              />
              <button className="text-sm font-medium text-matcha">Edit</button>
            </div>
          ))}
        </div>
        <button className="mt-3 w-full rounded-2xl border border-dashed border-gray-300 dark:border-white/15 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
          + Add category
        </button>
      </Section>

      {/* Data management */}
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
      <span className="mb-1 block px-1 text-sm text-gray-600 dark:text-gray-300">
        {label}
      </span>
      {children}
    </label>
  );
}
