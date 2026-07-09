"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Toaster, type ToasterProps } from "sonner";

export type Theme = "dark" | "light";

const STORAGE_KEY = "ow-theme";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * Real theme context — dark is the default/primary theme (per Fundação).
 * Reads persisted preference from localStorage on mount, syncs the
 * `data-theme` attribute on <html>, and persists on toggle. The initial
 * (pre-hydration) React state is always "dark" to match the server-
 * rendered markup — `ThemeScript` (in <head>) sets the real attribute
 * directly on the DOM before paint to avoid a flash, and this effect
 * only reconciles React state to match it after mount.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial: Theme = stored === "light" ? "light" : "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Inline, blocking script rendered in <head> — reads the persisted theme
 * before first paint and sets `data-theme` on <html> so there is no
 * flash of the wrong theme. Must run synchronously (no `defer`/`async`).
 */
export function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');var theme=t==='light'?'light':'dark';document.documentElement.setAttribute('data-theme',theme);}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

/**
 * Theme-aware wrapper around sonner's <Toaster> — `layout.tsx` is a Server
 * Component and can't call `useTheme()` directly, so this thin client
 * wrapper injects the live theme. Any `theme` passed in props is
 * overridden by the live context value.
 */
export function ThemedToaster(props: ToasterProps) {
  const { theme } = useTheme();
  return <Toaster {...props} theme={theme} />;
}
