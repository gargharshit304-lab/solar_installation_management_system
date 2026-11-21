/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#FDFCFB',
          100: '#F7F4EF',
          200: '#EFE8DE',
          DEFAULT: '#E9E0D2', // Primary App Background
          400: '#DECDBB',
          500: '#CFBAA2',
        },
        charcoal: {
          light: '#434852',
          DEFAULT: '#30343B', // Top Navbar & Main Text
          dark: '#212429',
        },
        navy: {
          light: '#254A7B',
          DEFAULT: '#183153', // Primary Buttons & Active Actions
          dark: '#0F2037',
        },
        warmGrey: {
          DEFAULT: '#D8D0C4', // Borders
          light: '#E6E0D7',
          dark: '#BDB3A5',
        },
        mutedGrey: {
          DEFAULT: '#777777', // Secondary Text
          light: '#9E9E9E',
          dark: '#555555',
        },
        sage: {
          light: '#8EAA98',
          DEFAULT: '#6F8F7A', // Success / Completed
          dark: '#526E5C',
          50: '#F2F6F3',
        },
        amber: {
          light: '#D9A464',
          DEFAULT: '#C48A42', // Pending / Warnings
          dark: '#9E6D31',
          50: '#FBF5EE',
        },
        terracotta: {
          light: '#CC776E',
          DEFAULT: '#B85C52', // Errors / Overdue / Critical
          dark: '#93433A',
          50: '#F9F1F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -1px rgba(24, 49, 83, 0.05), 0 1px 3px -1px rgba(24, 49, 83, 0.04)',
        'card-hover': '0 8px 20px -2px rgba(24, 49, 83, 0.09), 0 3px 6px -2px rgba(24, 49, 83, 0.05)',
        'dropdown': '0 10px 25px -5px rgba(24, 49, 83, 0.12), 0 8px 10px -6px rgba(24, 49, 83, 0.08)',
      },
      borderRadius: {
        'card': '14px',
      }
    },
  },
  plugins: [],
}
