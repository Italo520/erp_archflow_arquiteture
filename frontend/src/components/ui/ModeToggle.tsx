import React from "react";
import { Moon, Sun, Palette as PaletteIcon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export function ModeToggle() {
  const { resolvedTheme, toggleTheme, palette, setPalette } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-8 w-8" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex items-center gap-1">
      {/* Botão de alternar Claro/Escuro */}
      <button
        onClick={toggleTheme}
        aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
        title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
        className="relative flex items-center justify-center rounded-lg size-8 transition-all duration-200 hover:bg-secondary text-muted-foreground hover:text-foreground"
      >
        <Sun
          className={`absolute size-4 transition-all duration-300 ${
            isDark
              ? "opacity-0 rotate-90 scale-50"
              : "opacity-100 rotate-0 scale-100 text-amber-500"
          }`}
        />
        <Moon
          className={`absolute size-4 transition-all duration-300 ${
            isDark
              ? "opacity-100 rotate-0 scale-100 text-primary"
              : "opacity-0 -rotate-90 scale-50"
          }`}
        />
      </button>

      {/* Botão de alternar Paleta (Azul Legado vs Sálvia Arquitetônica) */}
      <button
        onClick={() => setPalette(palette === "blue" ? "sage" : "blue")}
        aria-label="Alternar paleta de cores"
        title={
          palette === "blue"
            ? "Paleta: Azul Legado (clique para Verde Sálvia)"
            : "Paleta: Verde Sálvia (clique para Azul Legado)"
        }
        className="relative flex items-center justify-center rounded-lg size-8 transition-all duration-200 hover:bg-secondary text-muted-foreground hover:text-foreground"
      >
        <PaletteIcon className={`size-4 ${palette === "blue" ? "text-blue-500" : "text-emerald-500"}`} />
      </button>
    </div>
  );
}
