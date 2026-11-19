/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 50: '#eef2ff', 100: '#dbe4ff', 200: '#b9c8f5', 500: '#2848a8', 600: '#1f3a91', 700: '#1a3080', 800: '#152768', 900: '#0f1d4f' },
        rose: { 50: '#fff1f6', 100: '#ffe0ec', 200: '#ffc2d9', 400: '#f2559a', 500: '#e5267a', 600: '#d01467', 700: '#ad0f55' },
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        script: ['"Dancing Script"', 'cursive'],
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(21, 39, 104, 0.18)',
        glow: '0 12px 40px -10px rgba(229, 38, 122, 0.45)',
      },
      backgroundImage: {
        brand: 'linear-gradient(135deg, #e5267a 0%, #2848a8 100%)',
      },
    },
  },
  plugins: [],
};
