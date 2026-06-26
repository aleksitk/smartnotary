/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0B0F17',
        panel: '#121826',
        panel2: '#1A2233',
        hairline: 'rgba(255,255,255,0.08)',
        gold: '#C9974C',
        goldsoft: 'rgba(201,151,76,0.14)',
        teal: '#45B8A4',
        tealsoft: 'rgba(69,184,164,0.14)',
        red: '#E06257',
        redsoft: 'rgba(224,98,87,0.14)',
        paper: '#EDE8DC',
        muted: '#8C93A6',
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}