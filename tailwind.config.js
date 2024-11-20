/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}", "./src/components/ui-components.js"],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5", // Replace with your desired primary color
        "primary-foreground": "#ffffff",
        destructive: "#dc2626",
        "destructive-foreground": "#ffffff",
        accent: "#38bdf8",
        "accent-foreground": "#1e293b",
        card: "#f3f4f6",
        "card-foreground": "#1f2937",
        muted: "#9ca3af",
        "muted-foreground": "#4b5563",
        secondary: "#6b7280",
        "secondary-foreground": "#f3f4f6",
        background: "#ffffff",
        ring: "#3b82f6",
      },
    },
  },

  plugins: [],
};
