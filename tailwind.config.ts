import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/components/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/app/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        primary: "#1E3A8A",
        accent: "#10B981",
        background: "#F8FAFC",
      },
      borderRadius: {
        xl: "var(--radius)",
        "2xl": "calc(var(--radius) + 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
