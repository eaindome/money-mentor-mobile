/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/screens/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          light: "#50C878", // Achieve's emerald-light shade
          DEFAULT: "#008000", // Achieve's main emerald
          dark: "#006400", // Darker variant if needed
        },
      },
    },
  },
  plugins: [],
};