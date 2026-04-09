/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#22c55e',
        'brand-dark': '#16a34a',
        surface: {
          0: '#0a0a0a',
          1: '#1a1a1a',
          2: '#2a2a2a',
        },
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
