"use client";

import * as React from "react";

/*
 * Minimal theme store — replaces next-themes.
 * next-themes renders a <script> inside the React tree, which React 19 /
 * Next 16 flags as an error ("Scripts inside React components are never
 * executed"). This store touches only classList/style: no script tags,
 * no hydration mismatch (server snapshot is always "system"/light).
 */

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const KEY = "socira:theme";

let current: Theme = "system";
let initialized = false;
const listeners = new Set<() => void>();

function readStored(): Theme {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function systemDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function apply(theme: Theme): void {
  const dark = theme === "dark" || (theme === "system" && systemDark());
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): Theme {
  if (!initialized) {
    initialized = true;
    current = readStored();
    apply(current);
  }
  return current;
}

function getServerSnapshot(): Theme {
  return "system";
}

const subscribeMounted = () => () => {};
const getMountedSnapshot = () => true;
const getMountedServerSnapshot = () => false;

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // False during hydration so server and client render the same icon.
  const mounted = React.useSyncExternalStore(
    subscribeMounted,
    getMountedSnapshot,
    getMountedServerSnapshot,
  );

  React.useEffect(() => {
    apply(theme);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readStored() === "system") {
        apply("system");
        listeners.forEach((listener) => listener());
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = React.useCallback((next: Theme) => {
    current = next;
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // Storage unavailable - theme still applies for the session.
    }
    apply(next);
    listeners.forEach((listener) => listener());
  }, []);

  const value = React.useMemo<ThemeContextValue>(() => {
    const resolvedTheme: ResolvedTheme =
      !mounted || theme === "light"
        ? "light"
        : theme === "dark"
          ? "dark"
          : systemDark()
            ? "dark"
            : "light";
    return { theme, resolvedTheme, setTheme };
  }, [theme, mounted, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return React.useContext(ThemeContext);
}
