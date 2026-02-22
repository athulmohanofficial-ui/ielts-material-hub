/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        reading: { 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#2563eb' },
        listening: { 50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e', 600: '#16a34a' },
        speaking: { 50: '#faf5ff', 100: '#f3e8ff', 500: '#a855f7', 600: '#9333ea' },
        writing: { 50: '#fff7ed', 100: '#ffedd5', 500: '#f97316', 600: '#ea580c' },
      },
    },
  },
  plugins: [],
}
