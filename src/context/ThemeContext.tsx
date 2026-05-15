import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

type ThemeMode = "light" | "dark" | "system";
type ActualTheme = "light" | "dark";

interface ThemeContextType {
  themeMode: ThemeMode;
  actualTheme: ActualTheme;
  changeTheme: (newMode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Get saved theme preference or default to 'system'
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem("dashboardTheme");
    return (savedTheme as ThemeMode) || "system";
  });

  // Determine the actual theme based on mode
  const [actualTheme, setActualTheme] = useState<ActualTheme>("dark");

  useEffect(() => {
    const updateTheme = () => {
      if (themeMode === "system") {
        // Check system preference
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        setActualTheme(prefersDark ? "dark" : "light");
      } else {
        setActualTheme(themeMode);
      }
    };

    updateTheme();

    // Listen for system theme changes
    if (themeMode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) =>
        setActualTheme(e.matches ? "dark" : "light");
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [themeMode]);

  const changeTheme = (newMode: ThemeMode) => {
    setThemeMode(newMode);
    localStorage.setItem("dashboardTheme", newMode);
  };

  return (
    <ThemeContext.Provider value={{ themeMode, actualTheme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
