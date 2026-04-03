/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#22c55e',
        'brand-dark': '#16a34a',
      },
    },
  },
  plugins: [],
}

