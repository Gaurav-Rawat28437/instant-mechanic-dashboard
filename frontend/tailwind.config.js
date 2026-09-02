/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: { soft: "0 10px 40px rgba(15,23,42,.06)" }
    }
  },
  plugins: []
};
