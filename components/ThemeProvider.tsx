"use client"

import * as React from "react"

export type Theme = "dark" | "light" | "system"

export interface UseThemeProps {
    theme?: string
    setTheme: (theme: string) => void
    forcedTheme?: string
    resolvedTheme?: string
    themes: string[]
    systemTheme?: "dark" | "light"
}

export interface ThemeProviderProps {
    children?: React.ReactNode
    attribute?: string | string[]
    defaultTheme?: string
    enableSystem?: boolean
    storageKey?: string
    themes?: string[]
    forcedTheme?: string
    enableColorScheme?: boolean
    disableTransitionOnChange?: boolean
    nonce?: string
    value?: Record<string, string>
}

const ThemeContext = React.createContext<UseThemeProps>({
    theme: "system",
    setTheme: () => {},
    themes: ["light", "dark", "system"],
})

export const useTheme = () => React.useContext(ThemeContext)

export function ThemeProvider({
    children,
    attribute = "class",
    defaultTheme = "system",
    enableSystem = true,
    storageKey = "theme",
    themes = ["light", "dark"],
    forcedTheme,
    disableTransitionOnChange = false,
}: ThemeProviderProps) {
    const [theme, setThemeState] = React.useState<string>(() => {
        if (typeof window === "undefined") return defaultTheme
        try {
            return localStorage.getItem(storageKey) || defaultTheme
        } catch {
            return defaultTheme
        }
    })

    const [resolvedTheme, setResolvedTheme] = React.useState<string | undefined>(() => {
        if (typeof window === "undefined") return undefined
        if (theme === "system" && enableSystem) {
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        }
        return theme
    })

    const applyTheme = React.useCallback(
        (targetTheme: string) => {
            if (typeof window === "undefined") return
            const root = document.documentElement
            let actual = targetTheme
            if (targetTheme === "system" && enableSystem) {
                actual = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
            }

            if (disableTransitionOnChange) {
                const css = document.createElement("style")
                css.appendChild(
                    document.createTextNode(
                        "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}"
                    )
                )
                document.head.appendChild(css)
                window.getComputedStyle(document.body)
                setTimeout(() => {
                    try {
                        document.head.removeChild(css)
                    } catch {}
                }, 1)
            }

            if (attribute === "class" || (Array.isArray(attribute) && attribute.includes("class"))) {
                root.classList.remove("light", "dark")
                if (actual === "dark" || actual === "light") {
                    root.classList.add(actual)
                }
            } else if (typeof attribute === "string") {
                root.setAttribute(attribute, actual)
            }

            root.style.colorScheme = actual
            setResolvedTheme(actual)
        },
        [attribute, disableTransitionOnChange, enableSystem]
    )

    const setTheme = React.useCallback(
        (newTheme: string) => {
            setThemeState(newTheme)
            try {
                localStorage.setItem(storageKey, newTheme)
            } catch {}
            applyTheme(newTheme)
        },
        [applyTheme, storageKey]
    )

    // Initial mount and system listener
    React.useEffect(() => {
        const current = forcedTheme || theme
        applyTheme(current)

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
        const handleSystemChange = () => {
            if (theme === "system" && enableSystem && !forcedTheme) {
                applyTheme("system")
            }
        }

        try {
            mediaQuery.addEventListener("change", handleSystemChange)
        } catch {
            mediaQuery.addListener(handleSystemChange)
        }

        const handleStorage = (e: StorageEvent) => {
            if (e.key === storageKey) {
                const val = e.newValue || defaultTheme
                setThemeState(val)
                applyTheme(val)
            }
        }
        window.addEventListener("storage", handleStorage)

        return () => {
            try {
                mediaQuery.removeEventListener("change", handleSystemChange)
            } catch {
                mediaQuery.removeListener(handleSystemChange)
            }
            window.removeEventListener("storage", handleStorage)
        }
    }, [applyTheme, defaultTheme, enableSystem, forcedTheme, storageKey, theme])

    const contextValue = React.useMemo<UseThemeProps>(
        () => ({
            theme: forcedTheme || theme,
            setTheme,
            forcedTheme,
            resolvedTheme,
            themes: enableSystem ? [...themes, "system"] : themes,
            systemTheme:
                typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light",
        }),
        [enableSystem, forcedTheme, resolvedTheme, setTheme, theme, themes]
    )

    return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}
