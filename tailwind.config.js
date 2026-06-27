/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F3E5AB',
          dark: '#b8920e',
        },
        midnight: '#0B0C10',
        charcoal: '#1F2833',
        mystic: '#4B0082',
      },
    },
  },
  plugins: [],
};
