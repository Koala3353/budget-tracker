import { useEffect, useState } from "react";
import QuickAdd from "./QuickAdd.jsx";
import Dashboard from "./Dashboard.jsx";
import History from "./History.jsx";
import Settings from "./Settings.jsx";
import BottomNav from "./BottomNav.jsx";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SETTINGS,
  SEED_TRANSACTIONS,
} from "./seed.js";

const STORAGE_KEY = "weekly-budget.v1";

/**
 * Root component. Strictly client-side — no router lib, no backend.
 *
 * The app OPENS on the Quick-Add ("add") screen per the product spec; the
 * Dashboard is reachable from the banner/button on that screen and the nav.
 *
 * Data flow: state is seeded with dummy data so the OVER-BUDGET dashboard shows
 * immediately. The localStorage load/save is wired up below (commented where it
 * would replace the seed). Reads are guarded so it still runs if storage is off.
 */
export default function App() {
  const [view, setView] = useState("add"); // <- home screen is Add Log
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [transactions, setTransactions] = useState(SEED_TRANSACTIONS);

  // --- localStorage hydration (optional). Currently we keep the dummy seed so
  // --- the over-budget state is visible. To persist real data, uncomment:
  // useEffect(() => {
  //   try {
  //     const raw = localStorage.getItem(STORAGE_KEY);
  //     if (raw) {
  //       const s = JSON.parse(raw);
  //       setCategories(s.categories ?? DEFAULT_CATEGORIES);
  //       setSettings(s.settings ?? DEFAULT_SETTINGS);
  //       setTransactions(s.transactions ?? []);
  //     }
  //   } catch { /* corrupt JSON -> keep defaults */ }
  // }, []);

  // Persist on change (no-op safe if storage unavailable).
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 1, categories, settings, transactions })
      );
    } catch {
      /* private mode / quota -> stay in-memory */
    }
  }, [categories, settings, transactions]);

  function addTransaction({ amount, categoryId, note }) {
    const tx = {
      id: "t_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      amount,
      categoryId,
      note,
      ts: Date.now(),
    };
    setTransactions((prev) => [tx, ...prev]);
    setView("dashboard"); // jump to dashboard so the user sees the impact
  }

  function deleteTransaction(tx) {
    setTransactions((prev) => prev.filter((t) => t.id !== tx.id));
  }

  function editTransaction(tx) {
    // Demo stub: a real edit would open a pre-filled Quick-Add. For now we just
    // route to the Add screen.
    setView("add");
  }

  function updateSettings(patch) {
    setSettings((prev) => ({ ...prev, ...patch }));
  }

  function exportData() {
    try {
      const blob = new Blob(
        [JSON.stringify({ version: 1, categories, settings, transactions }, null, 2)],
        { type: "application/json" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "weekly-budget-backup.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  }

  function importData() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const s = JSON.parse(reader.result);
          if (s.categories) setCategories(s.categories);
          if (s.settings) setSettings(s.settings);
          if (Array.isArray(s.transactions)) setTransactions(s.transactions);
        } catch {
          /* invalid file -> ignore */
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  return (
    <div className="min-h-full bg-gray-50 text-gray-900 dark:bg-neutral-900 dark:text-white">
      {/* App shell: centered mobile column, padding reserved for the bottom nav */}
      <div className="mx-auto flex min-h-screen max-w-md flex-col pb-24">
        {view === "add" && (
          <QuickAdd
            categories={categories}
            transactions={transactions}
            settings={settings}
            onAdd={addTransaction}
            onGoDashboard={() => setView("dashboard")}
          />
        )}
        {view === "dashboard" && (
          <Dashboard
            categories={categories}
            transactions={transactions}
            settings={settings}
            onAdd={() => setView("add")}
          />
        )}
        {view === "history" && (
          <History
            categories={categories}
            transactions={transactions}
            settings={settings}
            onEdit={editTransaction}
            onDelete={deleteTransaction}
          />
        )}
        {view === "settings" && (
          <Settings
            categories={categories}
            settings={settings}
            onUpdateSettings={updateSettings}
            onExport={exportData}
            onImport={importData}
          />
        )}
      </div>

      <BottomNav view={view} onChange={setView} />
    </div>
  );
}
