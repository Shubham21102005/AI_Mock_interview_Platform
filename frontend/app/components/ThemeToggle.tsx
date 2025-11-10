"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    // Return a placeholder with the same dimensions to prevent layout shift
    return (
      <div className="w-10 h-10 rounded-lg border-2 border-transparent" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-[var(--color-navy)] dark:border-[var(--color-peach)] bg-transparent hover:bg-[var(--hover-background)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-peach)] focus:ring-offset-2 dark:focus:ring-offset-[var(--background)]"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-[var(--color-navy)] transition-colors" />
      ) : (
        <Sun className="w-5 h-5 text-[var(--color-peach)] transition-colors" />
      )}
    </button>
  );
}
