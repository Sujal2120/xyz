/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Custom color system that works with CSS variables
        primary: {
          50: 'rgb(var(--color-primary-light) / <alpha-value>)',
          500: 'rgb(var(--color-primary) / <alpha-value>)',
          600: 'rgb(var(--color-primary-hover) / <alpha-value>)',
        },
        gray: {
          50: 'rgb(var(--bg-secondary) / <alpha-value>)',
          100: 'rgb(var(--bg-tertiary) / <alpha-value>)',
          200: 'rgb(var(--border-primary) / <alpha-value>)',
          300: 'rgb(var(--border-secondary) / <alpha-value>)',
          600: 'rgb(var(--text-secondary) / <alpha-value>)',
          700: 'rgb(var(--text-primary) / <alpha-value>)',
          900: 'rgb(var(--text-primary) / <alpha-value>)',
        }
      },
      backgroundColor: {
        'theme-primary': 'var(--bg-primary)',
        'theme-secondary': 'var(--bg-secondary)',
        'theme-tertiary': 'var(--bg-tertiary)',
      },
      textColor: {
        'theme-primary': 'var(--text-primary)',
        'theme-secondary': 'var(--text-secondary)',
        'theme-tertiary': 'var(--text-tertiary)',
      },
      borderColor: {
        'theme-primary': 'var(--border-primary)',
        'theme-secondary': 'var(--border-secondary)',
      },
      boxShadow: {
        'theme-sm': 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
        'theme-lg': 'var(--shadow-lg)',
        'theme-xl': 'var(--shadow-xl)',
      }
    },
  },
  plugins: [],
};
