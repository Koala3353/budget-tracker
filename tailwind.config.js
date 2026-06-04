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
