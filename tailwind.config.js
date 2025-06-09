/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // GitHub风格的颜色
        github: {
          bg: "#0d1117",
          surface: "#161b22",
          border: "#30363d",
          text: "#f0f6fc",
          muted: "#8b949e",
          accent: "#58a6ff",
          success: "#3fb950",
          warning: "#d29922",
          danger: "#f85149",
        },
      },
      fontFamily: {
        mono: [
          "SFMono-Regular",
          "Consolas",
          "Liberation Mono",
          "Menlo",
          "monospace",
        ],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
  darkMode: "class",
};
