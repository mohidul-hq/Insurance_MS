/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  safelist: [
    // Animations and custom bg-size
    'animate-gradient', 'animate-glow', 'bg-lg-gradient',
    // Gradient colors used by LOPV accents
    'from-emerald-500', 'via-green-400', 'to-lime-500',
    'from-amber-500', 'via-orange-400', 'to-yellow-500',
    'from-rose-500', 'via-pink-400', 'to-fuchsia-500',
      // Brand blue gradient used across the shell
      'from-blue-500', 'via-sky-400', 'to-cyan-500',
    // Badges and rings
    'bg-emerald-100', 'text-emerald-800', 'ring-emerald-300',
    'bg-amber-100', 'text-amber-800', 'ring-amber-300',
    'bg-rose-100', 'text-rose-800', 'ring-rose-300',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
        },
        surface: {
          light: '#ffffff',
          dark: '#0B1220',
        },
        overlay: {
          light: '#f7fafc',
          dark: '#0E172A',
        },
        brand: {
          card: '#0F1A2E',
          border: '#1E2A3D',
          text: '#D7E0F2',
          muted: '#8FA0BE',
          emerald: '#22C55E',
          amber: '#F59E0B',
          hover: '#0D1628',
        },
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 0px rgba(0,0,0,0)' },
          '50%': { boxShadow: '0 0 24px rgba(59,130,246,0.35)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        themeFade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        softPop: {
          '0%': { transform: 'scale(0.98)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        glow: 'glow 2.2s ease-in-out infinite',
        gradient: 'gradient-x 6s ease infinite',
        theme: 'themeFade 300ms ease-out',
        pop: 'softPop 250ms ease-out',
      },
      backgroundSize: {
        'lg-gradient': '200% 200%',
      },
    },
  },
  plugins: [],
}
