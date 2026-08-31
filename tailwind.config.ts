import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#0c0a10",
        foreground: "#f4f2f7",
        card: "#17141d",
        border: "#2c2733",
        primary: {
          DEFAULT: "#9b5cf0",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#3ee6e0",
          foreground: "#04201f",
        },
        muted: {
          DEFAULT: "#1e1a26",
          foreground: "#a89fb5",
        },
        destructive: "#e5484d",
      },
      fontFamily: {
        display: ["var(--font-anton)", "Impact", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-chrome":
          "linear-gradient(170deg,#f4f2f7 0%,#b9b0c6 22%,#5c5468 46%,#e4defb 62%,#7a7189 82%,#cfc7de 100%)",
        "gradient-purple":
          "linear-gradient(170deg,#dcb8ff 0%,#9b5cf0 35%,#5b2ea6 70%,#b877f2 100%)",
        "gradient-edge":
          "linear-gradient(100deg,#9b5cf0,#3ee6e0,#9b5cf0)",
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(155,92,240,0.55)",
        cyan: "0 0 32px -6px rgba(62,230,224,0.6)",
      },
      keyframes: {
        "edge-pan": { to: { backgroundPosition: "220% 0" } },
        shimmer: { to: { backgroundPosition: "250% 0" } },
        "pulse-glow": {
          "0%,100%": { filter: "drop-shadow(0 0 10px rgba(155,92,240,0.45))" },
          "50%": { filter: "drop-shadow(0 0 26px rgba(62,230,224,0.55))" },
        },
      },
      animation: {
        "edge-pan": "edge-pan 6s linear infinite",
        shimmer: "shimmer 5s linear infinite",
        "pulse-glow": "pulse-glow 3.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
