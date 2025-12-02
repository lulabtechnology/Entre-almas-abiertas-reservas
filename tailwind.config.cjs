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
        // Fondo general más azul cósmico
        "ea-bg": "#02071b",
        "ea-bg-soft": "#021029",

        // Tarjetas con sensación de cristal azul profundo
        "ea-card": "rgba(2, 10, 36, 0.96)",
        "ea-border": "rgba(165, 189, 255, 0.45)",

        // Dorados suaves para que hagan match con el logo
        "ea-gold": "#F6D48F",
        "ea-gold-soft": "#F9E4B6",

        // Texto casi blanco pero ligeramente azulado
        "ea-soft": "#F9FAFB",
        "ea-soft-muted": "#C7D2FE",

        // Azules/aguas de luz
        "ea-accent": "#7BD5FF",
        "ea-accent-soft": "#B6E6FF"
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
          "0 22px 70px rgba(3, 7, 30, 0.95), 0 0 0 1px rgba(15, 23, 42, 0.9)"
      },
      backgroundImage: {
        // Fondo principal: azul cósmico con luz celeste y violeta,
        // inspirado en el logo y en la web entre-almas-abiertas
        "ea-hero":
          "radial-gradient(circle at 15% 0%, rgba(123, 213, 255, 0.38), transparent 60%), radial-gradient(circle at 85% 120%, rgba(102, 126, 234, 0.75), #02071b)",

        // Halo dorado muy suave encima
        "ea-radial":
          "radial-gradient(circle at top, rgba(246, 212, 143, 0.35), transparent 65%)"
      }
    }
  },
  plugins: []
};
