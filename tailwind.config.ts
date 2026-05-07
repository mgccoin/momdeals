import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8F3',
        coral: {
          50:  '#FFF1EE',
          100: '#FFE0DA',
          200: '#FFC0B5',
          300: '#FFA08F',
          400: '#FF8B78',
          500: '#FF7A6B',
          600: '#E85F50',
          700: '#C44A3D',
          800: '#9C3A30',
          900: '#7A2D26',
        },
        plum: {
          50:  '#F4EFF6',
          100: '#E5D9EA',
          200: '#C8AED4',
          300: '#A684B8',
          400: '#7E5C92',
          500: '#5C406F',
          600: '#432F54',
          700: '#2E1F3A',
          800: '#1F1428',
          900: '#120B17',
        },
        sage: {
          50:  '#EFF6F1',
          100: '#D8E8DD',
          200: '#B2D2BC',
          300: '#8CBC9B',
          400: '#7BB394',
          500: '#5E9E7B',
          600: '#4A8262',
          700: '#39634C',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans:    ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(46,31,58,0.06), 0 4px 16px rgba(46,31,58,0.06)',
        cardHover: '0 4px 12px rgba(46,31,58,0.08), 0 12px 32px rgba(255,122,107,0.18)',
      },
      maxWidth: {
        site: '1180px',
        prose: '760px',
      },
    },
  },
  plugins: [],
};

export default config;
