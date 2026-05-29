/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Styleguide color tokens
        primary: {
          DEFAULT: "#EBCEEC",
          light: "#F5EAF5",
          dark: "#C4A3C5",
          50: "#FDFBFD",
          100: "#F5EAF5",
          200: "#EBCEEC",
          300: "#D4A8D6",
          400: "#C4A3C5",
          500: "#A87BA9",
        },
        surface: {
          DEFAULT: "#FFFFFE",
          warm: "#F8F7F4",
          card: "#FEFEFE",
          muted: "#F3F2EE",
        },
        border: {
          DEFAULT: "#E8E8E0",
          light: "#F0EFE9",
          dark: "#D4D3CB",
        },
        focus: {
          DEFAULT: "#00CFCC",
          light: "#E6FAF9",
        },
        // Semantic colors
        success: { DEFAULT: "#C8E6C9", dark: "#4CAF50", text: "#2E7D32" },
        warning: { DEFAULT: "#FFF9C4", dark: "#FFC107", text: "#F57F17" },
        error: { DEFAULT: "#FFCDD2", dark: "#EF5350", text: "#C62828" },
        // Neutral
        neutral: {
          50: "#FAFAF8",
          100: "#F5F5F0",
          200: "#E8E8E0",
          300: "#D4D3CB",
          400: "#A8A79E",
          500: "#7A796F",
          600: "#5A594F",
          700: "#3D3C34",
          800: "#2A2922",
          900: "#1A1914",
        },
      },
      borderRadius: {
        xs: "2px",
        sm: "7px",
        md: "12px",
        lg: "20px",
        xl: "28px",
        full: "99px",
      },
      boxShadow: {
        // Neumorphic elevation levels
        "level-1": "2px 2px 6px #E0DFD9, -2px -2px 6px #FFFFFF",
        "level-2": "4px 4px 10px #D8D7D1, -4px -4px 10px #FFFFFF",
        "level-3": "6px 6px 14px #D0CFc9, -6px -6px 14px #FFFFFF",
        "level-4": "8px 8px 18px #C8C7C1, -8px -8px 18px #FFFFFF",
        "level-5": "10px 10px 22px #C0BFb9, -10px -10px 22px #FFFFFF",
        // Inset (pressed)
        "inset-soft": "inset 2px 2px 5px #E0DFD9, inset -2px -2px 5px #FFFFFF",
        "inset-deep": "inset 4px 4px 8px #D8D7D1, inset -4px -4px 8px #FFFFFF",
        // Flat card
        card: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF",
        "card-hover": "5px 5px 12px #DDDCD6, -5px -5px 12px #FFFFFF",
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        display: ["3.5rem", { lineHeight: "1.1", fontWeight: "700" }],
        h1: ["2rem", { lineHeight: "1.2", fontWeight: "600" }],
        h2: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        h3: ["1.125rem", { lineHeight: "1.4", fontWeight: "500" }],
        body: ["0.9375rem", { lineHeight: "1.6", fontWeight: "400" }],
        caption: ["0.8125rem", { lineHeight: "1.5", fontWeight: "400" }],
        small: ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.2s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
