import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useState, useEffect } from "react";

export  function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState("light");
  
  // Synchroniser l'état local avec le thème actuel
  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  // Fonction pour basculer entre les modes clair et sombre
  const toggleTheme = () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative"
      title={currentTheme === "dark" ? "Passer au mode clair" : "Passer au mode sombre"}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">
        {currentTheme === "dark" ? "Passer au mode clair" : "Passer au mode sombre"}
      </span>
    </Button>
  );
}