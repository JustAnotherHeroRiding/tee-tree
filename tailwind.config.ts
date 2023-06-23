import { type Config } from "tailwindcss";
import tailwindScrollbar from 'tailwind-scrollbar';

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
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
