/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: { 950: '#09090b', 900: '#111113', 800: '#1a1a1d', 700: '#26262a' },
        plum: { 900: '#1c0f3d', 800: '#2a1659', 700: '#3b1f7a', 500: '#7c4dff' },
        gold: { 300: '#ffe7a3', 400: '#f9d36b', 500: '#e8b84a', 600: '#c99a2e' },
        electric: { 300: '#8fd8ff', 400: '#4cc3ff', 500: '#1ea7ff', 600: '#0b84d9' },
        brand: {
          primary: 'rgb(var(--brand-primary) / <alpha-value>)',
          accent: 'rgb(var(--brand-accent) / <alpha-value>)',
        },
      },
      fontFamily: {
        arabic: ['"IBM Plex Sans Arabic"', 'Inter', 'system-ui', 'sans-serif'],
        // Overridable per event (e.g. the luxury style swaps in Playfair Display).
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgb(var(--brand-primary) / 0.55)',
        'glow-blue': '0 0 40px -8px rgba(30, 167, 255, 0.6)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      backgroundImage: {
        'night-sky':
          'radial-gradient(ellipse at 15% -10%, rgba(255,255,255,0.07), transparent 50%), radial-gradient(ellipse at 90% 10%, rgb(var(--brand-primary) / 0.07), transparent 45%), linear-gradient(180deg, #09090b 0%, #111113 55%, #0c0c0e 100%)',
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        typing: { '0%,60%,100%': { transform: 'translateY(0)', opacity: '0.45' }, '30%': { transform: 'translateY(-5px)', opacity: '1' } },
        pulseRing: { '0%': { transform: 'scale(1)', opacity: '0.55' }, '100%': { transform: 'scale(1.9)', opacity: '0' } },
        count: {
          '0%': { opacity: '0', transform: 'scale(1.8)' },
          '35%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.85)' },
        },
        rise: {
          '0%': { opacity: '1', transform: 'translate(-50%, 0) scale(0.8)' },
          '100%': { opacity: '0', transform: 'translate(-50%, -48px) scale(1.15)' },
        },
      },
      animation: {
        shimmer: 'shimmer 3s linear infinite',
        float: 'float 6s ease-in-out infinite',
        rise: 'rise 0.7s ease-out forwards',
        typing: 'typing 1.1s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2.2s ease-out infinite',
        count: 'count 0.8s ease-out forwards',
      },
    },
  },
  plugins: [],
};
