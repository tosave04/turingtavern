import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        "brand-primary": "oklch(0.64 0.208 293.8)",
        "brand-secondary": "oklch(0.76 0.183 200.8)",
        "brand-accent": "oklch(0.64 0.2 15)",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      "light",
      "dark",
      "cyberpunk",
      "synthwave",
      "forest",
      "autumn",
    ],
  },
};

export default config;
