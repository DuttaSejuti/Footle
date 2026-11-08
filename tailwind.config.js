/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        turf: {
          dark: "#0a2a16",
          base: "#0c331b",
          stripe: "#103e22",
          border: "#1d5231",
          chalk: "#f8fafc",
          muted: "#7ca88b",
        },
        match: {
          exact: "#16a34a",
          exactBorder: "#22c55e",
          close: "#eab308",
          closeBorder: "#fde047",
          wrong: "#14281d",
          wrongBorder: "#1e3b2c",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Inter", "sans-serif"],
        headline: ["Outfit", "-apple-system", "sans-serif"],
        mono: ["Space Grotesk", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
