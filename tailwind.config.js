module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./utils/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#ff9700",
          50: "#fffbea",
          100: "#fff2c5",
          200: "#ffe585",
          300: "#ffd046",
          400: "#ffbb1b",
          500: "#ff9700",
          600: "#e27000",
          700: "#bb4b02",
          800: "#983a08",
        },
        grey: {
          DEFAULT: "#a4a4a4",
          50: "#f7f7f7",
          100: "#ededed",
          200: "#dfdfdf",
          300: "#c8c8c8",
          400: "#a4a4a4",
          500: "#999999",
          600: "#888888",
          700: "#7b7b7b",
          800: "##676767",
        },
        dark: {
          primary: "#1b1c1d",
          secondary: "#23272f",
          accent: "#343A46",
        },
        red: "#ff5959",
        yellow: "#fdcc4d",
        pink: "#ffdada",
        violet: "#f9d1ff",
      },
      fontFamily: {
        nregular: ["OpenSans-Regular", "sans-serif"],
        nmedium: ["OpenSans-Medium", "sans-serif"],
        nsemibold: ["OpenSans-SemiBold", "sans-serif"],
        nbold: ["OpenSans-Bold", "sans-serif"],
        nitalic: ["OpenSans-Italic", "sans-serif"],
      },
    },
  },
  plugins: [],
};
