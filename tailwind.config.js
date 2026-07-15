/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        window: {
          bar: '#045aa5',
          barMuted: '#5b7488',
          brand: '#045aa5',
        },
        luna: {
          frame: '#0831d9',
          selection: '#316ac5',
          menuHeader: '#0a5ad4',
          menuRight: '#d3e5fa',
        },
      },
      fontFamily: {
        xp: ['Tahoma', '"Trebuchet MS"', 'Verdana', '"DejaVu Sans"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
