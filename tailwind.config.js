/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4F6EF7',
          light: '#7A9DF5',
          dark: '#3A63D9',
        },
        primary: '#4F6EF7',
        secondary: '#1E293B', // A clean dark slate for secondary elements
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
