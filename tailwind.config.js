/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          dark: "#0b1319",
          card: "#121e28",
          cardHover: "#172735",
          border: "#1e3345",
          accent: "#10b981", // vibrant football pitch green
          accentHover: "#059669",
          gold: "#eab308",
          grass: "#16a34a",
        },
      },
    },
  },
  plugins: [],
};
