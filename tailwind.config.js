/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // This tells Tailwind to scan all your components in the 'src' folder
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
