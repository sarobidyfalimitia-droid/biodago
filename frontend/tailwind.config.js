/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f7f1', 100: '#dbebe0', 200: '#b3d6bd', 300: '#84bd95',
          400: '#569e6d', 500: '#367d50', 600: '#26623e', 700: '#1f4e33',
          800: '#1a3f2a', 900: '#0f2a1c', 950: '#081a11',
        },
        baobab: {
          50: '#fdf4ec', 100: '#f9e2c9', 200: '#f0c088', 300: '#e59e50',
          400: '#d97f2e', 500: '#c2661d', 600: '#9e4f18', 700: '#7c3f18',
          800: '#65341a', 900: '#4a2513',
        },
        parchment: {
          50: '#fbf8f1', 100: '#f4ecd9', 200: '#e8d8b6', 300: '#dac093',
        },
        earth: {
          50: '#faf8f5', 100: '#efe9df', 200: '#dccfba', 300: '#c1ac86',
          400: '#a3895f', 500: '#846b47', 600: '#68533a', 700: '#524232',
          800: '#43372c', 900: '#392f27',
        },
        ink: '#182015',
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'specimen-grid': "linear-gradient(rgba(31,78,51,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(31,78,51,0.05) 1px, transparent 1px)",
        'field-texture': "radial-gradient(circle at 1px 1px, rgba(15,42,28,0.12) 1px, transparent 0)",
      },
      backgroundSize: {
        grid: '28px 28px',
      },
    },
  },
  plugins: [],
};
