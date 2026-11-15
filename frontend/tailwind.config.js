/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      colors: {
        cyber: {
          bg: '#fafaf8',          // warm cream background
          surface: '#f1f5f9',     // light blue-gray surface
          card: '#ffffff',        // white cards
          border: '#e2e8f0',      // light slate border
          purple: '#7c3aed',      // deep violet (primary)
          'purple-bright': '#8b5cf6',
          cyan: '#0284c7',        // sky blue (secondary)
          'cyan-bright': '#38bdf8',
          magenta: '#be185d',     // rose/pink accent
          green: '#059669',       // emerald
          yellow: '#d97706',      // amber
          red: '#dc2626',         // red
          text: '#0f172a',        // near-black
          muted: '#64748b',       // slate muted
        },
      },
      boxShadow: {
        'neon-purple': '0 4px 14px rgba(124, 58, 237, 0.18)',
        'neon-cyan':   '0 4px 14px rgba(2, 132, 199, 0.18)',
        'neon-magenta':'0 4px 14px rgba(190, 24, 93, 0.18)',
        'neon-green':  '0 4px 14px rgba(5, 150, 105, 0.18)',
        'card':        '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)',
        'card-hover':  '0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'retro-grid': `
          linear-gradient(rgba(124, 58, 237, 0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(124, 58, 237, 0.06) 1px, transparent 1px)
        `,
        'hero-gradient': 'linear-gradient(135deg, #fafaf8 0%, #f5f3ff 50%, #ede9fe 100%)',
        'dot-pattern': 'radial-gradient(circle, rgba(124,58,237,0.12) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
        'dots': '24px 24px',
      },
    },
  },
  plugins: [],
}
