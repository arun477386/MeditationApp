/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#A26945',
        background: '#F4CCB4',
        surface: '#D3ACA0',
        textPrimary: '#342119',
        textSecondary: '#67544B',
        accent: '#69ACAC',
      },
      dark: {
        colors: {
          primary: '#B37A55',
          background: '#E4BCA4',
          surface: '#C39C90',
          textPrimary: '#F4E6E1',
          textSecondary: '#A89A94',
          accent: '#7BCBCB',
        },
      },
    },
  },
  plugins: [],
} 