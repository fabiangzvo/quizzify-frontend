import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-poppins)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        shadow: "var(--shadow)",
        text: "var(--text)",
        accent: "var(--accent)",
        paragraph: "var(--paragraph)",
      },
    },
  },
  plugins: [
    heroui({
      defaultTheme: "light",
      defaultExtendTheme: "light",
      themes: {
        light: {
          colors: {
            background: "#FAFAFC",
            foreground: "#18181B",
            divider: "#E4E4E7",
            focus: "#FF653F",
            content1: {
              DEFAULT: "#FFFFFF",
              foreground: "#18181B",
            },
            content2: {
              DEFAULT: "#F4F4F5",
              foreground: "#27272A",
            },
            content3: {
              DEFAULT: "#E4E4E7",
              foreground: "#3F3F46",
            },
            content4: {
              DEFAULT: "#D4D4D8",
              foreground: "#52525B",
            },
            primary: {
              50: "#FFF2EE",
              100: "#FFE1D8",
              200: "#FFC0AE",
              300: "#FF9B7F",
              400: "#FF7F5C",
              500: "#FF653F",
              600: "#E54722",
              700: "#C23514",
              800: "#9B270D",
              900: "#751C08",
              DEFAULT: "#FF653F",
              foreground: "#FFFFFF",
            },
            secondary: {
              DEFAULT: "#FF8A6B",
              foreground: "#18181B",
            },
            danger: {
              DEFAULT: "#E11D48",
              foreground: "#FFFFFF",
            },
          },
        },
        dark: {
          colors: {
            background: "#0B0A10",
            foreground: "#F4F4F5",
            divider: "#27272A",
            focus: "#FF7F5C",
            content1: {
              DEFAULT: "#14121D",
              foreground: "#F4F4F5",
            },
            content2: {
              DEFAULT: "#1E1B2B",
              foreground: "#E4E4E7",
            },
            content3: {
              DEFAULT: "#272438",
              foreground: "#D4D4D8",
            },
            content4: {
              DEFAULT: "#322E47",
              foreground: "#A1A1AA",
            },
            primary: {
              50: "#33120A",
              100: "#4D190C",
              200: "#752512",
              300: "#A33519",
              400: "#D64926",
              500: "#FF653F",
              600: "#FF8769",
              700: "#FFA68F",
              800: "#FFC8B8",
              900: "#FFE8E1",
              DEFAULT: "#FF653F",
              foreground: "#18181B",
            },
            secondary: {
              DEFAULT: "#D64926",
              foreground: "#FFFFFF",
            },
            danger: {
              DEFAULT: "#F43F5E",
              foreground: "#FFFFFF",
            },
          },
        },
      },
    }),
  ],
};

export default config;
