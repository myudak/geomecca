/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'
import themes from 'daisyui/src/theming/themes.js'

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Manrope"', 'Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        'brand-surface': {
          light: '#e6f0fb',
          'light-hover': '#d9e9f1',
          'light-active': '#b1d1e2',
          normal: '#0369a1',
          'normal-hover': '#035f91',
          'normal-active': '#025481',
          dark: '#024f79',
          'dark-hover': '#023661',
          'dark-active': '#012c4b',
          darker: '#012538'
        },
        'brand-numeric': {
          50: '#e7f1fb',
          100: '#b5cdff',
          200: '#92b5ea',
          300: '#6093e1',
          400: '#417edb',
          500: '#115ed2',
          600: '#0f56bf',
          700: '#0c4395',
          800: '#093474',
          900: '#072758'
        },
        'brand-text': {
          light: '#012538',
          dark: '#e6f0fb',
          muted: '#024f79',
          'muted-dark': '#b1d1e2'
        }
      }
    }
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        light: {
          ...themes['[data-theme=light]'],
          primary: '#0369a1',
          'primary-focus': '#035f91',
          'primary-content': '#f5fafe',
          base100: '#e6f0fb',
          base200: '#d9e9f1',
          base300: '#b1d1e2',
          neutral: '#012538',
          'neutral-content': '#e6f0fb',
          accent: '#115ed2',
          'accent-focus': '#0f56bf',
          'accent-content': '#fdfefe',
          info: '#417edb',
          success: '#0f9d58',
          warning: '#f4b400',
          error: '#df2c2c'
        }
      },
      {
        business: {
          ...themes['[data-theme=business]'],
          primary: '#0f56bf',
          'primary-focus': '#0c4395',
          'primary-content': '#e7f1fb',
          base100: '#012538',
          base200: '#023661',
          base300: '#012c4b',
          neutral: '#e6f0fb',
          'neutral-content': '#012538',
          accent: '#417edb',
          'accent-focus': '#0f56bf',
          'accent-content': '#012538',
          info: '#92b5ea',
          success: '#25d366',
          warning: '#fbbc05',
          error: '#f87171'
        }
      }
    ],
    darkTheme: 'business'
  }
}

