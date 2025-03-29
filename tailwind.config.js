/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Additional colors can be defined here
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(-10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.custom-scrollbar': {
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(17, 24, 39, 0.8)', // gray-900 with opacity
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(55, 65, 81, 0.8)', // gray-700 with opacity
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(75, 85, 99, 0.8)', // gray-600 with opacity
          },
          'scrollbarWidth': 'thin',
          'scrollbarColor': 'rgba(55, 65, 81, 0.8) rgba(17, 24, 39, 0.8)',
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
} 