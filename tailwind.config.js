/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        oled: "#000000",
        carbon: "#121212",
        titanium: "#1C1C1E",
        amber: "#FF9F0A",
        electricBlue: "#0A84FF",
        lime: "#32D74B",
        ducatiRed: "#FF453A",
      },
      fontFamily: {
        mono: ['monospace'], 
      }
    },
  },
  plugins: [],
}
