import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        adressa: {
          deep: "#0F2E23",
          green: "#0E7C50",
          light: "#E7F2EC",
          gray: "#F4F6F5",
          ink: "#10231B"
        }
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  plugins: []
};

export default config;
