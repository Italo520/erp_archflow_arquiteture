/** @type {import('tailwindcss').Config} */
const config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./app/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
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
                // Tokens de status de projeto
                "status-todo":     "#E09D45",
                "status-progress": "#4B91F7",
                "status-done":     "#5AB585",
                "status-blocked":  "#E05757",

                // Tokens legados (compatibilidade com componentes existentes)
                "surface-dark":       "#1A1714",  // card escuro quente (atualizado)
                "surface-highlight":  "#221E1A",  // surface secundária
                "border-dark":        "#332E28",  // borda quente escura (mais visível)
                "background-light":   "#FAF7F4",  // fundo claro
                "background-dark":    "#0E0C0A",  // fundo escuro (atualizado)


            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                xl: "calc(var(--radius) + 4px)",
                "2xl": "calc(var(--radius) + 8px)",
            },
            fontFamily: {
                display: ["Outfit", "sans-serif"],
                body: ["Inter", "sans-serif"],
                sans: ["Inter", "sans-serif"],
            },
            boxShadow: {
                "xs":     "0 1px 2px 0 rgb(0 0 0 / 0.04)",
                "sm":     "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
                "card":   "0 2px 8px -2px rgb(0 0 0 / 0.08), 0 4px 16px -4px rgb(0 0 0 / 0.06)",
                "card-hover": "0 4px 16px -4px rgb(0 0 0 / 0.12), 0 8px 24px -8px rgb(0 0 0 / 0.08)",
                "primary": "0 4px 14px -2px hsl(34 46% 60% / 0.35)",
                "glow":   "0 0 0 4px hsl(34 46% 60% / 0.15)",
                "inner-xs": "inset 0 1px 2px 0 rgb(0 0 0 / 0.04)",
            },
            keyframes: {
                "fade-in": {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },
                "slide-up": {
                    from: { opacity: "0", transform: "translateY(10px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                "scale-in": {
                    from: { opacity: "0", transform: "scale(0.96)" },
                    to: { opacity: "1", transform: "scale(1)" },
                },
                "slide-in-left": {
                    from: { opacity: "0", transform: "translateX(-100%)" },
                    to: { opacity: "1", transform: "translateX(0)" },
                },
                "shimmer": {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "fade-in":       "fade-in 0.3s ease-out",
                "slide-up":      "slide-up 0.35s ease-out",
                "scale-in":      "scale-in 0.2s ease-out",
                "slide-in-left": "slide-in-left 0.3s ease-out",
                "shimmer":       "shimmer 2s linear infinite",
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up":   "accordion-up 0.2s ease-out",
            },
            transitionTimingFunction: {
                "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
                "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
            },
        },
    },
    plugins: [],
};

export default config;
