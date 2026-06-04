import { useEffect, useState } from "react";
import QuickAdd from "./QuickAdd.jsx";
import Dashboard from "./Dashboard.jsx";
import History from "./History.jsx";
import Settings from "./Settings.jsx";
import BottomNav from "./BottomNav.jsx";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SETTINGS,
  DEFAULT_WEEK_OVERRIDES,
  SEED_TRANSACTIONS,
} from "./seed.js";

const STORAGE_KEY = "weekly-budget.v1";

/**
 * Root component. Strictly client-side — no router lib, no backend.
 * Opens on Quick-Add ("add"); Dashboard reachable from its banner/button + nav.
 *
 * State is seeded with ~1 year of dummy data so the charts and the over-budget
 * dashboard show immediately. All changes persist to localStorage (guarded).
 */
export default function App() {
  const [view, setView] = useState("add");
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [transactions, setTransactions] = useState(SEED_TRANSACTIONS);
  const [weekOverrides, setWeekOverrides] = useState(DEFAULT_WEEK_OVERRIDES);

  // To persist real user data across reloads instead of always re-seeding,
  // uncomment this hydration block:
  // useEffect(() => {
  //   try {
  //     const raw = localStorage.getItem(STORAGE_KEY);
  //     if (raw) {
  //       const s = JSON.parse(raw);
  //       setCategories(s.categories ?? DEFAULT_CATEGORIES);
  //       setSettings(s.settings ?? DEFAULT_SETTINGS);
  //       setTransactions(s.transactions ?? []);
  //       setWeekOverrides(s.weekOverrides ?? {});
  //     }
  //   } catch {}
  // }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 2, categories, settings, transactions, weekOverrides })
      );
    } catch {
      /* private mode / quota -> stay in-memory */
    }
  }, [categories, settings, transactions, weekOverrides]);

  // --- Transactions ---
  function addTransaction({ amount, categoryId, note }) {
    const tx = {
      id: "t_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      amount,
      categoryId,
      note,
      ts: Date.now(),
    };
    setTransactions((prev) => [tx, ...prev]);
    setView("dashboard");
  }
  function deleteTransaction(tx) {
    setTransactions((prev) => prev.filter((t) => t.id !== tx.id));
  }
  function editTransaction() {
    setView("add");
  }

  // --- Categories (working CRUD) ---
  function addCategory({ name, icon, color }) {
    const id = "c_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    setCategories((prev) => [...prev, { id, name, icon, color }]);
  }
  function editCategory(id, { name, icon, color }) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name, icon, color } : c)));
  }
  function deleteCategory(id) {
    setCategories((prev) => {
      if (prev.length <= 1) return prev; // never delete the last category
      const remaining = prev.filter((c) => c.id !== id);
      // Reassign any transactions from the deleted category to the first remaining one.
      const fallback = remaining[0].id;
      setTransactions((txs) =>
        txs.map((t) => (t.categoryId === id ? { ...t, categoryId: fallback } : t))
      );
      return remaining;
    });
  }

  // --- Settings & per-week budget ---
  function updateSettings(patch) {
    setSettings((prev) => ({ ...prev, ...patch }));
  }
  function setWeekAllowance(key, cents) {
    setWeekOverrides((prev) => {
      const next = { ...prev };
      if (cents == null) delete next[key];
      else next[key] = cents;
      return next;
    });
  }

  // --- Backups ---
  function exportData() {
    try {
      const blob = new Blob(
        [JSON.stringify({ version: 2, categories, settings, transactions, weekOverrides }, null, 2)],
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
          if (s.weekOverrides) setWeekOverrides(s.weekOverrides);
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
      <div className="mx-auto flex min-h-screen max-w-md flex-col pb-24">
        {view === "add" && (
          <QuickAdd
            categories={categories}
            transactions={transactions}
            settings={settings}
            weekOverrides={weekOverrides}
            onAdd={addTransaction}
            onGoDashboard={() => setView("dashboard")}
          />
        )}
        {view === "dashboard" && (
          <Dashboard
            categories={categories}
            transactions={transactions}
            settings={settings}
            weekOverrides={weekOverrides}
            onSetWeekAllowance={setWeekAllowance}
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
            onAddCategory={addCategory}
            onEditCategory={editCategory}
            onDeleteCategory={deleteCategory}
            onExport={exportData}
            onImport={importData}
          />
        )}
      </div>

      <BottomNav view={view} onChange={setView} />
    </div>
  );
}
