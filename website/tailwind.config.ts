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
          "Plus Jakarta Sans",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        display: [
          "Plus Jakarta Sans",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      colors: {
        // Anthropic warm palette — kept identical to before so the rest of the
        // site keeps working. ShipAny-style typography on top.
        clay: {
          50: "#FBF8F4",
          100: "#F5F2EB",
          200: "#EDE8DD",
          300: "#DDD5C3",
          400: "#C4B79E",
          500: "#A89A7E",
          600: "#7A6F5A",
          700: "#544E3F",
          800: "#33302A",
          900: "#1F1D19",
        },
        ember: {
          50: "#FDF4EE",
          100: "#FAE5D5",
          200: "#F4C5A5",
          300: "#EDA378",
          400: "#E58656",
          500: "#D97757",
          600: "#BF5C3E",
          700: "#9B4830",
          800: "#723325",
          900: "#4A2018",
        },
        ink: {
          50: "#FBF8F4",
          100: "#F5F2EB",
          200: "#EDE8DD",
          300: "#DDD5C3",
          400: "#A89A7E",
          500: "#7A6F5A",
          600: "#544E3F",
          700: "#33302A",
          800: "#1F1D19",
          900: "#1F1D19",
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.8s cubic-bezier(0.22,1,0.36,1) backwards",
        "gradient-marquee": "gradient-marquee 6s linear infinite",
        "soft-aura": "soft-aura 6s ease-in-out infinite",
      },
      keyframes: {
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(16px)",
            filter: "blur(6px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
            filter: "blur(0)",
          },
        },
        "gradient-marquee": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        "soft-aura": {
          "0%, 100%": {
            filter:
              "drop-shadow(0 0 22px rgba(217,119,87,0.35)) drop-shadow(0 0 48px rgba(237,163,120,0.18))",
          },
          "50%": {
            filter:
              "drop-shadow(0 0 26px rgba(217,119,87,0.45)) drop-shadow(0 0 56px rgba(237,163,120,0.24))",
          },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    "bg-ember-50", "text-ember-700", "border-ember-200", "ring-ember-200", "bg-ember-500",
    "bg-clay-50", "text-clay-700", "border-clay-200", "ring-clay-200", "bg-clay-500",
    "bg-indigo-50", "text-indigo-700", "border-indigo-200", "ring-indigo-200", "bg-indigo-500",
    "bg-emerald-50", "text-emerald-700", "border-emerald-200", "ring-emerald-200", "bg-emerald-500",
    "bg-amber-50", "text-amber-700", "border-amber-200", "ring-amber-200", "bg-amber-500",
    "bg-rose-50", "text-rose-700", "border-rose-200", "ring-rose-200", "bg-rose-500",
    "bg-sky-50", "text-sky-700", "border-sky-200", "ring-sky-200", "bg-sky-500",
  ],
};

export default config;
