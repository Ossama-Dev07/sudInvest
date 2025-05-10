import { createContext, useContext, useEffect, useState } from "react";

const initialState = {
  theme: "system",
  setTheme: () => null,
  font: "inter",
  setFont: () => null,
};

const ThemeProviderContext = createContext(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultFont = "inter",
  themeStorageKey = "vite-ui-theme",
  fontStorageKey = "vite-ui-font",
  ...props
}) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(themeStorageKey) || defaultTheme
  );
  
  const [font, setFont] = useState(
    () => localStorage.getItem(fontStorageKey) || defaultFont
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);
  
  // Apply font when it changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove any previous font classes
    root.classList.remove("font-inter", "font-manrope", "font-system");
    
    // Add the new font class
    root.classList.add(`font-${font}`);
  }, [font]);

  const value = {
    theme,
    setTheme: (theme) => {
      localStorage.setItem(themeStorageKey, theme);
      setTheme(theme);
    },
    font,
    setFont: (font) => {
      localStorage.setItem(fontStorageKey, font);
      setFont(font);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};