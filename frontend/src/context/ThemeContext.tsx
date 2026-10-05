import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
export type Palette = "blue" | "sage";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  palette: Palette;
  setTheme: (theme: Theme) => void;
  setPalette: (palette: Palette) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem("archflow_theme") as Theme) || "system";
  });

  const [palette, setPaletteState] = useState<Palette>(() => {
    return (localStorage.getItem("archflow_palette") as Palette) || "blue";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;

    // Detect system theme
    const getSystemTheme = () =>
      window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

    const activeTheme = theme === "system" ? getSystemTheme() : theme;
    setResolvedTheme(activeTheme);

    // Apply dark/light class
    root.classList.remove("light", "dark");
    root.classList.add(activeTheme);

    // Apply palette class
    root.classList.remove("theme-blue", "theme-sage");
    root.classList.add(`theme-${palette}`);

    // Update color-scheme style
    root.style.colorScheme = activeTheme;

    // Listen to OS changes if system mode
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? "dark" : "light";
        setResolvedTheme(newTheme);
        root.classList.remove("light", "dark");
        root.classList.add(newTheme);
        root.style.colorScheme = newTheme;
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme, palette]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("archflow_theme", newTheme);
  };

  const setPalette = (newPalette: Palette) => {
    setPaletteState(newPalette);
    localStorage.setItem("archflow_palette", newPalette);
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        palette,
        setTheme,
        setPalette,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
