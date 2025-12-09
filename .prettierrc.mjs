/** @type {import("prettier").Config} */
export default {
  plugins: [
    "prettier-plugin-astro",
    // Temporarily disabled due to compatibility issue with React components
    // "@prettier/plugin-oxc",
    "prettier-plugin-tailwindcss",
  ],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};
