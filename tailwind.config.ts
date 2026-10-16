import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        gold: "rgb(var(--color-gold) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        journal: "rgb(var(--color-journal) / <alpha-value>)",
        elevated: "rgb(var(--color-elevated) / <alpha-value>)",
        "on-media": "rgb(var(--color-on-media) / <alpha-value>)",
      },
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        body: ["Jost", "sans-serif"],
        journalDisplay: ["Playfair Display", "serif"],
        journalBody: ["Space Grotesk", "sans-serif"],
      },
      letterSpacing: {
        nav: "1.5px",
        wide2: "2px",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        gold: "var(--glow-gold)",
      },
    },
  },
  plugins: [],
};

export default config;
