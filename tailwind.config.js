/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Ink & paper brand tokens (adapt across light/dark via CSS vars) */
        terracotta: "rgb(var(--color-terracotta) / <alpha-value>)",
        baobab: "rgb(var(--color-baobab) / <alpha-value>)",
        ochre: "rgb(var(--color-ochre) / <alpha-value>)",
        cream: "rgb(var(--color-cream) / <alpha-value>)",
        charcoal: "rgb(var(--color-charcoal) / <alpha-value>)",

        /* Single press spot accent: Signal Crimson */
        signal: {
          DEFAULT: "hsl(var(--primary-signal))",
          foreground: "hsl(var(--primary-signal-foreground))",
        },

        /* Muted status tones */
        "p-red": "rgb(var(--color-p-red) / <alpha-value>)",
        "p-red-fg": "rgb(var(--color-p-red-fg) / <alpha-value>)",
        "p-blue": "rgb(var(--color-p-blue) / <alpha-value>)",
        "p-blue-fg": "rgb(var(--color-p-blue-fg) / <alpha-value>)",
        "p-green": "rgb(var(--color-p-green) / <alpha-value>)",
        "p-green-fg": "rgb(var(--color-p-green-fg) / <alpha-value>)",
        "p-yellow": "rgb(var(--color-p-yellow) / <alpha-value>)",
        "p-yellow-fg": "rgb(var(--color-p-yellow-fg) / <alpha-value>)",

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
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
        serif: ["Newsreader", "Georgia", "Cambria", "serif"],
        display: ["Newsreader", "Georgia", "Cambria", "serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        soft: "0 2px 10px -2px rgb(0 0 0 / 0.06), 0 1px 3px 0 rgb(0 0 0 / 0.04)",
        "soft-lg":
          "0 14px 36px -8px rgb(0 0 0 / 0.14), 0 4px 12px -2px rgb(0 0 0 / 0.06)",
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.03em",
        tight: "-0.02em",
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
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "fade-up": "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
