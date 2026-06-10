/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./*.{js,jsx}"],
  darkMode: "media", // follows the device's light/dark setting automatically
  theme: {
    extend: {
      colors: {
        matcha: {
          DEFAULT: "#5B8C5A",
          dark: "#4A7349",
          light: "#7BA87A",
        },
        over: "#E5484D", // tomato / over-budget red
        caution: "#F5A623", // amber / nearing limit
        // budge· theme: green-tinted neutral ramp so the whole app feels
        // on-brand (instead of pure gray). Existing gray-* classes adopt it.
        gray: {
          50: "#F4F7F2", // near-white: light page bg / dark primary text
          100: "#EAEFE7", // light track + toggle bg
          200: "#E4EAE0", // light border / disabled fill
          300: "#CBD6C6", // light stronger border
          400: "#8FA194", // muted (reads in both modes)
          500: "#5E6E63", // light muted text
          600: "#4A5A4F", // light body text
          700: "#2E3B33", // dark input border
          800: "#243029", // dark border / raised surface
          900: "#15241B", // light primary text / dark card
          950: "#0A0F0C", // dark page bg
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "San Francisco",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
