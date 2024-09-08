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
        nav: "#FDD4AC",
        main1: "#d8b4fe",
        main2: "#e9d5ff",
        main3: "#c084fc",
        secondary: "#ACFDD4",
        secondary2: "#66CC95",
      },
    },
  },
  plugins: [],
} satisfies Config;
