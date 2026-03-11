import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'system-ui', 'sans-serif'],
        body: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        navy: { DEFAULT:'#070d1a', 800:'#0d1424', 700:'#111b2e', 600:'#162038', 500:'#1e2a42', 400:'#2d3c57' },
        blue: { DEFAULT:'#3b82f6', dark:'#2563eb', light:'#60a5fa', faint:'rgba(59,130,246,0.1)', border:'rgba(59,130,246,0.25)' },
        amber: { DEFAULT:'#f59e0b', faint:'rgba(245,158,11,0.1)' },
        emerald: { DEFAULT:'#10b981', faint:'rgba(16,185,129,0.1)' },
        rose: { DEFAULT:'#ef4444', faint:'rgba(239,68,68,0.1)' },
        violet: { DEFAULT:'#8b5cf6', faint:'rgba(139,92,246,0.1)' },
        cyan: { DEFAULT:'#06b6d4', faint:'rgba(6,182,212,0.1)' },
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-right': 'slideRight 0.35s ease forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        shimmer: 'shimmer 1.8s infinite',
      },
      keyframes: {
        fadeUp:    { from:{opacity:'0',transform:'translateY(16px)'}, to:{opacity:'1',transform:'translateY(0)'} },
        fadeIn:    { from:{opacity:'0'}, to:{opacity:'1'} },
        slideRight:{ from:{opacity:'0',transform:'translateX(-16px)'}, to:{opacity:'1',transform:'translateX(0)'} },
        pulseGlow: { '0%,100%':{boxShadow:'0 0 8px rgba(59,130,246,0.3)'}, '50%':{boxShadow:'0 0 24px rgba(59,130,246,0.6)'} },
        shimmer:   { '0%':{backgroundPosition:'-200% 0'}, '100%':{backgroundPosition:'200% 0'} },
      },
    },
  },
  plugins: [],
}
export default config
