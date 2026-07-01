/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm, deep restaurant red (primary) — less "fire-engine", more appetizing
        brand: {
          50: '#fdf4f2',
          100: '#fbe5e1',
          200: '#f6cec7',
          300: '#eca89d',
          400: '#df7a6c',
          500: '#cf5344',
          600: '#b83a2e',
          700: '#9a2c23',
          800: '#7f2620',
          900: '#6b231f',
        },
        // Gold (accent)
        gold: {
          300: '#fcd34d',
          400: '#facc15',
          500: '#ca8a04',
          600: '#a16207',
          700: '#854d0e',
        },
        // Warm ivory backgrounds
        cream: {
          50: '#fdf8f5',
          100: '#f9efe8',
          200: '#f1e1d6',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};
