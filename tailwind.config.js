/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./js/**/*.js"],
  theme: {
    extend: {
      colors: {
        go: {
          blue: '#00ADD8',
          primary: '#007D9C',
          slate: '#253443',
          yellow: '#FDDD00',
          light: '#BFEAF4',
          bg: '#F2FAFD',
        },
      },
    },
  },
  plugins: [],
}
