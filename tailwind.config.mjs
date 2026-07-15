/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          cyan: '#00d4ff',
          pink: '#ff006e',
          dark: '#0a0a0f',
          card: '#12121a',
          border: 'rgba(0,212,255,0.1)'
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 20px rgba(0,212,255,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(255,0,110,0.4)' } }
      }
    }
  },
  plugins: []
};