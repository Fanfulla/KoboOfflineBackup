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
        'display': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'body': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        // Type scale (1.250 - Major Third)
        '6xl': ['3.815rem', { lineHeight: '1.1' }],   // 61px
        '5xl': ['3.052rem', { lineHeight: '1.2' }],   // 49px
        '4xl': ['2.441rem', { lineHeight: '1.2' }],   // 39px
        '3xl': ['1.953rem', { lineHeight: '1.3' }],   // 31px
        '2xl': ['1.563rem', { lineHeight: '1.4' }],   // 25px
        'xl': ['1.25rem', { lineHeight: '1.5' }],     // 20px
        'lg': ['1rem', { lineHeight: '1.6' }],        // 16px
        'base': ['0.8rem', { lineHeight: '1.6' }],    // 13px
        'sm': ['0.64rem', { lineHeight: '1.5' }],     // 10px
      },
      spacing: {
        // 8px grid system
        '1': '0.5rem',   // 8px
        '2': '1rem',     // 16px
        '3': '1.5rem',   // 24px
        '4': '2rem',     // 32px
        '5': '3rem',     // 48px
        '6': '4rem',     // 64px
        '7': '6rem',     // 96px
        '8': '8rem',     // 128px
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
