/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "ea-bg": "#020617",
        "ea-bg-soft": "#020617",
        "ea-card": "rgba(15, 23, 42, 0.96)",
        "ea-border": "rgba(148, 163, 184, 0.35)",
        "ea-gold": "#F6D48F",
        "ea-gold-soft": "#F9E4B6",
        "ea-soft": "#E5E7EB",
        "ea-soft-muted": "#9CA3AF",
        "ea-accent": "#A78BFA",
        "ea-accent-soft": "#C4B5FD"
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"]
      },
      borderRadius: {
        "3xl": "1.75rem"
      },
      boxShadow: {
        "ea-soft":
          "0 18px 60px rgba(15, 23, 42, 0.95), 0 0 0 1px rgba(15, 23, 42, 0.9)"
      },
      backgroundImage: {
        "ea-hero":
          "radial-gradient(circle at top, rgba(248, 250, 252, 0.12), transparent 55%), radial-gradient(circle at bottom, rgba(30, 64, 175, 0.32), #020617)",
        "ea-radial":
          "radial-gradient(circle at top, rgba(246, 212, 143, 0.26), transparent 60%)"
      }
    }
  },
  plugins: []
};
