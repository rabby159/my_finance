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
        dark: {
          bg: '#0f172a',      // Dark navy / charcoal background
          card: '#1e293b',    // Card background
          border: '#334155',  // Subtle borders
          text: '#f8fafc',    // Primary text
          muted: '#94a3b8',   // Secondary text
        },
        fintech: {
          green: '#10b981',   // Positive financial indicators
          red: '#ef4444',     // Expenses & warnings
          blue: '#3b82f6',    // Neutral info / accents
        }
      }
    },
  },
  plugins: [],
}