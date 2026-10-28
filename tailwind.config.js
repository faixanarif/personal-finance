/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#09090b',
        card: {
          DEFAULT: '#121215',
          hover: '#16161b',
          border: '#27272a',
          borderHover: '#3f3f46',
        },
        textPrimary: '#ffffff',
        muted: {
          DEFAULT: '#a1a1aa',
          dark: '#71717a',
          light: '#d4d4d8',
        },
        credit: {
          DEFAULT: '#10b981',
          light: '#34d399',
          glow: 'rgba(16, 185, 129, 0.15)',
        },
        debit: {
          DEFAULT: '#f43f5e',
          light: '#fb7185',
          glow: 'rgba(244, 63, 94, 0.15)',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.2)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.2)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
