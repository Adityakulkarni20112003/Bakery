/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F9F5F0',
          100: '#F2EAD9',
          200: '#E6D5B4',
          300: '#D9C08F',
          400: '#CCAB6A',
          500: '#BF9645',
          600: '#8B5A2B', // Main primary
          700: '#6F4822',
          800: '#533619',
          900: '#37230F',
        },
        accent: {
          50: '#FFFBF0',
          100: '#FFF7E0',
          200: '#FFF0C2',
          300: '#FFE8A3',
          400: '#FFDF85',
          500: '#FFD666',
          600: '#D4AF37', // Main accent (gold)
          700: '#A68B2C',
          800: '#796721',
          900: '#4D4416',
        },
        cream: '#FFF8E1',
        crust: '#8B4513',
        chocolate: '#3B2314',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'Georgia', 'serif'],
        'sans': ['Nunito', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'bread-pattern': "url('https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260')",
      },
    },
  },
  plugins: [],
};