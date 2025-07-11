/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'pastel-gradient': 'linear-gradient(135deg, #f9d0f5 0%, #f1bbed 25%, #e4aae4 50%, #d6a1e1 75%, #b190dc 100%)',
      },
      animation: {
        'gradient-x': 'gradientX 6s ease infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
      },
      keyframes: {
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
};