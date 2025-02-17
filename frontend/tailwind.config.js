/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("./colors");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./src/index.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        black: colors.black,
        blue: colors.blue,
        yellow: colors.yellow,
        orange: colors.orange,
        grey: colors.grey,
        white: colors.white,
        teal: colors.teal,
        green: colors.green,
        purple: colors.purple,
        social: colors.social,
      },
      backgroundImage: {
        "curvy-shape": "url('/curvy-shape-img.png')",
        "landing-bg":
          "linear-gradient(white 20%, #d4ddf1 40%, #b0bbd8 60%, #6575a5 80%, #4a4cb2 100%)",
      },
      textShadow: {
        "landing-highlight": "2px 2px 4px rgba(0, 0, 0, 0.3)",
      },
      fontFamily: {
        sans: ["Montserrat", ...defaultTheme.fontFamily.sans],
      },
      screens: {
        "3xl": "1536px",
        "2xl": "1400px",
        xl: "1400px",
        lg: "1024px",
        md: "768px",
        sm: "640px",
        xs: "480px",
        xxs: "400px",
      },
      animation: {
        spark: "spark 1.5s linear infinite",
        "pulse-custom": "pulse 2s infinite",
        fadeIn: "fadeIn 1.5s ease-in-out",
        fadeInLeft: "fadeInLeft 1.5s ease-in-out forwards",
        maintain: "maintain 2s linear infinite",
        rotate: "rotate 2s linear infinite",
        blink: "blink 0.7s infinite",
        progressFill: "progressFill 2s linear forwards",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "0" },
          "50%": { opacity: "1" },
        },
        spark: {
          "0%": {
            maxWidth: "0%",
          },
          "100%": {
            maxWidth: "100%",
          },
        },
        pulse: {
          "0%, 100%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(1.1)",
            opacity: "1",
          },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        maintain: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        rotate: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(-360deg)" },
        },
        progressFill: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
      },
      zIndex: {
        "-1": "-1",
        50: "50",
        1000: "1000",
        1050: "1050",
        9999: "9999", // Ensure the modal is on top
      },
    },
  },
  plugins: [require("tailwind-scrollbar"), require("tailwindcss-textshadow")],
};
