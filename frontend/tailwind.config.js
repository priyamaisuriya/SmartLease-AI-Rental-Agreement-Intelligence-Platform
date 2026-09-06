/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#1E2233', soft: '#4B5165', faint: '#8A8FA3' },
        canvas: '#F6F7FB',
        surface: '#FFFFFF',
        line: '#E7E9F2',
        lease: { 50:'#F1F1FE',100:'#E4E4FD',200:'#C9C9FB',300:'#A5A4F7',400:'#7E7BF0',500:'#5B57E8',600:'#4640D6',700:'#3830B0',800:'#2E2A8A',900:'#26236B' },
        signal: { 50:'#F6F1FE',100:'#EBE0FD',400:'#A672F0',500:'#8B4FE8',600:'#7238D0' },
        good: { 50:'#EEF7EE',500:'#3B9457',600:'#2F7A46' },
        warn: { 50:'#FCF3E4',500:'#C1811F',600:'#A66C15' },
        bad: { 50:'#FBEEEE',500:'#C24343',600:'#A63535' },
      },
      fontFamily: {
        display: ['Sora','ui-sans-serif','system-ui','sans-serif'],
        body: ['Inter','ui-sans-serif','system-ui','sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(30,34,51,0.04), 0 8px 24px -12px rgba(30,34,51,0.10)',
        lift: '0 2px 4px rgba(30,34,51,0.05), 0 16px 40px -16px rgba(30,34,51,0.18)',
      },
      borderRadius: { xl2: '1.1rem' },
      keyframes: {
        rise: { '0%': { opacity:0, transform:'translateY(6px)' }, '100%': { opacity:1, transform:'translateY(0)' } },
        popIn: { '0%': { opacity:0, transform:'scale(.96)' }, '100%': { opacity:1, transform:'scale(1)' } },
      },
      animation: { rise: 'rise .45s ease-out both', popIn: 'popIn .18s ease-out both' },
    }
  },
  plugins: [],
}
