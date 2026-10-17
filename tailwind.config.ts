import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bw: {
          bg: {
            light: "#ffffff",
            dark: "#000000",
          },
          surface: {
            light: "#fafafa",
            dark: "#0a0a0a",
          },
          elevated: {
            light: "#f4f4f5",
            dark: "#121212",
          },
          border: {
            light: "#e4e4e7",
            dark: "#27272a",
          },
          text: {
            primary: {
              light: "#09090b",
              dark: "#fafafa",
            },
            secondary: {
              light: "#52525b",
              dark: "#a1a1aa",
            },
            muted: {
              light: "#71717a",
              dark: "#71717a",
            },
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
