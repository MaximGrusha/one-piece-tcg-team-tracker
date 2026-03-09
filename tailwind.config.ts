import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          900: "#020817",
          800: "#020c1f",
          700: "#07111f"
        },
        gold: {
          500: "#fbbf24",
          400: "#facc6b"
        },
        crimson: "#b91c1c",
        parchment: "#fef3c7"
      },
      fontFamily: {
        display: ["\"Pirata One\"", "system-ui", "sans-serif"],
        body: ["\"Libre Baskerville\"", "Georgia", "serif"]
      },
      boxShadow: {
        "card-glow": "0 0 40px rgba(251, 191, 36, 0.2)"
      }
    }
  },
  plugins: []
};

export default config;

