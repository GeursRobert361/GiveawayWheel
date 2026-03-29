import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#050816"
        },
        brand: {
          50: "#d8f8ff",
          100: "#afefff",
          200: "#7be5ff",
          300: "#47d7ff",
          400: "#1ac0f5",
          500: "#10a4d8",
          600: "#137fb0",
          700: "#16658d",
          800: "#184f70",
          900: "#173f59"
        },
        accent: {
          coral: "#ff725e",
          lime: "#c5ff55",
          gold: "#ffcc4d"
        }
      },
      boxShadow: {
        soft: "0 24px 80px rgba(0, 0, 0, 0.4)",
        "soft-lg": "0 32px 100px rgba(0, 0, 0, 0.5)"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "Inter", "sans-serif"]
      }
    }
  },
  darkMode: "class",
  plugins: []
} satisfies Config;
