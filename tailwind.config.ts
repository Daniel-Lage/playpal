import { fontFamily } from "tailwindcss/defaultTheme";

import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      colors: {
        nav: "#acd4fd",
        main: { 1: "#d8b4fe", 2: "#e9d5ff", 3: "#c084fc" },
        secondary: { 1: "#acfdf0", 2: "#66cca1" },
        background: "#1f2937",
      },
    },
  },
  plugins: [],
} satisfies Config;
