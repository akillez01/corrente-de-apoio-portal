import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        bg: "#F2F5F0",
        ink: "#1E2A22",
        header: "#1B3A2D",
        border: "#DDE6DE",
        muted: "#5A6B60",
        primary: {
          DEFAULT: "#2F6B4F",
          light: "#5FA37E",
          dark: "#1B3A2D",
        },
        accent: "#D9A441",
        urgent: "#B0522D",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
