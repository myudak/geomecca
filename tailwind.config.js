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
          light: '#fff5d6',
          'light-hover': '#fde8ad',
          'light-active': '#f3d07a',
          normal: '#c88a04',
          'normal-hover': '#b97b00',
          'normal-active': '#9f6800',
          dark: '#7d5200',
          'dark-hover': '#5f3e00',
          'dark-active': '#472f00',
          darker: '#2f1f00'
        },
        'brand-numeric': {
          50: '#fff9e8',
          100: '#fdecbf',
          200: '#f8da84',
          300: '#efc04d',
          400: '#dfaa1d',
          500: '#c88a04',
          600: '#ab7000',
          700: '#895800',
          800: '#684200',
          900: '#4c3000'
        },
        'brand-text': {
          light: '#4a2d00',
          dark: '#fff7e1',
          muted: '#815800',
          'muted-dark': '#e6cd97'
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
          primary: '#c88a04',
          'primary-focus': '#b97b00',
          'primary-content': '#fffaf0',
          base100: '#fff5d6',
          base200: '#fde8ad',
          base300: '#f3d07a',
          neutral: '#4a2d00',
          'neutral-content': '#fff5d6',
          accent: '#dfaa1d',
          'accent-focus': '#c88a04',
          'accent-content': '#4a2d00',
          info: '#efc04d',
          success: '#0f9d58',
          warning: '#f4b400',
          error: '#df2c2c'
        }
      },
      {
        business: {
          ...themes['[data-theme=business]'],
          primary: '#dfaa1d',
          'primary-focus': '#c88a04',
          'primary-content': '#2f1f00',
          base100: '#2f1f00',
          base200: '#472f00',
          base300: '#5f3e00',
          neutral: '#fff2c7',
          'neutral-content': '#2f1f00',
          accent: '#f3d07a',
          'accent-focus': '#dfaa1d',
          'accent-content': '#2f1f00',
          info: '#fde8ad',
          success: '#25d366',
          warning: '#fbbc05',
          error: '#f87171'
        }
      }
    ],
    darkTheme: 'business'
  }
}

