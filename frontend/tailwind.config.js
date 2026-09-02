/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 40px rgba(15,23,42,.06)",
        "soft-dark": "0 10px 40px rgba(0,0,0,.35)"
      },
      keyframes: {
        "slide-in": { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(0)" } },
        "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
        "pop-in": { from: { opacity: 0, transform: "scale(.95) translateY(-4px)" }, to: { opacity: 1, transform: "scale(1) translateY(0)" } }
      },
      animation: {
        "slide-in": "slide-in .25s ease-out",
        "fade-in": "fade-in .2s ease-out",
        "pop-in": "pop-in .15s ease-out"
      }
    }
  },
  plugins: []
};
