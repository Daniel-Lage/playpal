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
        blue: { 50: "#acd4fd", 100: "#4287f5" },
        nav: "#acd4fd",
        main: "#d8b4fe",
        main2: "#e9d5ff",
        main3: "#c084fc",
        secondary: "#acfdf0",
        secondary2: "#66cca1",
      },
    },
  },
  plugins: [],
} satisfies Config;
