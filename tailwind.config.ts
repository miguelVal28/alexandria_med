import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        muted: "var(--ink-muted)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        "border-default": "var(--border)",
        danger: "var(--danger)",
        warn: "var(--warn)",
        ok: "var(--ok)",
      },
      borderRadius: {
        themed: "var(--radius)",
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
        mono: "var(--font-mono)",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(45, 42, 38, 0.04), 0 8px 24px rgba(45, 42, 38, 0.06)",
        ring: "0 0 0 1px var(--border)",
      },
    },
  },
  plugins: [],
};

export default config;