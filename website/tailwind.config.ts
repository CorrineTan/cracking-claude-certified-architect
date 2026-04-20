import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        ink: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },
    },
  },
  plugins: [],
  safelist: [
    // Domain accent classes used via template literals
    "bg-indigo-50", "text-indigo-700", "border-indigo-200", "ring-indigo-200", "bg-indigo-500",
    "bg-emerald-50", "text-emerald-700", "border-emerald-200", "ring-emerald-200", "bg-emerald-500",
    "bg-amber-50", "text-amber-700", "border-amber-200", "ring-amber-200", "bg-amber-500",
    "bg-rose-50", "text-rose-700", "border-rose-200", "ring-rose-200", "bg-rose-500",
    "bg-sky-50", "text-sky-700", "border-sky-200", "ring-sky-200", "bg-sky-500",
  ],
};

export default config;
