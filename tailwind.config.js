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
          dark: "#0f3a22",
          base: "#165330",
          stripe: "#1c633a",
          border: "#297a49",
          chalk: "#ffffff",
          muted: "#bbf7d0", // Much brighter readable mint for labels
        },
        match: {
          exact: "#15803d",
          exactBorder: "#4ade80",
          close: "#eab308",
          closeBorder: "#fef08a",
          wrong: "#112418",
          wrongBorder: "#2a4a37",
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
