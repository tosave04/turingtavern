"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, DARK_THEME } from "@/components/layout/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  // Vérifie si le thème actuel est le thème sombre (en utilisant la constante DARK_THEME)
  const isDarkTheme = theme === DARK_THEME;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label="Basculer le thème"
    >
      {isDarkTheme ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </Button>
  );
}
