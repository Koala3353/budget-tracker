import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" makes all asset paths relative, so the built app works on
// GitHub Pages project sites (e.g. /budget-tracker/) without hardcoding the repo name.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
