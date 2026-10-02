/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          900: '#7c2d12',
        },
        primary: {
          DEFAULT: '#ea580c', // Warm vibrant catering orange
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#0f766e', // Fresh deep teal
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#dc2626',
          foreground: '#ffffff',
        },
        success: {
          DEFAULT: '#16a34a',
          foreground: '#ffffff',
        },
      },
      fontSize: {
        'touch-sm': '1rem',      // 16px
        'touch-base': '1.125rem', // 18px (Ramah Bu Dina)
        'touch-lg': '1.25rem',   // 20px
        'touch-xl': '1.5rem',    // 24px
        'touch-2xl': '1.875rem', // 30px
      },
      minHeight: {
        'touch': '48px',
        'touch-lg': '56px',
      },
    },
  },
  plugins: [],
}
