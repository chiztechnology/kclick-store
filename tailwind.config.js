/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        kclick: {
          orange: '#EF5A2C',
          'orange-dark': '#D94E24',
          'orange-light': '#F47B54',
          peach: '#F5B89C',
          'peach-light': '#FAD5C0',
        },
        dodgerblue: '#1E90FF',
      },
    },
  },
  plugins: [],
};
