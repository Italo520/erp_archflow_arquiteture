"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => { setMounted(true) }, [])

    if (!mounted) {
        return <div className="h-7 w-7" />
    }

    const isDark = theme === "dark"

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
            className={[
                "relative flex items-center justify-center rounded-lg size-7",
                "transition-all duration-200",
                "hover:bg-secondary text-muted-foreground hover:text-foreground",
            ].join(" ")}
        >
            {/* Sol */}
            <Sun
                className={[
                    "absolute size-4 transition-all duration-300",
                    isDark
                        ? "opacity-0 rotate-90 scale-50"
                        : "opacity-100 rotate-0 scale-100 text-amber-500",
                ].join(" ")}
            />
            {/* Lua */}
            <Moon
                className={[
                    "absolute size-4 transition-all duration-300",
                    isDark
                        ? "opacity-100 rotate-0 scale-100 text-primary"
                        : "opacity-0 -rotate-90 scale-50",
                ].join(" ")}
            />
        </button>
    )
}
