/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mistral: {
          red: '#E10500',
          'orange-dark': '#FA500F', 
          orange: '#FF8205',
          'orange-light': '#FFAF00',
          yellow: '#FFD800',
          'beige-light': '#FFFAEB',
          'beige-medium': '#FFF0C3',
          'beige-dark': '#E9E2CB',
          black: '#000000',
          'black-tinted': '#1E1E1E',
        },
        brand: {
          50: '#FFFAEB',
          100: '#FFF0C3', 
          200: '#FFD800',
          300: '#FFAF00', 
          400: '#FF8205',
          500: '#FA500F', // Primary
          600: '#E10500',
          700: '#1E1E1E',
          800: '#000000',
          900: '#000000',
        }
      },
    },
  },
  plugins: [],
}

