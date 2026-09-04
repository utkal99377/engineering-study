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
        mono: {
          bg: '#050505',
          surface: '#0A0A0A',
          card: '#0F0F0F',
          cardHover: '#141414',
          border: '#1F1F1F',
          borderSubtle: '#181818',
          borderHover: '#333333',
          borderFocus: '#555555',
          text: '#FFFFFF',
          textSecondary: '#A0A0A0',
          textMuted: '#666666',
          track: '#1A1A1A',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
    },
  },
  plugins: [],
}
