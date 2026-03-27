"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, ChevronRight } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Topbar() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  return (
    <header className="h-14 min-h-14 border-b border-border flex items-center justify-between px-8 bg-card">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-[13px]">
        {parts.length === 0 ? (
          <span className="text-muted-foreground">Dashboard</span>
        ) : (
          <>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            {parts.map((p, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                <span
                  className={
                    i === parts.length - 1
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }
                >
                  {p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " ")}
                </span>
              </span>
            ))}
          </>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-background rounded-[10px] px-3 py-2 w-[260px] border border-border/50 transition-colors hover:border-border">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[12px] text-muted-foreground">
            Search transactions...
          </span>
          <span className="ml-auto text-[10px] text-muted-foreground/50 bg-muted px-1.5 py-0.5 rounded-md">
            ⌘K
          </span>
        </div>
        <ThemeToggle />
        <button
          className="relative p-2 rounded-[10px] hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-card" />
        </button>
      </div>
    </header>
  );
}
