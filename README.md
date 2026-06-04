# Weekly Budget PWA

Client-side React + Vite + Tailwind. No backend, no login — data lives in `localStorage`. Built to host statically on GitHub Pages.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
npm run preview  # preview the production build
```

## What's built

- **Home screen = Quick-Add (Add Log).** Opens straight to logging. Custom on-screen numpad, one-tap category chips, optional note, and a Save button disabled until an amount and category are chosen.
- **Dashboard button** below the Save button (and a tappable budget banner at the top) route to the Dashboard.
- **Dashboard** with a circular progress ring (green → amber ≥80% → red over budget) and a ranked category breakdown. Seeded with dummy data so the **over-budget** state (`-₱350 over`) shows on first load. Empty/fresh-week state is handled too — set `SEED_TRANSACTIONS = []` in `src/data/seed.js` to preview it.
- **History** grouped by day, with a slide-up Edit/Delete bottom sheet.
- **Settings** for allowance, week-start, currency, categories, and JSON export/import.
- Bottom tab bar with an emphasized centered Add button. Light + dark mode (follows the device).

## Deploy to GitHub Pages

`vite.config.js` uses `base: "./"` so asset paths are relative and work under a project subpath. Build, then publish `dist/` — e.g. with the `gh-pages` package, a GitHub Actions Pages workflow, or by pushing `dist/` to a `gh-pages` branch.

## Notes

- Money is stored as integer **centavos** to avoid float drift; formatted only at render.
- localStorage is per-device — no cloud sync. Use Settings → Export for backups.
