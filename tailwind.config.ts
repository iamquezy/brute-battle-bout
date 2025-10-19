import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        fighter: {
          DEFAULT: "hsl(var(--fighter))",
          glow: "hsl(var(--fighter-glow))",
        },
        mage: {
          DEFAULT: "hsl(var(--mage))",
          glow: "hsl(var(--mage-glow))",
        },
        archer: {
          DEFAULT: "hsl(var(--archer))",
          glow: "hsl(var(--archer-glow))",
        },
        arena: {
          bg: "hsl(var(--arena-bg))",
          accent: "hsl(var(--arena-accent))",
        },
      },
      backgroundImage: {
        'gradient-arena': 'var(--gradient-arena)',
        'gradient-gold': 'var(--gradient-gold)',
        'gradient-fighter': 'var(--gradient-fighter)',
        'gradient-mage': 'var(--gradient-mage)',
        'gradient-archer': 'var(--gradient-archer)',
      },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
        'combat': 'var(--shadow-combat)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "attack-slash": {
          "0%": { transform: "translateX(0) scale(1)", opacity: "0" },
          "50%": { transform: "translateX(20px) scale(1.2)", opacity: "1" },
          "100%": { transform: "translateX(40px) scale(0.8)", opacity: "0" },
        },
        "hit-flash": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        "level-up": {
          "0%": { transform: "scale(0.8) translateY(20px)", opacity: "0" },
          "50%": { transform: "scale(1.1)", opacity: "1" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow-pulse": {
          "0%, 100%": { filter: "brightness(1) drop-shadow(0 0 10px currentColor)" },
          "50%": { filter: "brightness(1.3) drop-shadow(0 0 20px currentColor)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "attack-slash": "attack-slash 0.6s ease-out",
        "hit-flash": "hit-flash 0.3s ease-in-out",
        "level-up": "level-up 0.5s ease-out",
        "float": "float 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
