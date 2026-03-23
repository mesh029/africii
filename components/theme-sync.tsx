"use client";

import { useEffect } from "react";

function applySavedTheme() {
  try {
    const saved = window.localStorage.getItem("africii-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const useDark = saved ? saved === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", useDark);
    document.documentElement.style.colorScheme = useDark ? "dark" : "light";
  } catch {
    // noop: if storage is unavailable we fallback to system default
  }
}

export default function ThemeSync() {
  useEffect(() => {
    applySavedTheme();
    const onStorage = (event: StorageEvent) => {
      if (event.key === "africii-theme") applySavedTheme();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
