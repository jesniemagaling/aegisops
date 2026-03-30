"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  ChevronRight,
  X,
  AlertTriangle,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const searchablePages = [
  { label: "Dashboard", href: "/", keywords: ["home", "overview", "kpi"] },
  {
    label: "Transactions",
    href: "/transactions",
    keywords: ["payment", "transfer"],
  },
  {
    label: "Reconciliation",
    href: "/reconciliation",
    keywords: ["match", "recon", "compare"],
  },
  { label: "Alerts", href: "/alerts", keywords: ["notification", "warning"] },
  {
    label: "AI Copilot",
    href: "/ai",
    keywords: ["analysis", "insight", "copilot"],
  },
  {
    label: "Audit Logs",
    href: "/audit",
    keywords: ["log", "history", "event"],
  },
  { label: "Admin", href: "/admin", keywords: ["settings", "users", "config"] },
];

const recentNotifications = [
  {
    id: "ALT-4821",
    severity: "CRITICAL" as const,
    message: "Reconciliation mismatch rate exceeded 5% threshold",
    time: "12m ago",
  },
  {
    id: "ALT-4820",
    severity: "HIGH" as const,
    message: "SAP ingestion latency > 3s for 15 consecutive batches",
    time: "28m ago",
  },
  {
    id: "ALT-4819",
    severity: "MEDIUM" as const,
    message: "Duplicate transaction IDs detected in Oracle feed",
    time: "1h ago",
  },
  {
    id: "ALT-4818",
    severity: "LOW" as const,
    message: "Scheduled reconciliation run delayed by 5 minutes",
    time: "2h ago",
  },
  {
    id: "ALT-4817",
    severity: "HIGH" as const,
    message: "12 missing counterparty records in Plaid feed",
    time: "3h ago",
  },
];

const severityDot: Record<string, string> = {
  CRITICAL: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-blue-400",
};

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const parts = pathname.split("/").filter(Boolean);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  function handleLogout() {
    router.push("/login");
  }

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close notification dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  const filteredPages = searchQuery
    ? searchablePages.filter(
        (p) =>
          p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.keywords.some((k) =>
            k.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      )
    : searchablePages;

  function navigateTo(href: string) {
    router.push(href);
    setSearchOpen(false);
    setSearchQuery("");
  }

  return (
    <>
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 w-[260px] border border-border/50 transition-all hover:border-border hover:shadow-sm cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[12px] text-muted-foreground">Search...</span>
            <span className="ml-auto text-[10px] text-muted-foreground/60 bg-muted px-1.5 py-0.5 rounded font-mono">
              ⌘K
            </span>
          </button>
          <ThemeToggle />
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-card animate-pulse" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-[360px] bg-popover border border-border rounded-xl shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 duration-150 origin-top-right">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-[13px] text-foreground font-medium">
                    Notifications
                  </span>
                  <span className="text-[10px] bg-red-500/10 text-red-600 px-2 py-0.5 rounded-full font-medium">
                    {recentNotifications.length} new
                  </span>
                </div>
                <div className="max-h-[320px] overflow-auto">
                  {recentNotifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        setNotifOpen(false);
                        router.push(`/alerts?id=${n.id}`);
                      }}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border/30 last:border-0"
                    >
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${severityDot[n.severity] || "bg-muted"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-foreground leading-snug line-clamp-2">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {n.id}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {n.time}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="border-t border-border px-4 py-2.5">
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      router.push("/alerts");
                    }}
                    className="w-full flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors py-1"
                  >
                    View all alerts <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
          onClick={() => {
            setSearchOpen(false);
            setSearchQuery("");
          }}
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-popover border border-border rounded-xl shadow-2xl w-full max-w-[480px] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredPages.length > 0) {
                    navigateTo(filteredPages[0].href);
                  }
                }}
                placeholder="Search pages..."
                className="flex-1 bg-transparent py-3.5 text-[13px] text-foreground placeholder:text-muted-foreground outline-none border-none focus:ring-0"
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="p-1 rounded hover:bg-muted transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <div className="max-h-[300px] overflow-auto p-2">
              {filteredPages.length === 0 ? (
                <div className="py-8 text-center text-[12px] text-muted-foreground">
                  No results found
                </div>
              ) : (
                filteredPages.map((page) => (
                  <button
                    key={page.href}
                    onClick={() => navigateTo(page.href)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-[13px] rounded-lg transition-colors ${
                      pathname === page.href
                        ? "bg-muted text-foreground font-medium"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {page.label}
                    {pathname === page.href && (
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        Current
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
