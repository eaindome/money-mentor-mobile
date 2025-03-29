/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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


