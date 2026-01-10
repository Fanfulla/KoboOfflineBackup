/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kobo custom color palette
        'kobo-cream': '#F5F1E8',
        'kobo-cream-dark': '#E8E3D8',
        'kobo-accent': '#D4A574',
        'kobo-accent-dark': '#B8895E',

        'kobo-dark': '#2C2416',
        'kobo-gray': '#6B675E',
        'kobo-gray-light': '#A8A49A',

        'kobo-success': '#7FB069',
        'kobo-warning': '#F4A261',
        'kobo-error': '#E63946',
        'kobo-info': '#457B9D',

        'kobo-overlay': 'rgba(44, 36, 22, 0.4)',
        'kobo-glass': 'rgba(245, 241, 232, 0.8)',
      },
      fontFamily: {
        'display': ['Oswald', 'system-ui', 'sans-serif'],
        'body': ['Oswald', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Professional type scale - readable sizes
        '6xl': ['4rem', { lineHeight: '1' }],           // 64px - hero titles
        '5xl': ['3rem', { lineHeight: '1' }],           // 48px - page titles
        '4xl': ['2.25rem', { lineHeight: '1.1' }],      // 36px - section headers
        '3xl': ['1.875rem', { lineHeight: '1.2' }],     // 30px - subsection headers
        '2xl': ['1.5rem', { lineHeight: '1.3' }],       // 24px - card titles
        'xl': ['1.25rem', { lineHeight: '1.4' }],       // 20px - large text
        'lg': ['1.125rem', { lineHeight: '1.5' }],      // 18px - emphasis
        'base': ['1rem', { lineHeight: '1.5' }],        // 16px - body text (DEFAULT)
        'sm': ['0.875rem', { lineHeight: '1.5' }],      // 14px - small text
        'xs': ['0.75rem', { lineHeight: '1.5' }],       // 12px - captions only
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s ease-in-out 3',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'elevated': '0 8px 30px rgb(0 0 0 / 0.06)',
        'elevated-hover': '0 12px 40px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
}
