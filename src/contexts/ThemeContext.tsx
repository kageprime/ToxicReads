import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

const STORAGE_KEY = "toxicreads-theme";
const LEGACY_KEY = "neural-atelier-theme";

function getInitialTheme(): Theme {
  try {
    const stored = (localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem(LEGACY_KEY)) as Theme | null;
    if (stored === "light" || stored === "dark") return stored;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: light)").matches
    ) {
      return "light";
    }
  } catch {
    // localStorage not available
  }
  return "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
      localStorage.removeItem(LEGACY_KEY);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
