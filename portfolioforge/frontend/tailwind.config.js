export default {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        parchment: '#F7F3ED',
        'parchment-dark': '#F0E8DA',
        amber: { warm: '#D4922A', light: '#E8B660', muted: '#C9A87C', pale: '#A06B10' },
        ink: { DEFAULT: '#1C1410', mid: '#7A6248', soft: '#A8896A' },
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans:  ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
