"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-lg bg-muted animate-pulse" />;
  }

  const isDark = theme === "dark";
  const isSystem = theme === "system";

  const options = [
    { key: "light", label: "Light", icon: Sun },
    { key: "dark", label: "Dark", icon: Moon },
    { key: "system", label: "System", icon: Monitor },
  ] as const;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-muted transition-all duration-200 group"
        aria-label="Toggle theme"
      >
        <Sun
          className={`w-4 h-4 transition-all duration-300 ${
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          } text-amber-500 group-hover:text-amber-600 absolute top-2 left-2`}
        />
        <Moon
          className={`w-4 h-4 transition-all duration-300 ${
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          } text-indigo-400 group-hover:text-indigo-300`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-popover border border-border rounded-xl shadow-lg p-1 min-w-[140px] z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          {options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                setTheme(opt.key);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] rounded-lg transition-colors ${
                theme === opt.key
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <opt.icon className="w-3.5 h-3.5" />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
