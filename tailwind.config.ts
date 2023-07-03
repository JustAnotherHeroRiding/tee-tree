import { type Config } from "tailwindcss";
import tailwindScrollbar from 'tailwind-scrollbar';

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    
    extend: {
      screens: {
        'phone': {'max': '385px'},
      },
      spacing: {
        '1/5': '20%',
        '1/6': '16.666667%',
        '1/10': '10%'
      },
      minWidth: {
        '0': '0',
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
        'full': '100%',
        'min': 'min-content', // custom min-w style
      },
      colors: {
        spectrum: {
        h1: '#f5724c',
        h2: '#c65425',
        h3: '#ede479',
        h4: '#aade62',
        h5: '#3e6b2d',
        h6: '#54b2de',
        },
        Intone: {
          100: '#152238',
          200: '#0b1528',
          300: '#56b9e5',
          400: '#091120',
          500: '#78c2fb',
          600: '#c6d1dc',
          700: '#0b1528',
          800: '#656a7a',
          900: '#5e98de'
        },
        gray: {
          900: '#202225',
          800: '#2f3136',
          700: '#36393f',
          600: '#2F3336',
          500:'#7b7365',
          400: '#d4d7dc',
          300: '#e3e5e8',
          200: '#ebedef',
          100: '#f2f3f5',
        }
      },
      fontFamily: {
        'Figtree' : "Figtree",
        'Roboto' : 'Roboto'
      }
    },
  },
  plugins: [
    tailwindScrollbar({ nocompatible: true }),
  ],
} as Config;
