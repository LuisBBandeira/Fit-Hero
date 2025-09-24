import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        'mono': ['var(--font-monofonto)', 'Courier New', 'monospace'],
      },
      animation: {
        'terminal-blink': 'terminal-blink 1s infinite',
        'glitch': 'glitch 0.3s',
        'matrix-scroll': 'matrix-scroll 20s linear infinite',
      },
    },
  },
  plugins: [require("daisyui")],
};
export default config;
